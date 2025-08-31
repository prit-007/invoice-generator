# Deploy React frontend to Vercel

This project uses Create React App. To deploy to Vercel:

1. Ensure `REACT_APP_API_URL` is set in Vercel Environment Variables (point to your API URL).
2. Install dependencies locally and build:

```bash
npm install --legacy-peer-deps
npm run build
```

3. Deploy with Vercel CLI from `pro/`:

```bash
cd pro
vercel --prod
```

Vercel will run `npm run build` and serve the `build` directory.

Note: If you have issues with TypeScript peer deps, use `--legacy-peer-deps` when installing locally.
