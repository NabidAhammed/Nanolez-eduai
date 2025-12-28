# NanoLez EduAI - Deployment Guide

## Overview
This guide covers deploying the NanoLez EduAI application with Groq AI integration to Vercel.

## Prerequisites
1. **Groq API Key**: Get your free API key from [console.groq.com](https://console.groq.com/keys)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **GitHub Account**: For version control (recommended)

## Environment Setup

### 1. Get Groq API Key
1. Visit [console.groq.com](https://console.groq.com/keys)
2. Sign up or log in
3. Create a new API key
4. Copy the key (starts with `gsk_`)

### 2. Local Development Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd NanoLez-eduai

# Install dependencies
npm install

# Create local environment file
cp .env.example .env.local

# Edit .env.local with your Groq API key
# GROQ_API_KEY=gsk_your_actual_api_key_here
```

### 3. Vercel Environment Variables
1. Go to [vercel.com](https://vercel.com) and import your project
2. In project settings, go to **Environment Variables**
3. Add the following variable:
   - **Name**: `GROQ_API_KEY`
   - **Value**: Your Groq API key
   - **Environment**: Production, Preview, Development

## Deployment Steps

### Option 1: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variable
vercel env add GROQ_API_KEY
```

### Option 2: GitHub Integration
1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push

### Option 3: Manual Upload
1. Zip the project folder
2. Upload to Vercel dashboard
3. Configure environment variables
4. Deploy

## Testing the Deployment

### 1. Basic Functionality Test
1. Visit your deployed URL
2. Click "New Path" to create a roadmap
3. Fill out the form with:
   - **Goal**: "Learn React Development"
   - **Duration**: "1 Month"
   - **Level**: "Beginner"
   - **Language**: "English"
4. Click "Generate Trajectory"
5. Verify roadmap is created with proper structure

### 2. Article Generation Test
1. In the created roadmap, click "Core Lesson" on any day
2. Wait for article generation (should take 10-30 seconds)
3. Verify article opens with:
   - Title and summary
   - Multiple sections with content
   - External resource link

### 3. Fallback Testing
1. Temporarily remove or invalidate the Groq API key
2. Test roadmap and article generation
3. Verify fallback content is generated
4. Restore API key and test again

### 4. Browser Compatibility Test
Test in multiple browsers:
- Chrome/Chromium
- Firefox
- Safari
- Edge

## Troubleshooting

### Common Issues

#### 1. "API Error: GROQ_API_KEY not found"
**Solution**: Ensure environment variable is set correctly in Vercel
- Check variable name: `GROQ_API_KEY`
- Verify it's added to all environments
- Redeploy after adding variable

#### 2. "Network error: Unable to connect to server"
**Solution**: Check API endpoint configuration
- Verify `/api/groq.ts` exists
- Check vercel.json rewrites configuration
- Ensure CORS headers are set

#### 3. "crypto.randomUUID is not a function"
**Solution**: This should be fixed by the UUID fallback
- Clear browser cache
- Test in incognito mode
- Check browser console for errors

#### 4. Slow API responses
**Solution**: 
- Check Groq API rate limits
- Monitor Vercel function logs
- Consider reducing max_tokens in prompts

### Debug Mode
Enable debug logging by checking browser console:
- API calls will show detailed logs
- Fallback decisions are logged
- Error details are captured

### Environment-Specific Testing

#### Local Development
```bash
npm run dev
# Uses fallback data automatically
# Check browser console for mock data indicators
```

#### Vercel Preview
- Use preview URL for testing
- Environment variables apply to preview
- Test before promoting to production

#### Production
- Final production deployment
- Full Groq integration active
- Monitor for any runtime errors

## Performance Optimization

### 1. API Response Caching
- Vercel automatically caches responses
- Consider implementing client-side caching
- Monitor API usage to avoid rate limits

### 2. Error Handling
- App gracefully falls back to mock data
- User-friendly error messages
- Detailed logging for debugging

### 3. Browser Compatibility
- UUID generation works in all modern browsers
- Fallback for older browsers included
- Progressive enhancement approach

## Monitoring and Maintenance

### 1. Vercel Analytics
- Monitor function execution times
- Track error rates
- Review usage patterns

### 2. Groq API Monitoring
- Track API usage in Groq console
- Monitor rate limits
- Review billing and usage

### 3. Regular Updates
- Keep dependencies updated
- Monitor Groq API changes
- Test new features before deployment

## Support

If you encounter issues:
1. Check browser console for errors
2. Review Vercel function logs
3. Verify environment variables
4. Test with fallback mode enabled

## Next Steps

After successful deployment:
1. Set up custom domain (optional)
2. Configure analytics
3. Set up monitoring alerts
4. Plan feature updates

## Security Notes

- Never commit API keys to version control
- Use environment variables for all secrets
- Regularly rotate API keys
- Monitor API usage for unusual activity
