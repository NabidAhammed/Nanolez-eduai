# Vercel Deployment Guide for NanoLez EduAI

## 🚀 Quick Deployment Steps

### 1. Prerequisites
- Node.js 18+ installed
- Vercel CLI installed (`npm install -g vercel`)
- Groq API key from [console.groq.com](https://console.groq.com/keys)

### 2. Environment Setup
1. Copy the environment example file:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Groq API key to `.env.local`:
   ```
   GROQ_API_KEY=your_actual_groq_api_key_here
   ```

### 3. Local Testing
Before deploying, test locally:
```bash
npm install
npm run dev
```

Visit `http://localhost:5173` to test the application.

### 4. Build Test
Ensure the build works:
```bash
npm run build
```

### 5. Deploy to Vercel
```bash
vercel --prod
```

## 🔧 Configuration Details

### Vercel Configuration (`vercel.json`)
- ✅ API routes properly configured with rewrites
- ✅ Static file serving configured
- ✅ Build and install commands set

### API Integration
- ✅ API endpoint uses relative path (`/api/groq`)
- ✅ Works both locally and in production
- ✅ Proper error handling and CORS configuration

### Environment Variables
Required in Vercel dashboard:
- `GROQ_API_KEY`: Your Groq API key

### Build Configuration
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## 🔍 Testing After Deployment

### 1. Basic Functionality
- [ ] Homepage loads correctly
- [ ] Create roadmap functionality works
- [ ] Generate article functionality works
- [ ] Theme toggle works
- [ ] Language selection works

### 2. API Testing
Use the provided test script:
```bash
npm run test:api:prod
```

### 3. Performance Check
- [ ] Page load speed < 3 seconds
- [ ] API responses < 10 seconds
- [ ] Mobile responsiveness

## 🛠️ Troubleshooting

### Common Issues

1. **API Key Missing**
   - Error: "GROQ_API_KEY environment variable is not configured"
   - Solution: Add `GROQ_API_KEY` in Vercel dashboard under Environment Variables

2. **Build Failures**
   - Check Node.js version compatibility
   - Ensure all dependencies are in package.json
   - Run `npm run build` locally first

3. **API Connection Issues**
   - Verify the API endpoint is `/api/groq` (not localhost)
   - Check CORS configuration in `api/groq.ts`
   - Test API manually: `curl https://your-app.vercel.app/api/groq`

4. **Static Assets Not Loading**
   - Check `public` folder structure
   - Verify Vite build output in `dist` folder

### Local Development
For local development with API:
```bash
# Terminal 1: Start mock API server
npm run dev:api

# Terminal 2: Start Vite dev server
npm run dev
```

### Debug Commands
```bash
# Check build output
ls -la dist/

# Test API endpoint
curl -X POST https://your-app.vercel.app/api/groq \
  -H "Content-Type: application/json" \
  -d '{"action":"generateRoadmap","data":{"goal":"Learn React","duration":"1 Month","level":"Beginner","language":"English"},"userId":"test-user"}'

# Check Vercel logs
vercel logs
```

## 📋 Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] API key added to Vercel
- [ ] Build passes locally
- [ ] No hardcoded localhost URLs (except in test files)
- [ ] All dependencies properly installed
- [ ] TypeScript compilation successful
- [ ] ESLint passes
- [ ] Test API functionality works

## 🎯 Success Metrics

After deployment, verify:
- ✅ Application loads without errors
- ✅ Roadmap generation works end-to-end
- ✅ Article generation works end-to-end
- ✅ User data persists correctly
- ✅ Mobile responsiveness maintained
- ✅ Performance optimized

## 🔄 Continuous Deployment

Vercel automatically deploys on:
- Push to main branch
- Pull request creation
- Manual deployment trigger

For custom workflows, configure in Vercel dashboard under "Git" settings.

---

## 📞 Support

If you encounter issues:
1. Check Vercel function logs: `vercel logs`
2. Test API endpoints manually
3. Verify environment variables
4. Check build output for errors

**Deployment URL**: `https://your-app.vercel.app` (replace with actual URL)
