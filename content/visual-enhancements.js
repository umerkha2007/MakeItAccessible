/**
 * MakeItAccessible - Visual Enhancements Module
 * Handles all visual accessibility features
 */

class VisualEnhancements {
  constructor() {
    this.styleElement = null;
    this.readingGuideElement = null;
    this.init();
  }

  init() {
    this.createStyleElement();
  }

  createStyleElement() {
    this.styleElement = document.createElement('style');
    this.styleElement.id = 'makeitaccessible-styles';
    document.head.appendChild(this.styleElement);
  }

  /**
   * Update font size across the page
   */
  updateFontSize(percentage) {
    const scale = percentage / 100;
    
    if (percentage === 100) {
      document.documentElement.classList.remove('makeitaccessible-font-scaled');
      this.addStyles('');
      return;
    }
    
    this.addStyles(`
      html.makeitaccessible-font-scaled {
        font-size: ${scale * 100}% !important;
      }
    `);
    
    document.documentElement.classList.add('makeitaccessible-font-scaled');
  }

  /**
   * Toggle high contrast mode
   */
  toggleHighContrast(enabled) {
    if (enabled) {
      this.addStyles(`
        html.makeitaccessible-high-contrast,
        html.makeitaccessible-high-contrast * {
          background-color: #000 !important;
          color: #fff !important;
          border-color: #fff !important;
          box-shadow: none !important;
          text-shadow: none !important;
        }
        
        html.makeitaccessible-high-contrast a {
          color: #ffff00 !important;
        }
        
        html.makeitaccessible-high-contrast button,
        html.makeitaccessible-high-contrast input,
        html.makeitaccessible-high-contrast select,
        html.makeitaccessible-high-contrast textarea {
          border: 2px solid #fff !important;
        }
        
        html.makeitaccessible-high-contrast img,
        html.makeitaccessible-high-contrast video {
          filter: contrast(1.2) !important;
        }
      `);
      
      document.documentElement.classList.add('makeitaccessible-high-contrast');
    } else {
      document.documentElement.classList.remove('makeitaccessible-high-contrast');
    }
  }

  /**
   * Toggle dark mode
   */
  toggleDarkMode(enabled) {
    if (enabled) {
      this.addStyles(`
        html.makeitaccessible-dark-mode,
        html.makeitaccessible-dark-mode * {
          background-color: #1a1a1a !important;
          color: #e0e0e0 !important;
          border-color: #444 !important;
        }
        
        html.makeitaccessible-dark-mode a {
          color: #66b3ff !important;
        }
        
        html.makeitaccessible-dark-mode img,
        html.makeitaccessible-dark-mode video {
          filter: brightness(0.8) !important;
        }
        
        html.makeitaccessible-dark-mode input,
        html.makeitaccessible-dark-mode select,
        html.makeitaccessible-dark-mode textarea {
          background-color: #2a2a2a !important;
          color: #e0e0e0 !important;
          border-color: #555 !important;
        }
      `);
      
      document.documentElement.classList.add('makeitaccessible-dark-mode');
    } else {
      document.documentElement.classList.remove('makeitaccessible-dark-mode');
    }
  }

  /**
   * Toggle reading mode
   */
  toggleReadingMode(enabled) {
    if (enabled) {
      this.addStyles(`
        html.makeitaccessible-reading-mode * {
          font-family: 'Georgia', 'Times New Roman', serif !important;
          line-height: 1.8 !important;
          letter-spacing: 0.03em !important;
        }
        
        html.makeitaccessible-reading-mode body {
          max-width: 800px !important;
          margin: 0 auto !important;
          padding: 40px 20px !important;
          background: #f5f5f5 !important;
        }
        
        html.makeitaccessible-reading-mode h1,
        html.makeitaccessible-reading-mode h2,
        html.makeitaccessible-reading-mode h3,
        html.makeitaccessible-reading-mode h4,
        html.makeitaccessible-reading-mode h5,
        html.makeitaccessible-reading-mode h6 {
          margin-top: 1.5em !important;
          margin-bottom: 0.5em !important;
        }
        
        html.makeitaccessible-reading-mode p {
          margin-bottom: 1.2em !important;
        }
        
        html.makeitaccessible-reading-mode aside,
        html.makeitaccessible-reading-mode nav,
        html.makeitaccessible-reading-mode .sidebar,
        html.makeitaccessible-reading-mode .ad,
        html.makeitaccessible-reading-mode [class*="ad-"],
        html.makeitaccessible-reading-mode [id*="ad-"] {
          display: none !important;
        }
      `);
      
      document.documentElement.classList.add('makeitaccessible-reading-mode');
    } else {
      document.documentElement.classList.remove('makeitaccessible-reading-mode');
    }
  }

