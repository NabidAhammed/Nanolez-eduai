# TODO: Fix PHP Backend and API Integration Issues

## Problem Analysis
- Frontend making POST requests to `http://localhost:3000/api/` resulting in 500 Internal Server Error
- PHP not installed on Windows system
- Backend server not running
- API URL configuration mismatch

## Step-by-Step Fix Plan

### 1. Install PHP on Windows
- [ ] Download and install PHP from php.net
- [ ] Add PHP to system PATH
- [ ] Verify PHP installation

### 2. Fix API Configuration
- [ ] Update frontend API_BASE_URL to use relative path instead of absolute URL
- [ ] Configure Vite to proxy API requests to PHP backend
- [ ] Update CORS headers in PHP backend

### 3. Setup Backend Server
- [ ] Start PHP built-in server on a different port (e.g., 8080)
- [ ] Configure Vite proxy to forward /api requests to PHP server
- [ ] Test backend connectivity

### 4. Configure API Keys (Optional for testing)
- [ ] Set up environment variables for API keys
- [ ] Create fallback mock responses for testing without API keys

### 5. Test and Verify
- [ ] Test roadmap generation
- [ ] Test article fetching
- [ ] Verify all API endpoints work correctly

### 6. Final Integration
- [ ] Update documentation
- [ ] Create startup scripts for easy development
- [ ] Verify deployment configuration

## Files to Modify
- `src/eduaiapp.tsx` - Update API_BASE_URL
- `vite.config.ts` - Add proxy configuration
- `api/config.php` - Fix environment variable handling
- Create startup scripts for development
