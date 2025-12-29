#!/usr/bin/env node

/**
 * Development API Server
 * Provides mock API responses for local development
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001; // Use port 3001 to avoid conflicts with Vite dev server

// Middleware
app.use(cors());
app.use(express.json());

// Generate mock UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Mock roadmap data
const mockRoadmaps = [
  {
    "title": "React Development Mastery",
    "months": [
      {
        "name": "Month 1: Foundations",
        "overview": "Learn React fundamentals and component-based architecture",
        "weeks": [
          {
            "name": "Week 1: React Basics",
            "weeklyGoal": "Understand React components, JSX, and component lifecycle",
            "days": [
              { "day": 1, "topic": "Introduction to React", "task": "Set up React development environment and create first component" },
              { "day": 2, "topic": "JSX Syntax", "task": "Practice JSX syntax and understand its benefits" },
              { "day": 3, "topic": "Components and Props", "task": "Create reusable components with props" },
              { "day": 4, "topic": "State and Events", "task": "Implement state management and event handling" },
              { "day": 5, "topic": "Conditional Rendering", "task": "Build components with conditional logic" },
              { "day": 6, "topic": "Lists and Keys", "task": "Render dynamic lists with proper keys" },
              { "day": 7, "topic": "Forms and Controlled Components", "task": "Build interactive forms with validation" }
            ]
          },
          {
            "name": "Week 2: Advanced Components",
            "weeklyGoal": "Master component patterns and lifecycle methods",
            "days": [
              { "day": 1, "topic": "Component Lifecycle", "task": "Understand mount, update, and unmount phases" },
              { "day": 2, "topic": "useEffect Hook", "task": "Implement side effects and cleanup" },
              { "day": 3, "topic": "Custom Hooks", "task": "Create reusable logic with custom hooks" },
              { "day": 4, "topic": "Context API", "task": "Manage global state with React Context" },
              { "day": 5, "topic": "Higher-Order Components", "task": "Implement HOC pattern for code reuse" },
              { "day": 6, "topic": "Render Props", "task": "Share logic using render props pattern" },
              { "day": 7, "topic": "Compound Components", "task": "Build flexible component APIs" }
            ]
          }
        ]
      },
      {
        "name": "Month 2: Advanced Patterns",
        "overview": "Learn advanced React patterns and performance optimization",
        "weeks": [
          {
            "name": "Week 3: Performance Optimization",
            "weeklyGoal": "Optimize React applications for better performance",
            "days": [
              { "day": 1, "topic": "React.memo and useMemo", "task": "Prevent unnecessary re-renders with memoization" },
              { "day": 2, "topic": "useCallback Hook", "task": "Optimize callback functions" },
              { "day": 3, "topic": "Code Splitting", "task": "Implement lazy loading and dynamic imports" },
              { "day": 4, "topic": "React Profiler", "task": "Analyze performance with React DevTools" },
              { "day": 5, "topic": "Bundle Optimization", "task": "Optimize webpack configuration and bundle size" },
              { "day": 6, "topic": "Virtual Scrolling", "task": "Implement virtual scrolling for large lists" },
              { "day": 7, "topic": "Performance Best Practices", "task": "Apply performance optimization techniques" }
            ]
          }
        ]
      }
    ]
  }
];

// Mock article data
const mockArticles = [
  {
    "title": "Understanding React Hooks",
    "summary": "A comprehensive guide to React Hooks, covering useState, useEffect, and custom hooks with practical examples and best practices.",
    "sections": [
      {
        "heading": "Introduction to React Hooks",
        "content": "React Hooks are functions that let you use state and other React features in functional components. They were introduced in React 16.8 and have revolutionized how we write React applications. Before hooks, you had to use class components to manage state and lifecycle methods. With hooks, functional components can now handle state, side effects, and complex logic. This makes code more reusable, easier to test, and reduces the complexity of component hierarchies."
      },
      {
        "heading": "Common Built-in Hooks",
        "content": "The most commonly used hooks are useState for managing component state, useEffect for handling side effects like data fetching or subscriptions, and useContext for consuming React Context. useState returns a pair of values: the current state and a function to update it. useEffect lets you perform side effects after the component renders. useContext allows you to access context values without wrapper components. Understanding these three hooks will cover most of your React development needs."
      },
      {
        "heading": "Creating Custom Hooks",
        "content": "Custom hooks are a powerful way to extract component logic into reusable functions. They follow the convention of starting with 'use' and can call other hooks inside them. Examples include useFetch for data fetching, useLocalStorage for persistent state, or useDebounce for input handling. Custom hooks promote code reuse, better separation of concerns, and make complex logic more maintainable. They're an excellent way to share stateful logic between components."
      },
      {
        "heading": "Best Practices and Common Pitfalls",
        "content": "Always call hooks at the top level of your function components, never inside loops, conditions, or nested functions. Use the dependency arrays in useEffect and useCallback to control when effects run. Memoize expensive calculations with useMemo and callback functions with useCallback when necessary. Remember that hooks are just JavaScript functions, so you can pass parameters, return values, and organize them into modules just like any other function."
      }
    ],
    "externalResource": {
      "title": "React Hooks Documentation",
      "url": "https://react.dev/reference/react",
      "source": "React Official Documentation"
    }
  }
];

// API Routes
app.post('/api/groq', (req, res) => {
  console.log('🎯 Mock API Request:', { method: req.method, body: req.body });
  
  const { action, data, userId } = req.body;
  
  if (!action || !data) {
    return res.status(400).json({ error: 'Action and data are required' });
  }

  console.log(`🚀 Processing action: ${action} for user: ${userId || 'anonymous'}`);

  try {
    switch (action) {
      case 'generateRoadmap': {
        const { goal, duration, level, language } = data;
        
        // Create a personalized roadmap based on input
        const roadmap = {
          id: generateUUID(),
          title: `${goal} - ${level} Level`,
          goal: goal,
          duration: duration,
          level: level,
          language: language,
          progress: 0,
          months: mockRoadmaps[0].months.map((month, index) => ({
            ...month,
            name: `Month ${index + 1}: ${goal} Focus`
          }))
        };
        
        console.log('✅ Generated mock roadmap');
        return res.status(200).json({ result: roadmap });
      }

      case 'generateArticle': {
        const { topic, language } = data;
        
        // Create a personalized article based on input
        const article = {
          id: generateUUID(),
          title: `Complete Guide to ${topic}`,
          summary: `A comprehensive guide covering ${topic} with practical examples and best practices.`,
          sections: mockArticles[0].sections.map(section => ({
            ...section,
            heading: section.heading.replace('React Hooks', topic)
          })),
          externalResource: {
            title: `Learn More About ${topic}`,
            url: "https://developer.mozilla.org/",
            source: "MDN Web Docs"
          }
        };
        
        console.log('✅ Generated mock article');
        return res.status(200).json({ result: article });
      }

      case 'chat': {
        const response = {
          content: `This is a mock response for your message about: "${data.messages[0]?.content || 'general topic'}". In a real implementation, this would connect to the Groq AI API for intelligent responses.`
        };
        
        console.log('✅ Generated mock chat response');
        return res.status(200).json({ result: response });
      }

      default:
        return res.status(400).json({ error: `Invalid action: ${action}` });
    }
  } catch (error) {
    console.error('💥 Mock API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api/groq`);
  console.log(`💡 This server provides mock responses for development`);
});

module.exports = app;
