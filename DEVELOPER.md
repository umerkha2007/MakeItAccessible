# MakeItAccessible - Developer Guide

## 🚀 Quick Start

### Installation for Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/umerkha2007/MakeItAccessible.git
   cd MakeItAccessible
   ```

2. **Load the extension in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `MakeItAccessible` folder

3. **Start developing:**
   - Make changes to the code
   - Click the refresh icon on the extension card in `chrome://extensions/`
   - Test your changes

## 📁 Project Structure

```
MakeItAccessible/
├── manifest.json              # Extension configuration (Manifest V3)
│
├── popup/                     # Extension popup (click toolbar icon)
│   ├── popup.html            # Popup UI structure
│   ├── popup.css             # Material Design styles
│   └── popup.js              # Popup functionality and state management
│
├── content/                   # Scripts injected into web pages
│   ├── accessibility.js      # Main controller, coordinates features
│   ├── visual-enhancements.js # Visual accessibility features
│   ├── audio-features.js     # Text-to-speech and audio features
│   └── styles.css            # Content script styles
│
├── background/                # Background service worker
│   └── background.js         # Extension lifecycle, context menus, commands
│
├── options/                   # Settings page
│   ├── options.html          # Full settings interface
│   ├── options.css           # Settings page styles
│   └── options.js            # Settings management
│
├── assets/                    # Static resources
│   └── icons/                # Extension icons (SVG)
│       ├── icon16.svg
│       ├── icon32.svg
│       ├── icon48.svg
│       └── icon128.svg
│
├── package.json              # Project metadata
├── DEVELOPER.md              # This file
└── README.md                 # User-facing documentation
```

## 🏗️ Architecture

### Manifest V3 Components

**Background Service Worker** (`background/background.js`)
- Handles extension lifecycle events
- Manages context menus
- Processes keyboard commands
- Coordinates communication between components

**Content Scripts** (`content/*.js`)
- Injected into every web page
- Apply accessibility modifications
- Respond to user actions from popup

**Popup** (`popup/*`)
- User interface for quick settings
- Real-time state updates
- Communicates with content scripts via Chrome messaging API

**Options Page** (`options/*`)
- Comprehensive settings interface
- Import/export configuration
- Detailed preference management

### Communication Flow

```
User Action in Popup
    ↓
Popup saves to chrome.storage.local
    ↓
Popup sends message to Content Script
    ↓
Content Script applies changes to page
    ↓
Background worker monitors and updates badge
```

## 🎨 Design System

### Material Design 3
- **Primary Color:** `#6200ee` (Purple)
- **Secondary Color:** `#03dac6` (Teal)
- **Typography:** Roboto font family
- **Elevation:** Consistent shadow system
- **Motion:** 200ms cubic-bezier transitions

### CSS Architecture
- CSS Custom Properties for theming
- BEM-inspired class naming
- Mobile-first responsive design
- Accessibility-first focus states

## ✨ Features Implementation

### Visual Enhancements (`visual-enhancements.js`)

**Font Size Adjustment**
```javascript
updateFontSize(percentage) {
  // Scales all fonts proportionally
  // Range: 50% - 200%
}
```

**High Contrast Mode**
```javascript
toggleHighContrast(enabled) {
  // Black background, white text
  // Enhanced borders and focus indicators
}
```

**Dark Mode**
```javascript
toggleDarkMode(enabled) {
  // Dark gray backgrounds
  // Reduced brightness for images
}
```

**Reading Mode**
```javascript
toggleReadingMode(enabled) {
  // Simplified layout
  // Removes distractions (ads, sidebars)
  // Enhanced typography
}
```

**Reading Guide**
```javascript
toggleReadingGuide(enabled) {
  // Horizontal line follows mouse cursor
  // Helps maintain reading position
}
```

**Color Blind Modes**
```javascript
updateColorBlindMode(mode) {
  // SVG filters for protanopia, deuteranopia, tritanopia
  // CSS grayscale for achromatopsia
}
```

### Audio Features (`audio-features.js`)

**Text-to-Speech**
- Uses Web Speech API
- Floating button on text selection
- Configurable voice and speed
- No external dependencies

## 🔧 Chrome Extension APIs Used

### Storage API
```javascript
chrome.storage.local.set({ key: value });
chrome.storage.local.get(['key']);
```
- Stores user preferences
- Syncs across extension components
- Persists between sessions

### Tabs API
```javascript
chrome.tabs.query({ active: true, currentWindow: true });
chrome.tabs.sendMessage(tabId, message);
```
- Identifies active tab
- Sends messages to content scripts

