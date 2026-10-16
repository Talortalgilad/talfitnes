import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// WhatsApp/Facebook need an absolute og:image URL. Vercel exposes the deployment host at build time.
function ogImage(): Plugin {
  return {
    name: 'rewear-og-image',
    transformIndexHtml(html) {
      const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
      if (!host) return html;
      const url = `https://${host}/og.png`;
      return html.replace('</head>', `    <meta property="og:image" content="${url}" />\n    <meta property="og:url" content="https://${host}/" />\n    <meta name="twitter:image" content="${url}" />\n  </head>`);
    },
  };
}

export default defineConfig({ plugins: [react(), ogImage()] });
