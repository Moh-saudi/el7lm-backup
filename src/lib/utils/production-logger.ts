// Production-safe logging system
// src/lib/utils/production-logger.ts

import { LogEntry } from '../../types/common';

export interface LogData {
  [key: string]: unknown;
}

export interface LogError extends Error {
  code?: string;
  details?: Record<string, unknown>;
}

export class ProductionLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';
  private loggingServiceUrl = process.env.LOGGING_SERVICE_URL;

  debug(component: string, message: string, data?: LogData): void {
    if (this.isDevelopment) {
      console.log(`🔍 [${component}] ${message}`, data || '');
    }
  }

  info(component: string, message: string, data?: LogData): void {
    if (this.isDevelopment) {
      console.info(`ℹ️ [${component}] ${message}`, data || '');
    }
    this.sendToLoggingService('info', component, message, data);
  }

  warn(component: string, message: string, data?: LogData): void {
    if (this.isDevelopment) {
      console.warn(`⚠️ [${component}] ${message}`, data || '');
    }
    this.sendToLoggingService('warn', component, message, data);
  }

  error(component: string, message: string, error?: LogError): void {
    if (this.isDevelopment) {
      console.error(`❌ [${component}] ${message}`, error || '');
    }
    this.sendToLoggingService('error', component, message, { error: this.sanitizeError(error) });
  }

  success(component: string, message: string, data?: LogData): void {
    if (this.isDevelopment) {
      console.log(`✅ [${component}] ${message}`, data || '');
    }
    this.sendToLoggingService('success', component, message, data);
  }

  private sendToLoggingService(level: string, component: string, message: string, data?: LogData): void {
    if (!this.loggingServiceUrl || !this.isProduction) return;

    try {
      const logEntry: LogEntry = {
        level: level as LogEntry['level'],
        component,
        message,
        data: data ? this.sanitizeData(data) : undefined,
        timestamp: new Date(),
        userId: this.getCurrentUserId(),
        sessionId: this.getCurrentSessionId()
      };

      // Send to external logging service
      fetch(this.loggingServiceUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry)
      }).catch(() => {
        // Silently fail if logging service is unavailable
      });
    } catch (error) {
      // Silently fail if logging fails
    }
  }

  private sanitizeData(data: LogData): Record<string, unknown> {
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
    const sanitized: Record<string, unknown> = {};

    const sanitize = (obj: unknown): unknown => {
      if (obj === null || obj === undefined) return obj;
      if (typeof obj !== 'object') return obj;

      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }

      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        const lowerKey = key.toLowerCase();
        const isSensitive = sensitiveFields.some(field => lowerKey.includes(field));
        
        if (isSensitive) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = sanitize(value);
        }
      }
      return sanitized;
    };

    return sanitize(data) as Record<string, unknown>;
  }

  private sanitizeError(error?: LogError): Record<string, unknown> {
    if (!error) return {};

    return {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: this.isDevelopment ? error.stack : '[REDACTED]',
      details: error.details ? this.sanitizeData(error.details) : undefined
    };
  }

  private getCurrentUserId(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    
    try {
      // Try to get user ID from localStorage or sessionStorage
      return localStorage.getItem('userId') || sessionStorage.getItem('userId') || undefined;
    } catch {
      return undefined;
    }
  }

  private getCurrentSessionId(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    
    try {
      return sessionStorage.getItem('sessionId') || undefined;
    } catch {
      return undefined;
    }
  }

  cleanConsole(): void {
    if (this.isProduction) {
      if (typeof window !== 'undefined') {
        window.console.log = () => {};
        window.console.debug = () => {};
        window.console.info = () => {};
      }
    }
  }
}

export const productionLogger = new ProductionLogger();

// Convenience functions
export const logDebug = (component: string, message: string, data?: LogData) =>
  productionLogger.debug(component, message, data);

export const logInfo = (component: string, message: string, data?: LogData) =>
  productionLogger.info(component, message, data);

export const logWarn = (component: string, message: string, data?: LogData) =>
  productionLogger.warn(component, message, data);

export const logError = (component: string, message: string, error?: LogError) =>
  productionLogger.error(component, message, error);

export const logSuccess = (component: string, message: string, data?: LogData) =>
  productionLogger.success(component, message, data);

// Clean console in production
productionLogger.cleanConsole(); 
