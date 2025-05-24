# ToneFixer - Chrome Extension

🚀 **PRODUCTION READY** - AI-powered tone analysis and improvement for web communications

## 📋 Overview

ToneFixer is a comprehensive Chrome extension that analyzes and improves message tone in real-time across popular web communication platforms. Built with React 18, TypeScript, and TailwindCSS, it features AI-powered analysis using Google Gemini Pro or Claude 3.5 Sonnet APIs.

## ✨ Features

- **🤖 AI-Powered Analysis**: Real-time tone detection using advanced language models
- **🌐 Multi-Platform Support**: Works on Gmail, Slack, LinkedIn, GitHub, Discord, Teams
- **⚡ Real-Time Suggestions**: Intelligent contextual improvements
- **📊 Analytics Dashboard**: Track your communication improvements
- **🎨 Modern UI**: Clean, non-intrusive interface with TailwindCSS
- **🔒 Privacy-First**: Local processing with secure API integration
- **⚙️ Customizable**: Configurable tone preferences and settings

## 🚀 Quick Start

### Installation

1. **Clone and Build**:

   ```bash
   npm install
   npm run build
   ```

2. **Load in Chrome**:

   - Open `chrome://extensions/`
   - Enable Developer Mode
   - Click "Load unpacked" and select the `dist` folder

3. **Configure API**:
   - Click the extension icon
   - Go to Settings and add your AI API key
   - Select your preferred AI provider

See [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) for detailed instructions.

## 🛠️ Development

### Tech Stack

- **Frontend**: React 18 + TypeScript + TailwindCSS
- **Build**: Webpack 5 + PostCSS
- **AI Integration**: Google Gemini Pro / Claude 3.5 Sonnet
- **State Management**: Zustand
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + TypeScript ESLint

### Scripts

```bash
npm run dev          # Development build with watch
npm run build        # Production build
npm run test         # Run tests
npm run lint         # Lint code
npm run type-check   # TypeScript check
```

### Project Structure

```
src/
├── background/      # Service worker
├── content/         # Content scripts
├── popup/          # Extension popup
├── widget/         # In-page widget
├── components/     # React components
├── hooks/          # Custom hooks
├── stores/         # Zustand stores
├── utils/          # Utilities
├── types/          # TypeScript types
└── styles/         # CSS/Tailwind styles
```

## 🎯 Supported Platforms

- **Gmail** - Email composition and replies
- **Slack** - Direct messages and channels
- **LinkedIn** - Posts, comments, and messages
- **GitHub** - Issues, PRs, and discussions
- **Discord** - Text channels and DMs
- **Microsoft Teams** - Chat and channel messages

## 📦 Build Output

The extension builds to the `dist/` folder with:

- Optimized JavaScript bundles
- HTML templates
- CSS stylesheets
- Chrome extension manifest
- Icon assets (PNG format)

## 🔧 Configuration

### AI Providers

- **Google Gemini Pro**: Get API key from Google AI Studio
- **Claude 3.5 Sonnet**: Get API key from Anthropic Console

### Extension Permissions

- `storage` - Save user preferences and analytics
- `activeTab` - Access current tab for content injection
- `scripting` - Inject content scripts dynamically

## 🧪 Testing

Run the test suite:

```bash
npm run test        # Single run
npm run test:watch  # Watch mode
```

Test coverage includes:

- Component rendering
- User interactions
- Store state management
- Utility functions
- API integration

## 🚢 Production Deployment

### Chrome Web Store Preparation

1. **Build for production**: `npm run build`
2. **Test thoroughly** across all supported platforms
3. **Package dist folder** as ZIP file
4. **Submit to Chrome Web Store** with proper metadata

### Version Management

- Update `version` in `package.json` and `manifest.json`
- Follow semantic versioning (semver)
- Document changes in release notes

## 📊 Performance

- **Bundle Sizes** (gzipped):

  - Popup: ~62KB
  - Content Script: ~3KB
  - Background: ~6KB
  - Widget: ~55KB

- **Startup Time**: < 100ms
- **Analysis Speed**: < 500ms per request
- **Memory Usage**: < 10MB

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: Report bugs and feature requests on GitHub
- **Documentation**: See INSTALLATION_GUIDE.md for setup help
- **Development**: Check the wiki for development guidelines

---

**Made with ❤️ for better digital communication**
