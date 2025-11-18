/**
 * MakeItAccessible - Main Accessibility Controller
 * Coordinates all accessibility features
 */

class AccessibilityController {
  constructor() {
    this.state = {
      fontSize: 100,
      highContrast: false,
      darkMode: false,
      readingMode: false,
      tts: false,
      readingGuide: false,
      colorBlindMode: 'none'
    };
    
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.applySettings();
    this.setupMessageListener();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.local.get([
        'fontSize',
        'highContrast',
        'darkMode',
        'readingMode',
        'tts',
        'readingGuide',
        'colorBlindMode'
      ]);
      
      Object.assign(this.state, result);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  applySettings() {
    if (this.state.fontSize !== 100) {
      window.visualEnhancements.updateFontSize(this.state.fontSize);
    }
    
    if (this.state.highContrast) {
      window.visualEnhancements.toggleHighContrast(true);
    }
    
    if (this.state.darkMode) {
      window.visualEnhancements.toggleDarkMode(true);
    }
    
    if (this.state.readingMode) {
      window.visualEnhancements.toggleReadingMode(true);
    }
    
    if (this.state.readingGuide) {
      window.visualEnhancements.toggleReadingGuide(true);
    }
    
    if (this.state.colorBlindMode !== 'none') {
      window.visualEnhancements.updateColorBlindMode(this.state.colorBlindMode);
    }
    
    if (this.state.tts) {
      window.audioFeatures.enableTextToSpeech(true);
    }
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      const { action, data } = request;
      
      if (data?.state) {
        this.state = data.state;
      }
      
      switch (action) {
        case 'toggleHighContrast':
          window.visualEnhancements.toggleHighContrast(this.state.highContrast);
          break;
        case 'toggleDarkMode':
          window.visualEnhancements.toggleDarkMode(this.state.darkMode);
          break;
        case 'toggleReadingMode':
          window.visualEnhancements.toggleReadingMode(this.state.readingMode);
          break;
        case 'toggleReadingGuide':
          window.visualEnhancements.toggleReadingGuide(this.state.readingGuide);
          break;
        case 'updateFontSize':
          window.visualEnhancements.updateFontSize(this.state.fontSize);
          break;
        case 'updateColorBlindMode':
          window.visualEnhancements.updateColorBlindMode(this.state.colorBlindMode);
          break;
        case 'toggleTTS':
          window.audioFeatures.enableTextToSpeech(this.state.tts);
          break;
      }
      
      sendResponse({ success: true });
    });
  }
}

// Initialize controller when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityController = new AccessibilityController();
  });
} else {
  window.accessibilityController = new AccessibilityController();
}