### Commands API
```javascript
chrome.commands.onCommand.addListener(command => {
  // Handle keyboard shortcuts
});
```
- Registered in manifest.json
- Global keyboard shortcuts

### Context Menus API
```javascript
chrome.contextMenus.create({
  id: 'menuId',
  title: 'Menu Title',
  contexts: ['selection']
});
```
- Right-click menu integration
- Context-aware actions

### Text-to-Speech API
```javascript
chrome.tts.speak(text, options);
```
- Note: Currently using Web Speech API in content scripts
- Can be upgraded to chrome.tts for more control

## 🧪 Testing

### Manual Testing Checklist

**Popup Interface:**
- [ ] All toggles work correctly
- [ ] Font size slider updates in real-time
- [ ] Settings persist after closing popup
- [ ] Status indicators update correctly

**Content Script Features:**
- [ ] High contrast applies to all elements
- [ ] Dark mode doesn't conflict with page styles
- [ ] Reading mode simplifies complex layouts
- [ ] Font scaling maintains page layout
- [ ] Reading guide follows mouse smoothly

**Text-to-Speech:**
- [ ] Button appears on text selection
- [ ] Speech starts/stops correctly
- [ ] Works with different voice settings

**Settings Page:**
- [ ] All settings save automatically
- [ ] Export creates valid JSON
- [ ] Import restores settings correctly
- [ ] Reset returns to defaults

**Keyboard Shortcuts:**
- [ ] Ctrl+Shift+H toggles high contrast
- [ ] Ctrl+Shift+D toggles dark mode
- [ ] Ctrl+Shift++ increases font size

### Browser Compatibility

**Tested on:**
- Chrome 120+
- Edge 120+
- Brave 1.60+
- Opera 105+

**Note:** Uses Manifest V3 - not compatible with Firefox without modifications.

## 🐛 Common Issues & Solutions

### Issue: Content scripts not loading
**Solution:** Check manifest.json matches property and reload extension

### Issue: Styles not applying
**Solution:** Ensure content/styles.css is loaded and check for page CSP restrictions

### Issue: Storage not persisting
**Solution:** Verify chrome.storage permissions in manifest.json

### Issue: TTS not working
**Solution:** Check browser supports Web Speech API, ensure HTTPS context

## 🔒 Privacy & Security

### Data Storage
- All data stored in `chrome.storage.local`
- No external API calls
- No telemetry or analytics
- No user tracking

### Permissions Justification
- `activeTab`: Apply settings to current page only when needed
- `storage`: Save user preferences locally
- `tts`: Text-to-speech functionality
- `contextMenus`: Right-click menu integration
- `<all_urls>`: Apply accessibility features to any website

### Content Security Policy
- No inline scripts in HTML files
- All scripts loaded from extension files
- No external resource loading (except Google Fonts)

## 🚀 Building for Production

### Pre-release Checklist
- [ ] Update version in manifest.json
- [ ] Test all features on multiple websites
- [ ] Verify no console errors
- [ ] Check memory usage and performance
- [ ] Update CHANGELOG.md
- [ ] Create release notes

### Creating Distribution Package
```bash
# Remove development files
rm -rf .git node_modules

# Create ZIP for Chrome Web Store
zip -r makeitaccessible-v1.0.0.zip . -x "*.git*" "node_modules/*" "*.md"
```

### Chrome Web Store Submission
1. Create developer account ($5 one-time fee)
2. Prepare store listing assets:
   - Icon (128x128)
   - Screenshots (1280x800 or 640x400)
   - Promotional images
   - Description and feature list
3. Upload ZIP file
4. Complete privacy policy
5. Submit for review

## 🤝 Contributing

### Code Style
- Use ES6+ features
- 2-space indentation
- Semicolons required
- Descriptive variable names
- JSDoc comments for functions

### Pull Request Process
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Commit Message Format
```
type(scope): subject

body (optional)

footer (optional)
```

Types: feat, fix, docs, style, refactor, test, chore

## 📚 Resources

### Chrome Extension Documentation
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Extension APIs](https://developer.chrome.com/docs/extensions/reference/)
- [Content Scripts](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)

### Accessibility Resources
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

### Material Design
- [Material Design 3](https://m3.material.io/)
- [Material Icons](https://fonts.google.com/icons)
- [Color System](https://m3.material.io/styles/color/overview)

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/umerkha2007/MakeItAccessible/issues)
- **Discussions:** [GitHub Discussions](https://github.com/umerkha2007/MakeItAccessible/discussions)

---

**Happy coding! Let's make the web accessible for everyone! ♿💜**
