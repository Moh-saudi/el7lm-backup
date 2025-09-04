/**
 * Image Loading Optimizer
 * Reduces browser intervention warnings and improves image loading performance
 * Waits for React hydration to complete to avoid hydration mismatches
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    lazyThreshold: 0.1, // Intersection Observer threshold
    preloadDistance: 100, // Preload images 100px before they enter viewport
    maxConcurrentLoads: 3, // Maximum concurrent image loads
    retryAttempts: 2, // Number of retry attempts for failed images
    defaultFallback: '/images/default-avatar.png'
  };

  // Image loading queue
  let loadingQueue = [];
  let activeLoads = 0;
  let isHydrated = false;

  // Fallback images for different types
  const FALLBACKS = {
    default: '/images/default-avatar.png',
    club: '/images/club-avatar.png',
    agent: '/images/agent-avatar.png',
    academy: '/images/academy-avatar.png'
  };

  // Wait for React hydration to complete
  function waitForHydration(callback) {
    // Check if React has hydrated
    if (window.React && document.querySelector('[data-reactroot]')) {
      isHydrated = true;
      setTimeout(callback, 100);
    } else {
      setTimeout(() => waitForHydration(callback), 50);
    }
  }

  /**
   * Get appropriate fallback based on image context
   */
  function getFallbackForImage(img) {
    const src = img.src || '';
    const alt = img.alt || '';
    const className = img.className || '';
    
    if (src.includes('club') || alt.includes('club') || className.includes('club')) {
      return FALLBACKS.club;
    }
    if (src.includes('agent') || alt.includes('agent') || className.includes('agent')) {
      return FALLBACKS.agent;
    }
    if (src.includes('academy') || alt.includes('academy') || className.includes('academy')) {
      return FALLBACKS.academy;
    }
    
    return FALLBACKS.default;
  }

  /**
   * Load image with retry logic
   */
  function loadImageWithRetry(img, retryCount = 0) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      
      image.onload = () => {
        resolve(image.src);
      };
      
      image.onerror = () => {
        if (retryCount < CONFIG.retryAttempts) {
          console.warn(`Retrying image load: ${img.src} (attempt ${retryCount + 1})`);
          setTimeout(() => {
            loadImageWithRetry(img, retryCount + 1).then(resolve).catch(reject);
          }, 1000 * (retryCount + 1)); // Exponential backoff
        } else {
          console.warn(`Image load failed after ${CONFIG.retryAttempts} attempts: ${img.src}`);
          reject(new Error('Image load failed'));
        }
      };
      
      image.src = img.src;
    });
  }

  /**
   * Process image loading queue
   */
  async function processQueue() {
    if (loadingQueue.length === 0 || activeLoads >= CONFIG.maxConcurrentLoads || !isHydrated) {
      return;
    }

    const img = loadingQueue.shift();
    activeLoads++;

    try {
      await loadImageWithRetry(img);
      if (isHydrated) {
        img.classList.remove('image-loading');
        img.classList.add('image-loaded');
      }
    } catch (error) {
      const fallback = getFallbackForImage(img);
      img.src = fallback;
      if (isHydrated) {
        img.classList.remove('image-loading');
        img.classList.add('image-fallback');
      }
    } finally {
      activeLoads--;
      processQueue(); // Process next item in queue
    }
  }

  /**
   * Add image to loading queue
   */
  function queueImage(img) {
    if (!img.dataset.queued && isHydrated) {
      img.dataset.queued = 'true';
      img.classList.add('image-loading');
      loadingQueue.push(img);
      processQueue();
    }
  }

  /**
   * Optimize existing images
   */
  function optimizeExistingImages() {
    if (!isHydrated) return;
    
    const images = document.querySelectorAll('img:not([data-optimized])');
    
    images.forEach(img => {
      img.dataset.optimized = 'true';
      
      // Skip already loaded images
      if (img.complete && img.naturalHeight > 0) {
        img.classList.add('image-loaded');
        return;
      }

      // Add loading="lazy" if not already set
      if (!img.loading) {
        img.loading = 'lazy';
      }

      // Add decoding="async" for better performance
      img.decoding = 'async';

      // Add error handler
      img.onerror = () => {
        const fallback = getFallbackForImage(img);
        if (img.src !== fallback) {
          img.src = fallback;
          if (isHydrated) {
            img.classList.add('image-fallback');
          }
        }
      };

      // Add load handler
      img.onload = () => {
        if (isHydrated) {
          img.classList.remove('image-loading');
          img.classList.add('image-loaded');
        }
      };
    });
  }

  /**
   * Setup Intersection Observer for lazy loading
   */
  function setupLazyLoading() {
    if (!isHydrated) return null;
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          queueImage(img);
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: `${CONFIG.preloadDistance}px`,
      threshold: CONFIG.lazyThreshold
    });

    // Observe all images
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      imageObserver.observe(img);
    });

    return imageObserver;
  }

  /**
   * Watch for dynamically added images
   */
  function watchDynamicImages() {
    if (!isHydrated) return null;
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the added node is an image
            if (node.tagName === 'IMG') {
              optimizeExistingImages();
            }
            // Check for images inside the added node
            const images = node.querySelectorAll ? node.querySelectorAll('img') : [];
            if (images.length > 0) {
              optimizeExistingImages();
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return observer;
  }

  /**
   * Add CSS for image states
   */
  function addImageStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .image-loading {
        opacity: 0.6;
        transition: opacity 0.3s ease;
      }
      
      .image-loaded {
        opacity: 1;
        transition: opacity 0.3s ease;
      }
      
      .image-fallback {
        opacity: 0.8;
        filter: grayscale(20%);
      }
      
      img[loading="lazy"] {
        transition: opacity 0.3s ease;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Initialize the optimizer
   */
  function init() {
    console.log('🖼️ Initializing Image Loading Optimizer after hydration...');
    
    // Add styles
    addImageStyles();
    
    // Optimize existing images
    optimizeExistingImages();
    
    // Setup lazy loading
    const imageObserver = setupLazyLoading();
    
    // Watch for dynamic images
    const mutationObserver = watchDynamicImages();
    
    // Re-optimize after a delay to catch any missed images
    setTimeout(optimizeExistingImages, 1000);
    setTimeout(optimizeExistingImages, 3000);
    
    console.log('✅ Image Loading Optimizer initialized after hydration');
    
    // Cleanup function
    return () => {
      if (imageObserver) imageObserver.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
    };
  }

  // Wait for DOM and then hydration
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      waitForHydration(init);
    });
  } else {
    waitForHydration(init);
  }

  // Export for debugging
  window.imageOptimizer = {
    init,
    optimizeExistingImages,
    queueImage,
    processQueue,
    isHydrated: () => isHydrated
  };

})(); 
