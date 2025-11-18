/**
 * MakeItAccessible - Audio Features Module
 * Handles text-to-speech and audio accessibility features
 */

class AudioFeatures {
  constructor() {
    this.ttsEnabled = false;
    this.synth = window.speechSynthesis;
    this.currentUtterance = null;
    this.selectionHandler = null;
    this.init();
  }

  init() {
    this.setupContextMenu();
  }

  /**
   * Enable or disable text-to-speech
   */
  enableTextToSpeech(enabled) {
    this.ttsEnabled = enabled;
    
    if (enabled) {
      this.attachSelectionListener();
      this.addTTSButton();
    } else {
      this.removeSelectionListener();
      this.removeTTSButton();
      this.stopSpeaking();
    }
  }

  /**
   * Attach listener for text selection
   */
  attachSelectionListener() {
    if (this.selectionHandler) return;
    
    this.selectionHandler = () => {
      const selection = window.getSelection().toString().trim();
      
      if (selection.length > 0) {
        this.showTTSButton(selection);
      } else {
        this.hideTTSButton();
      }
    };
    
    document.addEventListener('mouseup', this.selectionHandler);
    document.addEventListener('keyup', this.selectionHandler);
  }

  /**
   * Remove selection listener
   */
  removeSelectionListener() {
    if (this.selectionHandler) {
      document.removeEventListener('mouseup', this.selectionHandler);
      document.removeEventListener('keyup', this.selectionHandler);
      this.selectionHandler = null;
    }
  }

  /**
   * Create and add TTS button
   */
  addTTSButton() {
    if (document.getElementById('makeitaccessible-tts-button')) return;
    
    const button = document.createElement('button');
    button.id = 'makeitaccessible-tts-button';
    button.innerHTML = '🔊';
    button.setAttribute('aria-label', 'Read selected text');
    button.style.cssText = `
      position: absolute;
      display: none;
      background: #6200ee;
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      font-size: 20px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      z-index: 999999;
      transition: all 0.2s ease;
    `;
    
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1)';
      button.style.boxShadow = '0 4px 12px rgba(98, 0, 238, 0.4)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
    });
    
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const text = window.getSelection().toString().trim();
      this.speak(text);
    });
    
    document.body.appendChild(button);
  }

  /**
   * Remove TTS button
   */
  removeTTSButton() {
    const button = document.getElementById('makeitaccessible-tts-button');
    if (button) {
      button.remove();
    }
  }

  /**
   * Show TTS button near selection
   */
  showTTSButton(text) {
    const button = document.getElementById('makeitaccessible-tts-button');
    if (!button || text.length === 0) return;
    
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    button.style.display = 'block';
    button.style.left = `${rect.left + window.scrollX + (rect.width / 2) - 20}px`;
    button.style.top = `${rect.top + window.scrollY - 50}px`;
  }

  /**
   * Hide TTS button
   */
  hideTTSButton() {
    const button = document.getElementById('makeitaccessible-tts-button');
    if (button) {
      button.style.display = 'none';
    }
  }

  /**
   * Speak the provided text
   */
  speak(text) {
    if (!text || !this.synth) return;
    
    // Stop any current speech
    this.stopSpeaking();
    
    // Create new utterance
    this.currentUtterance = new SpeechSynthesisUtterance(text);
    
    // Configure utterance
    this.currentUtterance.rate = 1.0;
    this.currentUtterance.pitch = 1.0;
    this.currentUtterance.volume = 1.0;
    
    // Get preferred voice (use first available)
    const voices = this.synth.getVoices();
    if (voices.length > 0) {
      // Prefer English voices
      const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
      this.currentUtterance.voice = englishVoice || voices[0];
    }
    
    // Event handlers
    this.currentUtterance.onstart = () => {
      this.updateButtonIcon('⏸️');
    };
    
    this.currentUtterance.onend = () => {
      this.updateButtonIcon('🔊');
      this.currentUtterance = null;
    };
    
    this.currentUtterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.updateButtonIcon('🔊');
      this.currentUtterance = null;
    };
    
    // Speak
    this.synth.speak(this.currentUtterance);
  }

  /**
   * Stop speaking
   */
  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
      this.updateButtonIcon('🔊');
    }
  }

  /**
   * Update TTS button icon
   */
  updateButtonIcon(icon) {
    const button = document.getElementById('makeitaccessible-tts-button');
    if (button) {
      button.innerHTML = icon;
    }
  }

  /**
   * Setup context menu for TTS
   */
  setupContextMenu() {
    // Context menu will be handled by background script
    document.addEventListener('contextmenu', (e) => {
      const selection = window.getSelection().toString().trim();
      
      chrome.runtime.sendMessage({
        action: 'updateContextMenu',
        hasSelection: selection.length > 0
      });
    });
  }

  /**
   * Read entire page content
   */
  readPage() {
    const textContent = this.extractPageText();
    if (textContent) {
      this.speak(textContent);
    }
  }

  /**
   * Extract readable text from page
   */
  extractPageText() {
    // Get main content
    const main = document.querySelector('main, article, [role="main"]');
    const contentElement = main || document.body;
    
    // Clone to avoid modifying original
    const clone = contentElement.cloneNode(true);
    
    // Remove unwanted elements
    const unwanted = clone.querySelectorAll('script, style, nav, aside, .ad, [class*="ad-"]');
    unwanted.forEach(el => el.remove());
    
    // Get text content
    return clone.textContent.trim();
  }
}

// Initialize and expose globally
window.audioFeatures = new AudioFeatures();
