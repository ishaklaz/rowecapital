# 🚀 RoweCapital Platform - Deployment Guide

## ✅ Pre-Deployment Checklist

### 📁 File Structure (All files in root directory)
- [x] `server.js` - Main server file
- [x] `package.json` - Dependencies and scripts
- [x] `render.yaml` - Render deployment config
- [x] `.gitignore` - Git ignore rules
- [x] `README.md` - Documentation
- [x] `deploy.sh` - Deployment script
- [x] `index.html` - Landing page
- [x] `dashboard.html` - User dashboard
- [x] `deposit.html` - Deposit selection
- [x] `deposit-usdt.html` - USDT deposit
- [x] `deposit-tron.html` - TRON deposit
- [x] `deposit-btc.html` - Bitcoin deposit
- [x] `withdraw.html` - Withdrawal page
- [x] `plans.html` - Investment plans
- [x] `affiliate.html` - Affiliate program
- [x] `transactions.html` - Transaction history
- [x] `profile.html` - User profile
- [x] `script.js` - Frontend JavaScript
- [x] `styles.css` - CSS styles

### 🔧 Configuration Updates
- [x] Static files served from root directory
- [x] Database path configured for Render
- [x] Health check endpoint added (`/health`)
- [x] All file paths updated to root directory
- [x] Package.json updated for production
- [x] Render.yaml configured

## 🚀 Deployment Steps

### Step 1: GitHub Setup

1. **Create GitHub Repository**
   ```bash
   # Go to GitHub.com and create a new repository
   # Name: rowecapital-platform
   # Make it public
   ```

2. **Initialize Git and Push**
   ```bash
   # In your project directory
   git init
   git add .
   git commit -m "Initial commit for Render deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/rowecapital-platform.git
   git push -u origin main
   ```

### Step 2: Render Deployment

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Sign up/Login with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure Service**
   - **Name**: `rowecapital-platform`
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

4. **Environment Variables** (Optional)
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (auto-set by Render)

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete (2-3 minutes)

### Step 3: Verify Deployment

1. **Check Build Logs**
   - Look for any errors in build process
   - Ensure all dependencies installed

2. **Test Health Endpoint**
   - Visit: `https://your-app-name.onrender.com/health`
   - Should return: `{"status":"OK","message":"RoweCapital Platform is running"}`

3. **Test Main Application**
   - Visit: `https://your-app-name.onrender.com`
   - Should load the landing page

## 🔍 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check `package.json` dependencies
   - Verify Node.js version (>=16.0.0)
   - Check build logs for errors

2. **Static Files Not Loading**
   - Verify all HTML files are in root directory
   - Check file paths in `server.js`
   - Ensure static middleware configured correctly

3. **Database Issues**
   - SQLite database will be created automatically
   - Check database path configuration
   - Verify database permissions

4. **Port Issues**
   - Render automatically sets PORT environment variable
   - Ensure server listens on `process.env.PORT`

### Debug Commands

```bash
# Test locally first
npm install
npm start

# Check if all files are present
ls -la

# Verify package.json
cat package.json

# Test server startup
node server.js
```

## 📊 Post-Deployment Checklist

- [ ] Application loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard displays correctly
- [ ] Deposit pages load
- [ ] Withdrawal system works
- [ ] Investment plans accessible
- [ ] Affiliate program functional
- [ ] Database operations work
- [ ] All API endpoints respond

## 🌐 Your Live Application

Once deployed, your application will be available at:
```
https://rowecapital-platform.onrender.com
```

## 📞 Support

If you encounter issues:
1. Check Render build logs
2. Verify all files are in root directory
3. Test locally before deploying
4. Review server logs in Render dashboard

---

**RoweCapital Platform** - Ready for deployment! 🚢 