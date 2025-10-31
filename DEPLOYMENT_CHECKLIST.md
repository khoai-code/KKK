# Deployment Checklist
**Application:** Client Context Finder - Digitization Team Dashboard
**Target Environment:** Production (Vercel)
**Date:** October 31, 2025

---

## Pre-Deployment Verification

### 1. Code Quality ✅
- [x] All TypeScript errors resolved
- [x] No console errors in development
- [x] All components properly typed
- [x] ESLint checks passing
- [x] Code formatted consistently

### 2. Build Verification
- [ ] Run production build: `npm run build`
  ```bash
  npm run build
  ```
- [ ] Verify build completes without errors
- [ ] Test production build locally: `npm run start`
- [ ] Verify all pages load correctly
- [ ] Check build size (should be <500KB for main bundle)

### 3. Environment Configuration
- [ ] Review `.env.local` for all required variables
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Prepare production environment variables
- [ ] Double-check no secrets in git history

---

## Vercel Deployment Setup

### 1. Create Vercel Project
- [ ] Log in to Vercel dashboard
- [ ] Click "Add New Project"
- [ ] Import from Git repository
- [ ] Select correct branch (main/production)

### 2. Configure Environment Variables
Copy these from your `.env.local` to Vercel dashboard:

#### Supabase (Required)
```
NEXT_PUBLIC_SUPABASE_URL=<your_production_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_production_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<your_production_service_role>
```

#### ClickHouse (Required)
```
CLICKHOUSE_API_URL=<your_clickhouse_url>
CLICKHOUSE_AUTH_BASIC=<base64_encoded_credentials>
CLICKHOUSE_CF_CLIENT_ID=<cloudflare_access_id>
CLICKHOUSE_CF_CLIENT_SECRET=<cloudflare_access_secret>
CLICKHOUSE_ACCOUNT_NAME=<clickhouse_account>
CLICKHOUSE_ACCOUNT_PASSWORD=<clickhouse_password>
```

#### OpenAI (Required)
```
OPENAI_API_KEY=<your_openai_key>
OPEN_API_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o
```

#### Google Sheets (Required)
```
GOOGLE_SHEETS_PRIVATE_KEY=<service_account_private_key>
GOOGLE_SHEETS_CLIENT_EMAIL=<service_account_email>
GOOGLE_SHEETS_SPREADSHEET_ID=<your_sheet_id>
```

### 3. Build Configuration
- [ ] Framework Preset: **Next.js**
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `.next`
- [ ] Install Command: `npm install`
- [ ] Node Version: **18.x or 20.x**

### 4. Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete (5-10 minutes)
- [ ] Check deployment logs for errors
- [ ] Note the production URL

---

## Post-Deployment Testing

### 1. Smoke Tests (Critical Path)
Visit your production URL and test:

#### Authentication Flow
- [ ] Navigate to login page
- [ ] Can log in with existing account
- [ ] Can log out successfully
- [ ] Protected routes redirect to login
- [ ] Session persists after refresh

#### Search Flow
- [ ] Can search for a client
- [ ] Search results display correctly
- [ ] Can select a client from results
- [ ] Recent searches are saved

#### Client Details Page
- [ ] Client Overview section loads
- [ ] Historical Data displays
- [ ] Project Volume shows correct counts
- [ ] Performance Metrics chart renders
- [ ] Recent Activities list appears
- [ ] Special Note can be edited and saved

#### AI Report Generation
- [ ] Click "Generate AI Report" button
- [ ] Report generates successfully
- [ ] Report displays correctly
- [ ] Report saved to history

#### Theme Switching
- [ ] Switch to Light mode - verify readability
- [ ] Switch to Dark mode - verify readability
- [ ] Switch to Asian mode - verify readability
- [ ] Theme persists after refresh

### 2. Integration Tests

#### Supabase Connection
- [ ] Authentication works
- [ ] Notes save successfully
- [ ] Search history saves
- [ ] Reports save to history

#### ClickHouse Connection
- [ ] Client data loads
- [ ] Performance metrics load
- [ ] Historical data loads
- [ ] Query caching works

#### OpenAI Connection
- [ ] AI reports generate
- [ ] Error handling works if API fails
- [ ] Response time acceptable (<10s)

