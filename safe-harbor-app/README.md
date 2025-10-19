# Safe Harbor Compliance System

IRS-compliant documentation and management system for renewable energy projects' Beginning of Construction (BOC) qualification under safe harbor rules.

## Features

- 📊 **Dashboard**: Real-time portfolio overview with project tracking and deadline monitoring
- 🧮 **Safe Harbor Calculator**: Automatic BOC qualification analysis with dual-track support
- 📄 **Contract Generator**: IRS-compliant binding written contracts with liquidated damages
- 📚 **Compliance Guide**: Interactive reference for Treasury Notices and requirements

## Quick Deploy (Recommended Methods)

### Option 1: Deploy to Vercel (Easiest - Free)

1. **Create a Vercel account** at [vercel.com](https://vercel.com)

2. **Install Vercel CLI** (optional, or use the web interface):
   ```bash
   npm install -g vercel
   ```

3. **Deploy from this directory**:
   ```bash
   vercel
   ```
   
   Or use the Vercel web interface:
   - Push this folder to GitHub
   - Go to vercel.com → "New Project"
   - Import your GitHub repository
   - Click "Deploy" (Vercel auto-detects Vite)

4. **Your app will be live** at: `https://your-project.vercel.app`

**Time to deploy: ~2 minutes**

### Option 2: Deploy to Netlify (Also Free)

1. **Create a Netlify account** at [netlify.com](https://netlify.com)

2. **Drag and drop deployment**:
   ```bash
   npm install
   npm run build
   ```
   
   Then drag the `dist` folder to Netlify's web interface.

3. **Or use Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod
   ```

4. **Your app will be live** at: `https://your-site.netlify.app`

**Time to deploy: ~3 minutes**

### Option 3: Deploy to GitHub Pages

1. **Update `vite.config.js`** - change base to your repo name:
   ```javascript
   base: '/your-repo-name/',
   ```

2. **Add deployment script** to package.json:
   ```json
   "scripts": {
     "deploy": "vite build && npx gh-pages -d dist"
   }
   ```

3. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages** in your repository settings → Pages → Source: gh-pages branch

**Your app will be live** at: `https://yourusername.github.io/your-repo-name/`

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**: http://localhost:5173

4. **Build for production**:
   ```bash
   npm run build
   ```

## Project Structure

```
safe-harbor-app/
├── public/              # Static assets
├── src/
│   ├── App.jsx         # Main application component
│   ├── main.jsx        # React entry point
│   └── index.css       # Global styles (Tailwind)
├── index.html          # HTML template
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── README.md           # This file
```

## Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Compliance Documentation

This system implements requirements from:
- Treasury Notice 2013-29 (5% Safe Harbor)
- Treasury Notice 2018-59
- Treasury Notice 2020-41
- Treasury Notice 2021-41
- Treasury Notice 2025-42 (Dual-Track BOC Framework)

## Support and Disclaimer

This system provides guidance only. **Consult tax and legal professionals** for specific situations. The system does not constitute tax or legal advice.

## Custom Domain (Optional)

After deploying to Vercel or Netlify, you can add a custom domain:

**Vercel**: Settings → Domains → Add Domain
**Netlify**: Site Settings → Domain Management → Add Custom Domain

Example: `safeharbor.yourcompany.com`

## Environment Variables (If Needed Later)

For future backend integration, create `.env` file:
```
VITE_API_URL=https://api.yourbackend.com
```

## License

Copyright © 2025. All rights reserved.
