// Debug Logger for el7lm system
export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  component: string;
  message: string;
  data?: unknown;
}

export interface SystemInfo {
  userAgent: string;
  url: string;
  timestamp: string;
  localStorage: string[];
  sessionStorage: string[];
  cookiesEnabled: boolean;
  onlineStatus: boolean;
}

export class DebugLogger {
  private static instance: DebugLogger;
  private logs: LogEntry[] = [];

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  private log(level: 'info' | 'warn' | 'error' | 'success', component: string, message: string, data?: unknown): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      data
    };

    this.logs.push(logEntry);

    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }

    // Console output with emojis
    const emoji = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      success: '✅'
    }[level];

    const style = {
      info: 'color: #3b82f6',
      warn: 'color: #f59e0b',
      error: 'color: #ef4444',
      success: 'color: #10b981'
    }[level];

    console.log(
      `%c${emoji} ${component} - ${message}`,
      style,
      data ? data : ''
    );
  }

  info(component: string, message: string, data?: unknown): void {
    this.log('info', component, message, data);
  }

  warn(component: string, message: string, data?: unknown): void {
    this.log('warn', component, message, data);
  }

  error(component: string, message: string, data?: unknown): void {
    this.log('error', component, message, data);
  }

  success(component: string, message: string, data?: unknown): void {
    this.log('success', component, message, data);
  }

  // Get all logs
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
    console.clear();
    this.info('DebugLogger', 'Logs cleared');
  }

  // Export logs as JSON
  exportLogs(): void {
    const logsJson = JSON.stringify(this.logs, null, 2);
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `el7lm-debug-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // System info
  getSystemInfo(): SystemInfo {
    return {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      localStorage: Object.keys(localStorage),
      sessionStorage: Object.keys(sessionStorage),
      cookiesEnabled: navigator.cookieEnabled,
      onlineStatus: navigator.onLine
    };
  }
}

// Global instance
export const debugLogger = DebugLogger.getInstance();

// Helper functions
export const logInfo = (component: string, message: string, data?: unknown) => 
  debugLogger.info(component, message, data);

export const logWarn = (component: string, message: string, data?: unknown) => 
  debugLogger.warn(component, message, data);

export const logError = (component: string, message: string, data?: unknown) => 
  debugLogger.error(component, message, data);

export const logSuccess = (component: string, message: string, data?: unknown) => 
  debugLogger.success(component, message, data);

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as Window & { 
    debugLogger?: DebugLogger;
    exportLogs?: () => void;
    clearLogs?: () => void;
    getSystemInfo?: () => SystemInfo;
  }).debugLogger = debugLogger;
  (window as Window & { 
    debugLogger?: DebugLogger;
    exportLogs?: () => void;
    clearLogs?: () => void;
    getSystemInfo?: () => SystemInfo;
  }).exportLogs = () => debugLogger.exportLogs();
  (window as Window & { 
    debugLogger?: DebugLogger;
    exportLogs?: () => void;
    clearLogs?: () => void;
    getSystemInfo?: () => SystemInfo;
  }).clearLogs = () => debugLogger.clearLogs();
  (window as Window & { 
    debugLogger?: DebugLogger;
    exportLogs?: () => void;
    clearLogs?: () => void;
    getSystemInfo?: () => SystemInfo;
  }).getSystemInfo = () => debugLogger.getSystemInfo();
} 