#### Google Sheets Connection
- [ ] Client search works
- [ ] Client data is current
- [ ] Fuzzy matching works

### 3. Performance Checks
- [ ] Page load time <3 seconds
- [ ] Time to Interactive <5 seconds
- [ ] No console errors
- [ ] No 404 errors in Network tab
- [ ] Charts render smoothly
- [ ] Transitions are smooth

### 4. Mobile Testing
- [ ] Test on mobile browser (iOS Safari)
- [ ] Test on mobile browser (Android Chrome)
- [ ] Layout is responsive
- [ ] Touch interactions work
- [ ] Charts are readable
- [ ] Navigation works

---

## Security Verification

### 1. Authentication
- [ ] Cannot access protected routes when logged out
- [ ] Session expires appropriately
- [ ] No sensitive data in URL
- [ ] No tokens in browser console

### 2. API Security
- [ ] API routes require authentication
- [ ] Error messages don't expose sensitive info
- [ ] No API keys visible in Network tab
- [ ] CORS configured correctly

### 3. Environment Variables
- [ ] All sensitive keys are server-side only
- [ ] No NEXT_PUBLIC_ prefix on secrets
- [ ] .env.local not in git
- [ ] Production keys are different from dev

---

## Monitoring Setup (Post-Deployment)

### 1. Error Monitoring
- [ ] Set up Sentry (optional but recommended)
  ```bash
  npm install @sentry/nextjs
  npx @sentry/wizard@latest -i nextjs
  ```
- [ ] Configure error alerts
- [ ] Test error capture

### 2. Performance Monitoring
- [ ] Enable Vercel Analytics
- [ ] Review Web Vitals dashboard
- [ ] Set up performance alerts

### 3. API Usage Monitoring
- [ ] Monitor OpenAI API usage
- [ ] Monitor ClickHouse query counts
- [ ] Monitor Supabase database size
- [ ] Set billing alerts

---

## Documentation

### 1. User Documentation
- [ ] Create user guide for team
- [ ] Document key features
- [ ] Document known limitations
- [ ] Share with stakeholders

### 2. Technical Documentation
- [ ] Document environment variables
- [ ] Document deployment process
- [ ] Document troubleshooting steps
- [ ] Update README.md

### 3. Team Training
- [ ] Schedule demo session
- [ ] Walk through key features
- [ ] Address questions
- [ ] Collect feedback

---

## Rollback Plan

### If Deployment Fails:
1. Check Vercel deployment logs
2. Verify all environment variables
3. Test database connections
4. Revert to previous deployment if needed

### Rollback Steps:
```bash
# In Vercel dashboard:
1. Go to Deployments
2. Find previous working deployment
3. Click "..." menu
4. Click "Promote to Production"
```

---

## Success Criteria

Deployment is considered successful when:
- ✅ All smoke tests pass
- ✅ All integrations working
- ✅ No critical errors in logs
- ✅ Performance metrics acceptable
- ✅ Team can access and use app
- ✅ Mobile experience is good

---

## Post-Launch Tasks

### Week 1
- [ ] Monitor error logs daily
- [ ] Track API usage
- [ ] Collect user feedback
- [ ] Address any critical issues

### Week 2-4
- [ ] Review analytics
- [ ] Identify improvement areas
- [ ] Plan next features
- [ ] Optimize performance

### Ongoing
- [ ] Regular security updates
- [ ] Dependency updates
- [ ] Performance optimization
- [ ] Feature enhancements

---

## Contact Information

**Deployment Support:**
- Vercel Support: https://vercel.com/support
- Technical Issues: [Your Team Slack/Email]

**Service Status:**
- Vercel: https://www.vercel-status.com/
- Supabase: https://status.supabase.com/
- OpenAI: https://status.openai.com/

---

## Quick Reference

### Useful Commands
```bash
# Development
npm run dev

# Production Build
npm run build
npm run start

# Type Check
npm run type-check

# Lint
npm run lint
```

### Useful Links
- Production URL: [To be added after deployment]
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://app.supabase.com
- GitHub Repository: [Your repo URL]

---

**Last Updated:** October 31, 2025
**Next Review:** After first deployment
