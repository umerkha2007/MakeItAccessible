/**
 * MakeItAccessible - Popup Script
 * Handles user interactions and state management for the popup interface
 */

// State management
const state = {
  fontSize: 100,
  highContrast: false,
  darkMode: false,
  readingMode: false,
  tts: false,
  readingGuide: false,
  colorBlindMode: 'none'
};

// DOM Elements
const elements = {
  // Quick Actions
  toggleHighContrast: document.getElementById('toggleHighContrast'),
  toggleDarkMode: document.getElementById('toggleDarkMode'),
  toggleReadingMode: document.getElementById('toggleReadingMode'),
  toggleTTS: document.getElementById('toggleTTS'),
  
  // Status displays
  contrastStatus: document.getElementById('contrastStatus'),
  darkModeStatus: document.getElementById('darkModeStatus'),
  readingModeStatus: document.getElementById('readingModeStatus'),
  ttsStatus: document.getElementById('ttsStatus'),
  
  // Font controls
  increaseFont: document.getElementById('increaseFont'),
  decreaseFont: document.getElementById('decreaseFont'),
  fontSizeValue: document.getElementById('fontSizeValue'),
  
  // Other controls
  colorBlindMode: document.getElementById('colorBlindMode'),
  toggleReadingGuide: document.getElementById('toggleReadingGuide'),
  openSettings: document.getElementById('openSettings')
};

/**
 * Initialize the popup
 */
async function init() {
  await loadSettings();
  updateUI();
  attachEventListeners();
}

/**
 * Load settings from Chrome storage
 */
async function loadSettings() {
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
    
    // Update state with stored values
    Object.assign(state, result);
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

/**
 * Save settings to Chrome storage
 */
async function saveSettings() {
  try {
    await chrome.storage.local.set(state);
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

/**
 * Update UI to reflect current state
 */
function updateUI() {
  // Update quick action buttons
  updateActionButton(elements.toggleHighContrast, state.highContrast, elements.contrastStatus);
  updateActionButton(elements.toggleDarkMode, state.darkMode, elements.darkModeStatus);
  updateActionButton(elements.toggleReadingMode, state.readingMode, elements.readingModeStatus);
  updateActionButton(elements.toggleTTS, state.tts, elements.ttsStatus);
  
  // Update font size display
  elements.fontSizeValue.textContent = state.fontSize;
  
  // Update color blind mode select
  elements.colorBlindMode.value = state.colorBlindMode;
  
  // Update reading guide toggle
  elements.toggleReadingGuide.checked = state.readingGuide;
}

/**
 * Update action button appearance
 */
function updateActionButton(button, isActive, statusElement) {
  button.setAttribute('aria-pressed', isActive);
  statusElement.textContent = isActive ? 'On' : 'Off';
}

/**
 * Send message to content script
 */
async function sendToContentScript(action, data = {}) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab?.id) {
      await chrome.tabs.sendMessage(tab.id, {
        action,
        data: { ...data, state }
      });
    }
  } catch (error) {
    console.error('Error sending message to content script:', error);
  }
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
  // High Contrast Toggle
  elements.toggleHighContrast.addEventListener('click', async () => {
    state.highContrast = !state.highContrast;
    updateActionButton(elements.toggleHighContrast, state.highContrast, elements.contrastStatus);
    await saveSettings();
    await sendToContentScript('toggleHighContrast');
  });
  
  // Dark Mode Toggle
  elements.toggleDarkMode.addEventListener('click', async () => {
    state.darkMode = !state.darkMode;
    updateActionButton(elements.toggleDarkMode, state.darkMode, elements.darkModeStatus);
    await saveSettings();
    await sendToContentScript('toggleDarkMode');
  });
  
  // Reading Mode Toggle
  elements.toggleReadingMode.addEventListener('click', async () => {
    state.readingMode = !state.readingMode;
    updateActionButton(elements.toggleReadingMode, state.readingMode, elements.readingModeStatus);
    await saveSettings();
    await sendToContentScript('toggleReadingMode');
  });
  
  // Text-to-Speech Toggle
  elements.toggleTTS.addEventListener('click', async () => {
    state.tts = !state.tts;
    updateActionButton(elements.toggleTTS, state.tts, elements.ttsStatus);
    await saveSettings();
    await sendToContentScript('toggleTTS');
  });
  
  // Increase Font Size
  elements.increaseFont.addEventListener('click', async () => {
    if (state.fontSize < 200) {
      state.fontSize += 10;
      elements.fontSizeValue.textContent = state.fontSize;
      await saveSettings();
      await sendToContentScript('updateFontSize');
    }
  });
  
  // Decrease Font Size
  elements.decreaseFont.addEventListener('click', async () => {
    if (state.fontSize > 50) {
      state.fontSize -= 10;
      elements.fontSizeValue.textContent = state.fontSize;
      await saveSettings();
      await sendToContentScript('updateFontSize');
    }
  });
  
  // Color Blind Mode
  elements.colorBlindMode.addEventListener('change', async (e) => {
    state.colorBlindMode = e.target.value;
    await saveSettings();
    await sendToContentScript('updateColorBlindMode');
  });
  
  // Reading Guide Toggle
  elements.toggleReadingGuide.addEventListener('change', async (e) => {
    state.readingGuide = e.target.checked;
    await saveSettings();
    await sendToContentScript('toggleReadingGuide');
  });
  
  // Open Settings
  elements.openSettings.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(e) {
  // Ctrl/Cmd + H: Toggle High Contrast
  if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
    e.preventDefault();
    elements.toggleHighContrast.click();
  }
  
  // Ctrl/Cmd + D: Toggle Dark Mode
  if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
    e.preventDefault();
    elements.toggleDarkMode.click();
  }
  
  // Ctrl/Cmd + +: Increase Font
  if ((e.ctrlKey || e.metaKey) && e.key === '+') {
    e.preventDefault();
    elements.increaseFont.click();
  }
  
  // Ctrl/Cmd + -: Decrease Font
  if ((e.ctrlKey || e.metaKey) && e.key === '-') {
    e.preventDefault();
    elements.decreaseFont.click();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
