# NanoLez EduAI 🚀

> **AI-Powered Personalized Learning Platform**  
> *Crafted by Nabid Ahammed Limon, RUET*

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Groq AI](https://img.shields.io/badge/Groq_AI-FF6B35?style=flat&logo=data:image/svg+xml&logoColor=white)](https://groq.com/)

## 🎯 Overview

NanoLez EduAI is a cutting-edge educational platform that leverages artificial intelligence to create personalized learning roadmaps and generate contextual educational content. Built with modern web technologies, it offers an intuitive interface for learners to define their goals and receive AI-generated, structured learning paths.

### ✨ Key Features

- **🧠 AI-Powered Roadmap Generation**: Intelligent creation of personalized learning paths based on goals, timeline, and skill level
- **📚 Dynamic Article Generation**: AI-generated educational articles tailored to specific learning topics
- **📊 Progress Tracking**: Visual progress indicators with completion tracking for daily tasks
- **🌍 Multi-Language Support**: Supports 10 languages including English, Spanish, French, German, Hindi, Bengali, Japanese, Chinese, Arabic, and Portuguese
- **🎨 Modern UI/UX**: Sleek, responsive design with light/dark theme support
- **👤 User Authentication**: Secure email-based login system with user data isolation
- **💾 Data Persistence**: Automatic local storage of user progress and preferences
- **⚡ Real-time Updates**: Instant generation and updates of learning content

## 🏗️ Architecture

### Technology Stack
- **Frontend Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Vite (rolldown-vite) for fast development and optimized builds
- **Styling**: Tailwind CSS for utility-first styling
- **UI Components**: Lucide React for consistent iconography
- **State Management**: Custom React hooks with localStorage persistence
- **Backend Integration**: Netlify Functions for AI API communication
- **AI Engine**: Groq API for content generation

### Project Structure
```
NanoLez-eduai/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx
│   │   ├── CreateRoadmap.tsx
│   │   ├── Roadmap.tsx
│   │   ├── ArticleView.tsx
│   │   ├── Login.tsx
│   │   └── Sidebar.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useUserData.ts
│   │   ├── useRoadmap.ts
│   │   ├── useArticle.ts
│   │   ├── useTheme.ts
│   │   └── useLanguage.ts
│   ├── utils/
│   │   ├── api.ts
│   │   └── storage.ts
│   ├── types/
│   │   └── index.ts
│   ├── constants/
│   │   └── index.ts
│   ├── App.tsx
│   ├── AppRefactored.tsx
│   ├── main.tsx
│   └── index.css
├── netlify/
│   └── functions/
│       ├── groq.ts
│       └── gemini.js
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── eslint.config.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Netlify CLI (for local function development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NanoLez-eduai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file in the root directory
   echo "VITE_GROQ_API_KEY=your_groq_api_key_here" > .env
   echo "VITE_NETLIFY_FUNCTIONS_URL=/.netlify/functions" >> .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

### Configuration

The application uses Netlify Functions for AI integration. Configure your functions in the `netlify/functions/` directory:

- `groq.ts`: Primary AI content generation function
- `gemini.js`: Alternative AI provider integration

## 📖 How It Works

### 1. User Authentication
- Email-based login system
- User-specific data isolation
- Session persistence across browser sessions

### 2. Roadmap Creation
1. **Goal Definition**: User specifies learning objective
2. **Parameter Setting**: Choose duration (1/3/6 months) and difficulty level
3. **AI Generation**: Groq API creates structured learning path
4. **Visual Organization**: Roadmap displayed as months → weeks → days hierarchy

### 3. Learning Experience
- **Daily Tasks**: Structured activities with clear objectives
- **Progress Tracking**: Checkbox completion with visual progress bar
- **Article Generation**: AI-created educational content for specific topics
- **External Resources**: Curated academic resources linked to content

### 4. Data Management
- Automatic localStorage persistence
- User-specific data isolation
- Cross-session data recovery

## 🎨 Design Philosophy

### User Experience
- **Minimalist Interface**: Clean, distraction-free learning environment
- **Progressive Disclosure**: Information revealed as needed
- **Visual Hierarchy**: Clear typography and spacing for readability
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Accessibility
- Semantic HTML structure
- Keyboard navigation support
- High contrast color schemes
- Screen reader compatibility

## 🔧 Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# ESLint code quality checks
npm run lint
```

### Code Quality

The project includes:
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting (recommended)
- **Tailwind CSS** for consistent styling

### Adding New Features

1. **Components**: Add new components in `src/components/`
2. **Hooks**: Create custom hooks in `src/hooks/`
3. **Types**: Define TypeScript interfaces in `src/types/`
4. **Utils**: Add utility functions in `src/utils/`

## 🌟 AI Integration

### Groq API Integration
The platform uses Groq's fast inference API for:
- **Roadmap Generation**: Creating structured learning paths
- **Article Creation**: Generating educational content
- **Content Enhancement**: Improving learning materials

### API Endpoints
```typescript
// Generate Learning Roadmap
POST /.netlify/functions/groq
{
  "userId": "string",
  "action": "generateRoadmap",
  "data": {
    "goal": "string",
    "duration": "string",
    "level": "string",
    "language": "string"
  }
}

// Generate Educational Article
POST /.netlify/functions/groq
{
  "userId": "string",
  "action": "generateArticle",
  "data": {
    "topic": "string",
    "language": "string"
  }
}
```

## 🚀 Deployment

### Netlify Deployment
1. **Connect Repository**: Link GitHub repository to Netlify
2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Environment Variables**: Configure API keys in Netlify dashboard
4. **Functions**: Deploy Netlify Functions for AI integration

### Manual Deployment
```bash
# Build the project
npm run build

# Deploy to your preferred hosting service
# Upload the dist/ folder contents
```

## 📊 Performance

- **Bundle Size**: Optimized with Vite's tree shaking
- **Loading Speed**: Lazy loading and code splitting
- **AI Response Time**: Groq API provides sub-second response times
- **Data Efficiency**: LocalStorage for offline capability

## 🔒 Security

- **User Data Isolation**: Each user's data is completely separated
- **Session Management**: Secure login/logout functionality
- **Input Validation**: Sanitized user inputs
- **API Security**: Secure communication with AI services

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain component modularity
- Write comprehensive type definitions
- Test AI integration endpoints
- Ensure responsive design compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Groq AI** for providing fast inference capabilities
- **Netlify** for seamless deployment and serverless functions
- **React Team** for the exceptional frontend framework
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for beautiful iconography

## 📞 Contact

**Nabid Ahammed Limon**  
📧 Email: [Your Email]  
🎓 Institution: RUET (Rajshahi University of Engineering & Technology)  
💼 LinkedIn: [Your LinkedIn]  
🐙 GitHub: [Your GitHub]

---

**Built with ❤️ and AI at RUET**

*Transforming education through intelligent personalization*
