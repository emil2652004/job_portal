# Cloud Storage Setup Guide

## Current Fix Applied
✅ Fixed resume links to use full backend URL (`https://job-portal-1-2je8.onrender.com/${resumePath}`)
- This will work for your current deployment on Render

## Option 1: Cloudinary (Recommended - FREE)

### Steps:
1. **Install dependencies:**
   ```bash
   cd backend
   npm install cloudinary multer-storage-cloudinary
   ```

2. **Create Cloudinary account:**
   - Go to https://cloudinary.com/users/register/free
   - Sign up for free account
   - Get your credentials from dashboard

3. **Add to `.env` file:**
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Update `backend/routes/user/user.js`:**
   Replace the multer import at the top:
   ```javascript
   // Old code - REMOVE:
   // const multer = require('multer');
   // const path = require('path');
   // const fs = require('fs');
   // ... old multer setup

   // New code - ADD:
   const { upload } = require('../../config/cloudinary');
   ```

5. **Benefits:**
   - ✅ No file system issues
   - ✅ Works with serverless/container hosting (Render, Vercel, etc.)
   - ✅ Built-in CDN for fast file delivery
   - ✅ Free tier: 25GB storage, 25GB bandwidth/month
   - ✅ Automatic backups

## Option 2: AWS S3

### Steps:
1. **Install dependencies:**
   ```bash
   npm install aws-sdk multer-s3
   ```

2. **Create AWS account and S3 bucket**

3. **Add to `.env`:**
   ```env
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   AWS_BUCKET_NAME=your-bucket-name
   ```

4. **Create config file** (`backend/config/s3.js`)

## Option 3: Azure Blob Storage

Similar setup with Azure SDK

## Current Local Storage (Your Current Setup)
- ⚠️ Works locally but has issues on cloud hosting
- ⚠️ Files can be lost on container restart (Render, Heroku)
- ⚠️ Not scalable for production

## Recommendation
**Use Cloudinary** - It's free, easy to set up, and perfect for hosting applications. The configuration file is already created for you at `backend/config/cloudinary.js`.
