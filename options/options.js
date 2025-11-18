/**
 * MakeItAccessible - Options/Settings Page Script
 * Handles settings configuration and user preferences
 */

// DOM Elements
const elements = {
  fontSize: document.getElementById('fontSize'),
  fontSizeDisplay: document.getElementById('fontSizeDisplay'),
  highContrast: document.getElementById('highContrast'),
  darkMode: document.getElementById('darkMode'),
  readingMode: document.getElementById('readingMode'),
  readingGuide: document.getElementById('readingGuide'),
  colorBlindMode: document.getElementById('colorBlindMode'),
  tts: document.getElementById('tts'),
  exportSettings: document.getElementById('exportSettings'),
  importSettings: document.getElementById('importSettings'),
  resetSettings: document.getElementById('resetSettings'),
  saveToast: document.getElementById('saveToast')
};

/**
 * Initialize the options page
 */
async function init() {
  await loadSettings();
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
      'readingGuide',
      'colorBlindMode',
      'tts'
    ]);
    
    // Update UI with loaded values
    if (result.fontSize !== undefined) {
      elements.fontSize.value = result.fontSize;
      elements.fontSizeDisplay.textContent = result.fontSize + '%';
    }
    
    elements.highContrast.checked = result.highContrast || false;
    elements.darkMode.checked = result.darkMode || false;
    elements.readingMode.checked = result.readingMode || false;
    elements.readingGuide.checked = result.readingGuide || false;
    elements.colorBlindMode.value = result.colorBlindMode || 'none';
    elements.tts.checked = result.tts || false;
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

/**
 * Save a setting to Chrome storage
 */
async function saveSetting(key, value) {
  try {
    await chrome.storage.local.set({ [key]: value });
    showToast('Settings saved!');
  } catch (error) {
    console.error('Error saving setting:', error);
    showToast('Error saving settings', 'error');
  }
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
  // Font Size
  elements.fontSize.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    elements.fontSizeDisplay.textContent = value + '%';
    saveSetting('fontSize', value);
  });
  
  // High Contrast
  elements.highContrast.addEventListener('change', (e) => {
    saveSetting('highContrast', e.target.checked);
  });
  
  // Dark Mode
  elements.darkMode.addEventListener('change', (e) => {
    saveSetting('darkMode', e.target.checked);
  });
  
  // Reading Mode
  elements.readingMode.addEventListener('change', (e) => {
    saveSetting('readingMode', e.target.checked);
  });
  
  // Reading Guide
  elements.readingGuide.addEventListener('change', (e) => {
    saveSetting('readingGuide', e.target.checked);
  });
  
  // Color Blind Mode
  elements.colorBlindMode.addEventListener('change', (e) => {
    saveSetting('colorBlindMode', e.target.value);
  });
  
  // Text-to-Speech
  elements.tts.addEventListener('change', (e) => {
    saveSetting('tts', e.target.checked);
  });
  
  // Export Settings
  elements.exportSettings.addEventListener('click', exportSettings);
  
  // Import Settings
  elements.importSettings.addEventListener('click', importSettings);
  
  // Reset Settings
  elements.resetSettings.addEventListener('click', resetSettings);
}

/**
 * Export settings to JSON file
 */
async function exportSettings() {
  try {
    const settings = await chrome.storage.local.get(null);
    
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'makeitaccessible-settings.json';
    link.click();
    
    URL.revokeObjectURL(url);
    showToast('Settings exported successfully!');
  } catch (error) {
    console.error('Error exporting settings:', error);
    showToast('Error exporting settings', 'error');
  }
}

/**
 * Import settings from JSON file
 */
function importSettings() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  
  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const settings = JSON.parse(text);
      
      await chrome.storage.local.set(settings);
      await loadSettings();
      
      showToast('Settings imported successfully!');
    } catch (error) {
      console.error('Error importing settings:', error);
      showToast('Error importing settings', 'error');
    }
  });
  
  input.click();
}

/**
 * Reset all settings to defaults
 */
async function resetSettings() {
  const confirmed = confirm(
    'Are you sure you want to reset all settings to default? This cannot be undone.'
  );
  
  if (!confirmed) return;
  
  try {
    const defaultSettings = {
      fontSize: 100,
      highContrast: false,
      darkMode: false,
      readingMode: false,
      readingGuide: false,
      colorBlindMode: 'none',
      tts: false
    };
    
    await chrome.storage.local.clear();
    await chrome.storage.local.set(defaultSettings);
    await loadSettings();
    
    showToast('Settings reset to defaults');
  } catch (error) {
    console.error('Error resetting settings:', error);
    showToast('Error resetting settings', 'error');
  }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
  elements.saveToast.querySelector('.toast-message').textContent = message;
  
  if (type === 'error') {
    elements.saveToast.style.background = '#b00020';
  } else {
    elements.saveToast.style.background = '#00c853';
  }
  
  elements.saveToast.classList.add('show');
  
  setTimeout(() => {
    elements.saveToast.classList.remove('show');
  }, 3000);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
