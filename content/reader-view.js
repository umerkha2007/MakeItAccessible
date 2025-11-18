/**
 * MakeItAccessible - Reader View Module
 * Provides distraction-free reading by identifying and isolating main content
 */

class ReaderView {
  constructor() {
    this.isActive = false;
    this.originalDisplay = new Map();
    this.mainContent = null;
    this.readerOverlay = null;
  }

  /**
   * Toggle reader view on/off
   */
  toggle(enabled) {
    if (enabled) {
      this.activate();
    } else {
      this.deactivate();
    }
    this.isActive = enabled;
  }

  /**
   * Activate reader view
   */
  activate() {
    // Find the main content
    this.mainContent = this.findMainContent();
    
    if (!this.mainContent) {
      console.warn('Could not identify main content for reader view');
      return;
    }

    // Hide distracting elements
    this.hideDistractingElements();
    
    // Create and show reader overlay
    this.createReaderOverlay();
    
    // Apply reader styles to main content
    this.applyReaderStyles();
  }

  /**
   * Deactivate reader view
   */
  deactivate() {
    // Restore hidden elements
    this.restoreHiddenElements();
    
    // Remove reader overlay
    if (this.readerOverlay) {
      this.readerOverlay.remove();
      this.readerOverlay = null;
    }
    
    // Remove reader styles
    document.documentElement.classList.remove('makeitaccessible-reader-active');
    
    // Clear stored display values
    this.originalDisplay.clear();
    this.mainContent = null;
  }

  /**
   * Find the main content of the page using heuristics
   */
  findMainContent() {
    // Strategy 1: Look for semantic HTML5 elements
    const semanticSelectors = [
      'article',
      'main',
      '[role="main"]',
      '[role="article"]',
      '.article',
      '.post-content',
      '.entry-content',
      '.post',
      '#content article',
      '#main article'
    ];

    for (const selector of semanticSelectors) {
      const element = document.querySelector(selector);
      if (element && this.isValidMainContent(element)) {
        return element;
      }
    }

    // Strategy 2: Find element with most text content
    const candidates = document.querySelectorAll('div, section, article');
    let bestCandidate = null;
    let maxScore = 0;

    candidates.forEach(element => {
      const score = this.calculateContentScore(element);
      if (score > maxScore) {
        maxScore = score;
        bestCandidate = element;
      }
    });

    return bestCandidate;
  }

  /**
   * Check if an element is valid main content
   */
  isValidMainContent(element) {
    const textLength = element.textContent.trim().length;
    const hasMinimumText = textLength > 300;
    const hasParagraphs = element.querySelectorAll('p').length >= 2;
    
    return hasMinimumText && hasParagraphs;
  }

  /**
   * Calculate content score for an element
   */
  calculateContentScore(element) {
    let score = 0;
    
    // Text content length
    const textLength = element.textContent.trim().length;
    score += Math.min(textLength / 100, 50);
    
    // Number of paragraphs
    const paragraphs = element.querySelectorAll('p');
    score += paragraphs.length * 5;
    
    // Headings
    const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    score += headings.length * 3;
    
    // Deduct points for ads and navigation
    const ads = element.querySelectorAll('[class*="ad"], [id*="ad"], [class*="banner"]');
    score -= ads.length * 10;
    
    const navs = element.querySelectorAll('nav, [role="navigation"]');
    score -= navs.length * 5;
    
    // Bonus for semantic elements
    if (element.tagName === 'ARTICLE') score += 20;
    if (element.tagName === 'MAIN') score += 20;
    if (element.getAttribute('role') === 'main') score += 15;
    
    return score;
  }

