# Production Deployment Checklist

## Pre-Deployment
- [ ] Set production environment variables in Vercel
- [ ] Run production build locally: `npm run build`
- [ ] Run type checking: `npm run type-check`
- [ ] Run linting: `npm run lint`
- [ ] Test PWA installation locally
- [ ] Test offline functionality
- [ ] Verify real-time updates work
- [ ] Test with multiple users concurrently

## Supabase Configuration
- [ ] Apply all migrations to production: `supabase db push --local`
- [ ] Verify RLS policies are correct
- [ ] Enable realtime on required tables
- [ ] Set up database backups
- [ ] Configure auth settings
- [ ] Add production URL to allowed origins

## Vercel Deployment
- [ ] Connect GitHub repository
- [ ] Set build command: `npm run build`
- [ ] Set development command: `npm run dev`
- [ ] Configure environment variables
- [ ] Enable Analytics
- [ ] Set up custom domain (if applicable)
- [ ] Configure redirect rules

## Post-Deployment Testing
- [ ] Test authentication flow
- [ ] Test checklist functionality
- [ ] Test manager dashboard
- [ ] Test real-time updates
- [ ] Test PWA installation on mobile devices
- [ ] Test offline functionality
- [ ] Verify 15 concurrent users performance
- [ ] Check Core Web Vitals scores
- [ ] Test on different browsers and devices

## Monitoring Setup
- [ ] Set up error tracking (Sentry/LogRocket)
- [ ] Configure uptime monitoring
- [ ] Set up performance monitoring
- [ ] Configure database monitoring
- [ ] Set up user analytics (if needed) 