  /**
   * Toggle reading guide
   */
  toggleReadingGuide(enabled) {
    if (enabled) {
      if (!this.readingGuideElement) {
        this.createReadingGuide();
      }
      this.readingGuideElement.style.display = 'block';
    } else {
      if (this.readingGuideElement) {
        this.readingGuideElement.style.display = 'none';
      }
    }
  }

  createReadingGuide() {
    this.readingGuideElement = document.createElement('div');
    this.readingGuideElement.id = 'makeitaccessible-reading-guide';
    this.readingGuideElement.style.cssText = `
      position: fixed;
      left: 0;
      right: 0;
      height: 3px;
      background: rgba(98, 0, 238, 0.6);
      box-shadow: 0 0 10px rgba(98, 0, 238, 0.8);
      pointer-events: none;
      z-index: 999999;
      transition: top 0.1s ease-out;
    `;
    
    document.body.appendChild(this.readingGuideElement);
    
    document.addEventListener('mousemove', (e) => {
      if (this.readingGuideElement.style.display !== 'none') {
        this.readingGuideElement.style.top = e.clientY + 'px';
      }
    });
  }

  /**
   * Update color blind mode
   */
  updateColorBlindMode(mode) {
    const filters = {
      none: 'none',
      protanopia: 'url(#protanopia)',
      deuteranopia: 'url(#deuteranopia)',
      tritanopia: 'url(#tritanopia)',
      achromatopsia: 'grayscale(100%)'
    };
    
    if (mode === 'none') {
      document.documentElement.classList.remove('makeitaccessible-colorblind');
      return;
    }
    
    // For SVG-based filters (protanopia, deuteranopia, tritanopia)
    if (mode !== 'achromatopsia') {
      this.createColorBlindFilters();
    }
    
    this.addStyles(`
      html.makeitaccessible-colorblind body {
        filter: ${filters[mode]} !important;
      }
    `);
    
    document.documentElement.classList.add('makeitaccessible-colorblind');
  }

  createColorBlindFilters() {
    let svg = document.getElementById('makeitaccessible-colorblind-filters');
    
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.id = 'makeitaccessible-colorblind-filters';
      svg.style.cssText = 'position: absolute; width: 0; height: 0;';
      svg.innerHTML = `
        <defs>
          <filter id="protanopia">
            <feColorMatrix type="matrix" values="0.567, 0.433, 0,     0, 0
                                                   0.558, 0.442, 0,     0, 0
                                                   0,     0.242, 0.758, 0, 0
                                                   0,     0,     0,     1, 0"/>
          </filter>
          <filter id="deuteranopia">
            <feColorMatrix type="matrix" values="0.625, 0.375, 0,   0, 0
                                                   0.7,   0.3,   0,   0, 0
                                                   0,     0.3,   0.7, 0, 0
                                                   0,     0,     0,   1, 0"/>
          </filter>
          <filter id="tritanopia">
            <feColorMatrix type="matrix" values="0.95, 0.05,  0,     0, 0
                                                   0,    0.433, 0.567, 0, 0
                                                   0,    0.475, 0.525, 0, 0
                                                   0,    0,     0,     1, 0"/>
          </filter>
        </defs>
      `;
      document.body.appendChild(svg);
    }
  }

  /**
   * Helper method to add styles
   */
  addStyles(css) {
    if (this.styleElement) {
      this.styleElement.textContent = css;
    }
  }
}

// Initialize and expose globally
window.visualEnhancements = new VisualEnhancements();