  /**
   * Hide distracting elements
   */
  hideDistractingElements() {
    // Selectors for common distracting elements
    const distractingSelectors = [
      'body > header',  // Only page headers, not content headers
      'footer',
      'nav',
      'aside',
      '[role="banner"]',
      '[role="navigation"]',
      '[role="complementary"]',
      '[role="contentinfo"]',
      '.sidebar',
      '.side-bar',
      '.nav',
      '.navigation',
      '.menu',
      '.footer',
      '.advertisement',
      '.ad',
      '.ads',
      '[class*="ad-"]',
      '[id*="ad-"]',
      '[class*="banner"]',
      '[id*="banner"]',
      '[class*="sidebar"]',
      '[id*="sidebar"]',
      '[class*="widget"]',
      '[class*="social"]',
      '[class*="share"]',
      '[class*="related"]',
      '[class*="recommend"]',
      '.comments',
      '#comments',
      '[id*="comment"]',
      '[class*="popup"]',
      '[class*="modal"]',
      '[class*="overlay"]'
    ];

    // Hide all matching elements except those inside main content
    distractingSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        // Don't hide if it's the main content or inside main content
        if (this.mainContent && 
            (element === this.mainContent || this.mainContent.contains(element))) {
          return;
        }
        
        // Store original display value
        const computedStyle = window.getComputedStyle(element);
        this.originalDisplay.set(element, computedStyle.display);
        
        // Hide the element
        element.style.setProperty('display', 'none', 'important');
      });
    });

    // Hide all direct children of body except main content and its ancestors
    const bodyChildren = Array.from(document.body.children);
    bodyChildren.forEach(child => {
      // Skip if it's the reader overlay or inside main content lineage
      if (child.id === 'makeitaccessible-reader-overlay') return;
      if (this.mainContent && (child === this.mainContent || child.contains(this.mainContent))) return;
      
      // Store and hide
      const computedStyle = window.getComputedStyle(child);
      if (!this.originalDisplay.has(child)) {
        this.originalDisplay.set(child, computedStyle.display);
      }
      child.style.setProperty('display', 'none', 'important');
    });
  }

  /**
   * Restore hidden elements
   */
  restoreHiddenElements() {
    this.originalDisplay.forEach((displayValue, element) => {
      element.style.display = displayValue;
    });
  }

  /**
   * Create reader overlay with main content
   */
  createReaderOverlay() {
    // Create overlay container
    this.readerOverlay = document.createElement('div');
    this.readerOverlay.id = 'makeitaccessible-reader-overlay';
    this.readerOverlay.className = 'makeitaccessible-reader-overlay';
    
    // Clone main content
    const contentClone = this.mainContent.cloneNode(true);
    
    // Remove distracting elements from the clone
    this.cleanClonedContent(contentClone);
    
    // Apply reader content class
    contentClone.className = 'makeitaccessible-reader-content';
    
    // Debug: Log heading count
    const headings = contentClone.querySelectorAll('h1, h2, h3, h4, h5, h6');
    console.log(`Reader View: Found ${headings.length} headings in cloned content`);
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'makeitaccessible-reader-close';
    closeButton.innerHTML = '✕';
    closeButton.setAttribute('aria-label', 'Exit reader view');
    closeButton.addEventListener('click', async () => {
      // Deactivate reader view
      this.deactivate();
      
      // Update storage to reflect the change
      if (typeof chrome !== 'undefined' && chrome?.storage?.local) {
        try {
          await chrome.storage.local.set({ readingMode: false });
        } catch (error) {
          console.error('Error updating storage:', error);
        }
      }
    });
    
    // Add elements to overlay
    this.readerOverlay.appendChild(closeButton);
    this.readerOverlay.appendChild(contentClone);
    
    // Add to body
    document.body.appendChild(this.readerOverlay);
  }

  /**
   * Clean distracting elements from cloned content
   */
  cleanClonedContent(clone) {
    // First, mark all headings and their parent containers to protect them
    const headings = clone.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const protectedElements = new Set();
    
    headings.forEach(heading => {
      protectedElements.add(heading);
      // Protect parent containers up to 2 levels
      let parent = heading.parentElement;
      if (parent) {
        protectedElements.add(parent);
        if (parent.parentElement) {
          protectedElements.add(parent.parentElement);
        }
      }
    });
    
    // Remove distracting elements but preserve headings and their containers
    const selectorsToRemove = [
      'nav',
      'aside',
      'footer',
      '.advertisement',
      '.ad',
      '.ads',
      '[class*="sidebar"]',
      '[id*="sidebar"]',
      '[class*="widget"]',
      '[class*="social"]',
      '[class*="share"]',
      '[class*="related"]',
      '[class*="recommend"]',
      '.comments',
      '#comments',
      '[id*="comment"]',
      'iframe[src*="ad"]',
      'iframe[src*="banner"]'
    ];

    selectorsToRemove.forEach(selector => {
      try {
        const elements = clone.querySelectorAll(selector);
        elements.forEach(el => {
          // Don't remove if it's protected
          if (protectedElements.has(el)) {
            return;
          }
          // Don't remove if it IS a heading
          if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(el.tagName)) {
            return;
          }
          // Don't remove if it contains headings
          const hasHeadings = el.querySelector('h1, h2, h3, h4, h5, h6');
          if (hasHeadings) {
            return;
          }
          // Safe to remove
          el.remove();
        });
      } catch (e) {
        // Skip invalid selectors
        console.warn('Reader View: Invalid selector', selector, e);
      }
    });
    
    // Specifically look for and remove header elements that don't contain headings
    const headers = clone.querySelectorAll('header');
    headers.forEach(header => {
      // Skip if protected
      if (protectedElements.has(header)) {
        return;
      }
      const hasHeadings = header.querySelector('h1, h2, h3, h4, h5, h6');
      if (!hasHeadings) {
        header.remove();
      }
    });
    
    // Log for debugging
    const remainingHeadings = clone.querySelectorAll('h1, h2, h3, h4, h5, h6');
    console.log(`Reader View: After cleaning, ${remainingHeadings.length} headings remain`);
  }

  /**
   * Apply reader-friendly styles
   */
  applyReaderStyles() {
    document.documentElement.classList.add('makeitaccessible-reader-active');
  }
}

// Initialize and expose globally
window.readerView = new ReaderView();
