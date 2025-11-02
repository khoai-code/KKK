# Vercel Deployment Guide

## 🚨 Critical Setup After Deployment

After deploying to Vercel, you **MUST** complete these steps for authentication to work:

### 1. Update Environment Variables in Vercel

Go to your Vercel project settings → Environment Variables and update:

```
NEXT_PUBLIC_APP_URL
```

**Change from:** `http://localhost:3000`
**Change to:** `https://your-app-name.vercel.app` (your actual Vercel URL)

After updating, **redeploy** your application.

### 2. Update Supabase Redirect URLs

Go to your Supabase Dashboard:
https://supabase.com/dashboard/project/qvuarxsilushtbzaijtq/auth/url-configuration

#### Add these URLs to **Redirect URLs** section:

```
https://your-app-name.vercel.app/auth/callback
https://your-app-name.vercel.app/**
```

#### Update **Site URL** to:

```
https://your-app-name.vercel.app
```

### 3. Verify Google OAuth Configuration

In Supabase Dashboard → Authentication → Providers → Google:

Ensure the **Authorized redirect URIs** includes:
```
https://qvuarxsilushtbzaijtq.supabase.co/auth/v1/callback
```

### 4. Update Google Cloud Console (if needed)

If users still can't log in, you may need to add your Vercel URL to Google Cloud Console:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Add to **Authorized JavaScript origins**:
   ```
   https://your-app-name.vercel.app
   ```
4. Add to **Authorized redirect URIs**:
   ```
   https://qvuarxsilushtbzaijtq.supabase.co/auth/v1/callback
   https://your-app-name.vercel.app/auth/callback
   ```

## 🔍 Troubleshooting

### Issue: "This site can't be reached" after Google login

**Cause:** The redirect URL is not properly configured.

**Solution:**
1. Check that `NEXT_PUBLIC_APP_URL` in Vercel matches your actual deployment URL
2. Verify Supabase redirect URLs include your Vercel domain
3. Ensure Google Cloud Console has the correct redirect URIs
4. Clear browser cookies and try again

### Issue: Only you can log in, others can't

**Cause:** Your Google account is set as a test user in Google Cloud Console.

**Solution:**
1. Go to Google Cloud Console → OAuth consent screen
2. Change Publishing status from "Testing" to "In Production"
3. OR add other users as test users in the "Test users" section

## 📋 Complete Environment Variables Checklist

Make sure all these are set in Vercel:

- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ GOOGLE_SHEETS_API_KEY
- ✅ GOOGLE_SHEET_ID
- ✅ CLICKHOUSE_API_URL
- ✅ CLICKHOUSE_AUTH_BASIC
- ✅ CLICKHOUSE_CF_CLIENT_ID
- ✅ CLICKHOUSE_CF_CLIENT_SECRET
- ✅ CLICKHOUSE_ACCOUNT_NAME
- ✅ CLICKHOUSE_ACCOUNT_PASSWORD
- ✅ CLICKHOUSE_URL
- ✅ OPENAI_API_KEY
- ✅ OPEN_API_URL
- ✅ AI_MODEL
- ✅ **NEXT_PUBLIC_APP_URL** (must be your Vercel URL, not localhost!)

## 🚀 Deployment Steps Summary

1. Deploy to Vercel
2. Get your Vercel deployment URL (e.g., `https://kkk.vercel.app`)
3. Update `NEXT_PUBLIC_APP_URL` in Vercel environment variables
4. Redeploy in Vercel
5. Update Supabase redirect URLs with your Vercel domain
6. Update Google Cloud Console redirect URIs
7. Test login with a different Google account

## 📞 Need Help?

If authentication still doesn't work after following these steps:
1. Check browser console for errors
2. Check Vercel deployment logs
3. Verify all URLs match exactly (no trailing slashes, correct protocol)
4. Try incognito/private browsing mode to rule out cookie issues
