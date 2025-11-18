/**
 * MakeItAccessible - Background Service Worker
 * Handles extension lifecycle, context menus, and keyboard shortcuts
 */

// Initialize extension on install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.local.set({
      fontSize: 100,
      highContrast: false,
      darkMode: false,
      readingMode: false,
      tts: false,
      readingGuide: false,
      colorBlindMode: 'none'
    });
    
    // Open welcome page
    chrome.tabs.create({
      url: 'options/options.html'
    });
  }
  
  // Create context menu
  createContextMenu();
});

/**
 * Create context menu items
 */
function createContextMenu() {
  // Remove existing menu items
  chrome.contextMenus.removeAll(() => {
    // Read selected text
    chrome.contextMenus.create({
      id: 'readSelection',
      title: 'Read Selected Text',
      contexts: ['selection']
    });
    
    // Separator
    chrome.contextMenus.create({
      id: 'separator1',
      type: 'separator',
      contexts: ['page']
    });
    
    // Quick toggles
    chrome.contextMenus.create({
      id: 'toggleHighContrast',
      title: 'Toggle High Contrast',
      contexts: ['page']
    });
    
    chrome.contextMenus.create({
      id: 'toggleDarkMode',
      title: 'Toggle Dark Mode',
      contexts: ['page']
    });
    
    chrome.contextMenus.create({
      id: 'toggleReadingMode',
      title: 'Toggle Reading Mode',
      contexts: ['page']
    });
  });
}

/**
 * Handle context menu clicks
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  switch (info.menuItemId) {
    case 'readSelection':
      if (info.selectionText) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'speakText',
          text: info.selectionText
        });
      }
      break;
      
    case 'toggleHighContrast':
      await toggleSetting(tab.id, 'highContrast', 'toggleHighContrast');
      break;
      
    case 'toggleDarkMode':
      await toggleSetting(tab.id, 'darkMode', 'toggleDarkMode');
      break;
      
    case 'toggleReadingMode':
      await toggleSetting(tab.id, 'readingMode', 'toggleReadingMode');
      break;
  }
});

/**
 * Toggle a setting and notify content script
 */
async function toggleSetting(tabId, settingKey, action) {
  try {
    const result = await chrome.storage.local.get(settingKey);
    const newValue = !result[settingKey];
    
    await chrome.storage.local.set({ [settingKey]: newValue });
    
    chrome.tabs.sendMessage(tabId, {
      action,
      data: { state: { [settingKey]: newValue } }
    });
  } catch (error) {
    console.error('Error toggling setting:', error);
  }
}

/**
 * Handle keyboard commands
 */
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab?.id) return;
  
  switch (command) {
    case 'toggle-high-contrast':
      await toggleSetting(tab.id, 'highContrast', 'toggleHighContrast');
      break;
      
    case 'toggle-dark-mode':
      await toggleSetting(tab.id, 'darkMode', 'toggleDarkMode');
      break;
      
    case 'increase-font-size':
      await adjustFontSize(tab.id, 10);
      break;
  }
});

/**
 * Adjust font size
 */
async function adjustFontSize(tabId, delta) {
  try {
    const result = await chrome.storage.local.get('fontSize');
    let fontSize = result.fontSize || 100;
    
    fontSize = Math.max(50, Math.min(200, fontSize + delta));
    
    await chrome.storage.local.set({ fontSize });
    
    chrome.tabs.sendMessage(tabId, {
      action: 'updateFontSize',
      data: { state: { fontSize } }
    });
  } catch (error) {
    console.error('Error adjusting font size:', error);
  }
}

/**
 * Handle messages from content scripts and popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { action, data } = request;
  
  switch (action) {
    case 'updateContextMenu':
      // Update context menu based on page state
      if (data?.hasSelection) {
        chrome.contextMenus.update('readSelection', { visible: true });
      }
      break;
      
    case 'speakText':
      // Forward to content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'speakText',
            text: data.text
          });
        }
      });
      break;
  }
  
  sendResponse({ success: true });
  return true;
});

/**
 * Handle extension icon click
 */
chrome.action.onClicked.addListener((tab) => {
  // Open popup (default behavior)
});

/**
 * Monitor tab updates to reapply settings
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // Settings will be automatically applied by content scripts
  }
});

/**
 * Badge text for active features
 */
async function updateBadge() {
  try {
    const settings = await chrome.storage.local.get([
      'highContrast',
      'darkMode',
      'readingMode',
      'tts'
    ]);
    
    const activeCount = Object.values(settings).filter(Boolean).length;
    
    if (activeCount > 0) {
      chrome.action.setBadgeText({ text: activeCount.toString() });
      chrome.action.setBadgeBackgroundColor({ color: '#6200ee' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  } catch (error) {
    console.error('Error updating badge:', error);
  }
}

// Update badge when storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    updateBadge();
  }
});

// Initialize badge
updateBadge();

console.log('MakeItAccessible background service worker initialized');
