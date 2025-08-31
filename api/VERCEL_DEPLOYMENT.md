# FastAPI Invoice Management - Vercel Deployment

This guide will help you deploy your FastAPI Invoice Management API to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally with `npm install -g vercel`
3. **PostgreSQL Database**: You'll need a PostgreSQL database (can use services like Supabase, Railway, or Neon)

## Files Added for Vercel Deployment

- `vercel.json` - Vercel configuration file
- `api/index.py` - Entry point for Vercel's Python runtime
- `deploy.ps1` - PowerShell deployment script
- `deploy.sh` - Bash deployment script

## Deployment Steps

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Navigate to API Directory

```bash
cd api
```

### 4. Deploy

```bash
vercel --prod
```

Or run the deployment script:

**PowerShell:**
```powershell
.\deploy.ps1
```

**Bash:**
```bash
./deploy.sh
```

## Environment Variables

After deployment, configure these environment variables in your Vercel dashboard:

| Variable | Description | Example |
|----------|-------------|---------|
| `user` | PostgreSQL username | `your_username` |
| `password` | PostgreSQL password | `your_password` |
| `host` | PostgreSQL host | `db.example.com` |
| `port` | PostgreSQL port | `5432` |
| `dbname` | PostgreSQL database name | `invoice_db` |

### Setting Environment Variables

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable for all environments (Development, Preview, Production)

## Database Setup

### Option 1: Supabase (Recommended)

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection details
5. Run your database migrations

### Option 2: Railway

1. Sign up at [railway.app](https://railway.app)
2. Create a PostgreSQL service
3. Copy the connection details

### Option 3: Neon

1. Sign up at [neon.tech](https://neon.tech)
2. Create a database
3. Copy the connection details

## Testing Deployment

After deployment, test your API:

```bash
# Replace YOUR_VERCEL_URL with your actual Vercel URL
curl https://YOUR_VERCEL_URL.vercel.app/health
```

Expected response:
```json
{"status": "healthy"}
```

## Updating Frontend Configuration

Update your React app's API configuration to point to the new Vercel URL:

**In your React app (pro/src/services/ or similar):**

```javascript
// Replace with your actual Vercel URL
const API_BASE_URL = 'https://YOUR_VERCEL_URL.vercel.app';
```

## Common Issues and Solutions

### 1. Database Connection Issues

**Problem**: API can't connect to database
**Solution**: Ensure environment variables are correctly set in Vercel dashboard

### 2. CORS Issues

**Problem**: Frontend can't access API due to CORS
**Solution**: Update CORS settings in `main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. Static Files Not Loading

**Problem**: Static files (CSS, images) not accessible
**Solution**: Vercel handles static files differently. Consider using a CDN or adjusting static file paths.

## Monitoring and Logs

- View deployment logs in Vercel dashboard
- Monitor API performance in Vercel Analytics
- Set up error tracking with services like Sentry

## Custom Domain (Optional)

1. Go to Vercel dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Configure DNS settings as instructed

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to Git
2. **CORS**: Configure proper CORS origins for production
3. **Rate Limiting**: Consider adding rate limiting for production use
4. **Authentication**: Implement proper authentication if needed

## Support

For deployment issues:
- Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
- Vercel community: [github.com/vercel/community](https://github.com/vercel/community)

For API issues:
- Check the main README.md in the api directory
- Review API documentation at `/docs` endpoint
