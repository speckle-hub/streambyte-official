# Deployment Guide: StreamByte

StreamByte is built with Next.js 14 and is optimized for deployment on **Vercel**.

## 🚀 One-Click Deployment to Vercel

The easiest way to deploy is to push your code to a GitHub repository and connect it to Vercel.

1.  **Push to GitHub**: Initialize a git repo and push your code.
2.  **Import to Vercel**: Go to [Vercel Dashboard](https://vercel.com/new) and select your repository.
3.  **Configure Project**:
    *   **Framework Preset**: Next.js
    *   **Root Directory**: `./` (default)
    *   **Build Command**: `next build`
    *   **Install Command**: `npm install`
4.  **Deploy**: Click "Deploy".

## ⚙️ Environment Variables

Currently, StreamByte works entirely client-side for addon interactions. No server-side environment variables are strictly required for basic functionality.

However, if you wish to enable advanced features or analytics, you can add:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | The URL of your deployed site | `http://localhost:3000` |

## 🌐 Custom Domains

1.  In your Vercel project, go to **Settings > Domains**.
2.  Enter your custom domain (e.g., `streambyte.tv`).
3.  Follow the instructions to update your DNS settings (usually adding an `A` record or `CNAME`).
4.  Vercel will automatically provision an SSL certificate for you.

## 📱 PWA Considerations

Once deployed, the PWA will be functional. Users can "Add to Home Screen" on mobile devices to get the full-screen HUD experience.

> [!NOTE]
> Ensure the site is served over HTTPS for the service worker and PWA features to be active. Vercel handles this automatically.

## 🛠️ Local Production Preview

To test the production build locally:
```bash
npm run build
npm start
```
