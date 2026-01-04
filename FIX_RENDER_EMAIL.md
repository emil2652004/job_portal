# Fix Email on Render - SMTP Connection Timeout

## Problem
Gmail SMTP connections timeout on Render because:
- Render blocks/throttles SMTP connections on free tier
- Gmail blocks some cloud hosting IPs
- OAuth requires stable connections

## Solution: Use SendGrid (Recommended for Production)

SendGrid is designed for cloud hosting and has a **FREE tier: 100 emails/day**

### Step 1: Create SendGrid Account
1. Go to: https://signup.sendgrid.com
2. Sign up (free account)
3. Verify your email address

### Step 2: Create API Key
1. Go to: https://app.sendgrid.com/settings/api_keys
2. Click "Create API Key"
3. Name: `Job Portal`
4. Permissions: **Full Access** (or just Mail Send)
5. Click "Create & View"
6. **Copy the API key** (you'll only see it once!)

### Step 3: Verify Sender Email
1. Go to: https://app.sendgrid.com/settings/sender_auth/senders
2. Click "Create New Sender"
3. Fill in your details:
   - From Name: `Job Portal`
   - From Email: `emilbaiju2652004@gmail.com`
   - Company, Address, etc.
4. Click "Create"
5. **Check your email** and verify the sender

### Step 4: Update Render Environment Variables
1. Go to Render Dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Add new variable:
   ```
   Key: SENDGRID_API_KEY
   Value: your_sendgrid_api_key_here
   ```
5. Click "Save Changes"

### Step 5: Update Code
Replace the email.js import in your routes with SendGrid version:

In `backend/routes/user/user.js` (and employer.js, admin.js if needed):
```javascript
// OLD:
const { sendTextEmail } = require('../../conrollers/email');

// NEW:
const { sendTextEmail } = require('../../conrollers/email-sendgrid');
```

### Step 6: Deploy
```bash
git add .
git commit -m "Switch to SendGrid for email"
git push
```

Wait for Render to redeploy (2-3 minutes), then test!

## Alternative: Quick Fix (Keep Gmail but less reliable)

The current fix adds timeouts which might help sometimes, but SendGrid is the proper solution for production.

## Verify It Works
After setup, check Render logs - you should see:
```
Sending email via SendGrid to: user@example.com
✅ Email sent via SendGrid: <message-id>
```
