/**
 * Advanced Image Fix Script
 * Handles image loading errors and provides fallbacks
 * Waits for React hydration to complete
 */

(function() {
  'use strict';
  
  const DEFAULT_AVATAR = '/default-avatar.png';
  const CLUB_AVATAR = '/club-avatar.png';
  const AGENT_AVATAR = '/agent-avatar.png';

  // Wait for React hydration to complete
  function waitForHydration(callback) {
    // Check if React has hydrated
    if (window.React && document.querySelector('[data-reactroot]')) {
      // Wait a bit more to ensure hydration is complete
      setTimeout(callback, 100);
    } else {
      // Check again after a short delay
      setTimeout(() => waitForHydration(callback), 50);
    }
  }

  // Handle image errors
  function handleImageError(img) {
    const src = img.src;
    
    // Prevent infinite loops
    if (src.includes('default-avatar.png') || 
        src.includes('club-avatar.png') || 
        src.includes('agent-avatar.png')) {
      return;
    }

    // Choose appropriate fallback
    if (src.includes('club')) {
      img.src = CLUB_AVATAR;
    } else if (src.includes('agent')) {
      img.src = AGENT_AVATAR;
    } else {
      img.src = DEFAULT_AVATAR;
    }

    // Add error class for styling (only after hydration)
    if (!img.classList.contains('image-error')) {
      img.classList.add('image-error');
    }
  }

  // Fix existing images
  function fixExistingImages() {
    const images = document.getElementsByTagName('img');
    for (const img of images) {
      if (!img.complete || img.naturalHeight === 0) {
        handleImageError(img);
      }
    }
  }

  // Watch for future images
  function watchNewImages() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'IMG') {
            node.onerror = () => handleImageError(node);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Initialize after hydration
  function init() {
    // Add error handlers to existing images
    const images = document.getElementsByTagName('img');
    for (const img of images) {
      img.onerror = () => handleImageError(img);
    }
    
    // Initial fix
    fixExistingImages();
    
    // Watch for new images
    watchNewImages();
    
    // Recheck after dynamic content loads
    setTimeout(fixExistingImages, 1000);
    setTimeout(fixExistingImages, 3000);
  }

  // Add CSS for error state
  function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .image-error {
        opacity: 0.9;
        border: 1px solid #eee;
      }
    `;
    document.head.appendChild(style);
  }

  // Wait for DOM and then hydration
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      addStyles();
      waitForHydration(init);
    });
  } else {
    addStyles();
    waitForHydration(init);
  }

})(); 
