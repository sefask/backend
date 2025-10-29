# Backend Deployment Guide - Vercel

This guide will help you deploy the Sefask backend to Vercel.

## Prerequisites

- A Vercel account (https://vercel.com)
- Git repository pushed to GitHub/GitLab/Bitbucket
- MongoDB Atlas account with a cloud database
- Environment variables ready

## Environment Variables Required

Before deploying, ensure you have the following environment variables set up in Vercel:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | Secret key for JWT tokens | Any strong random string |
| `FRONTEND_URL` | Your frontend URL for CORS | `https://frontend.vercel.app` |
| `MAILTRAP_USER` | Email address for sending emails | `your-email@gmail.com` |
| `MAILTRAP_PASS` | Email password or app password | Gmail app-specific password |
| `FROM_EMAIL` | Display name and email for emails | `Sefask <your-email@gmail.com>` |
| `NODE_ENV` | Environment | `production` |

## Deployment Steps

### 1. Prepare Your Git Repository
```bash
git add .
git commit -m "Prepare backend for Vercel deployment"
git push
```

### 2. Deploy to Vercel

**Option A: Using Vercel CLI**
```bash
npm i -g vercel
vercel
```

**Option B: Using Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select your Git repository
4. Click "Deploy"

### 3. Configure Environment Variables

After selecting your repository, before clicking Deploy:

1. Click "Environment Variables"
2. Add all required variables from the table above
3. Set values for each variable:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A strong random secret (use a password generator)
   - `FRONTEND_URL`: Your frontend's Vercel URL
   - `MAILTRAP_USER`: Your Gmail address
   - `MAILTRAP_PASS`: Your Gmail app password
   - `FROM_EMAIL`: Display format of sender email
   - `NODE_ENV`: `production`

### 4. MongoDB Atlas Setup (if not already done)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a cluster (M0 free tier works for testing)
3. Create a database user with a strong password
4. Whitelist your IP or use `0.0.0.0/0` for development
5. Get your connection string: `mongodb+srv://user:password@cluster.mongodb.net/dbname`

### 5. Gmail App Password Setup

For `MAILTRAP_PASS`:
1. Enable 2-step verification in your Google Account
2. Generate an app-specific password: https://myaccount.google.com/apppasswords
3. Use the generated 16-character password

### 6. After Deployment

- Vercel will automatically build and deploy your backend
- Your backend URL will be something like: `https://your-project.vercel.app`
- API endpoints will be available at: `https://your-project.vercel.app/api/auth/...`
- Check logs in Vercel dashboard for any errors

## Troubleshooting

### MongoDB Connection Failed
- Verify `MONGO_URI` is correct
- Check IP whitelist in MongoDB Atlas (or add `0.0.0.0/0`)
- Ensure the database user password doesn't have special characters that need URL encoding

### Email Not Sending
- Verify Gmail app password is correct (16 characters)
- Check that 2-step verification is enabled
- Ensure `FROM_EMAIL` format is correct: `Name <email@domain.com>`

### CORS Issues
- Ensure `FRONTEND_URL` environment variable is set correctly with `https://`
- Update frontend URL in Vercel whenever frontend is redeployed

### Cold Starts
- Vercel serverless functions may have initial cold start delays
- This is normal for first request after deployment

## Testing Your Deployment

Once deployed, test your backend:

```bash
# Health check
curl https://your-project.vercel.app/api/health

# Test signup endpoint
curl -X POST https://your-project.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

## Continuous Deployment

Once set up, every push to your main branch will automatically:
1. Trigger a new build
2. Run tests (if configured)
3. Deploy to production

## Support

For issues:
- Check Vercel logs: Dashboard → Project → Deployments
- Review MongoDB Atlas logs
- Check email service logs
