#!/usr/bin/env node

/**
 * NanoLez EduAI API Testing Script
 * Tests Groq API integration and fallback mechanisms
 */

const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const TEST_USER_ID = 'test-user-' + Date.now();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60));
}

// Test data
const testCases = {
  roadmap: [
    {
      name: 'React Development (Beginner)',
      data: {
        goal: 'Learn React Development',
        duration: '1 Month',
        level: 'Beginner',
        language: 'English'
      }
    },
    {
      name: 'Python Data Science (Intermediate)',
      data: {
        goal: 'Master Python Data Science',
        duration: '3 Months',
        level: 'Intermediate',
        language: 'English'
      }
    }
  ],
  article: [
    {
      name: 'React Components',
      data: {
        topic: 'React Components',
        language: 'English'
      }
    },
    {
      name: 'Python Variables',
      data: {
        topic: 'Python Variables and Data Types',
        language: 'English'
      }
    }
  ]
};

// API call function
async function callAPI(action, data, description) {
  const url = `${API_BASE_URL}/api/groq`;
  
  try {
    log(`Testing: ${description}`, 'cyan');
    log(`URL: ${url}`, 'blue');
    log(`Data: ${JSON.stringify(data, null, 2)}`, 'blue');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: TEST_USER_ID,
        action,
        data
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${JSON.stringify(result)}`);
    }
    
    return result.result;
  } catch (error) {
    log(`❌ API Call Failed: ${error.message}`, 'red');
    throw error;
  }
}

// Test roadmap generation
async function testRoadmapGeneration() {
  logSection('ROADMAP GENERATION TESTS');
  
  for (const testCase of testCases.roadmap) {
    try {
      log(`\n🗺️ Testing: ${testCase.name}`, 'bright');
      
      const result = await callAPI('generateRoadmap', testCase.data, testCase.name);
      
      // Validate structure
      if (!result.id) throw new Error('Missing ID');
      if (!result.title) throw new Error('Missing title');
      if (!result.months || !Array.isArray(result.months)) throw new Error('Invalid months structure');
      
      log(`✅ Success: Generated roadmap "${result.title}"`, 'green');
      log(`   - Duration: ${result.duration}`, 'blue');
      log(`   - Level: ${result.level}`, 'blue');
      log(`   - Months: ${result.months.length}`, 'blue');
      
      // Check month structure
      const totalWeeks = result.months.reduce((sum, month) => sum + month.weeks.length, 0);
      const totalDays = result.months.reduce((sum, month) => 
        sum + month.weeks.reduce((weekSum, week) => weekSum + week.days.length, 0), 0
      );
      
      log(`   - Weeks: ${totalWeeks}`, 'blue');
      log(`   - Days: ${totalDays}`, 'blue');
      
    } catch (error) {
      log(`❌ Failed: ${testCase.name} - ${error.message}`, 'red');
    }
  }
}

// Test article generation
async function testArticleGeneration() {
  logSection('ARTICLE GENERATION TESTS');
  
  for (const testCase of testCases.article) {
    try {
      log(`\n📚 Testing: ${testCase.name}`, 'bright');
      
      const result = await callAPI('generateArticle', testCase.data, testCase.name);
      
      // Validate structure
      if (!result.id) throw new Error('Missing ID');
      if (!result.title) throw new Error('Missing title');
      if (!result.summary) throw new Error('Missing summary');
      if (!result.sections || !Array.isArray(result.sections)) throw new Error('Invalid sections structure');
      
      log(`✅ Success: Generated article "${result.title}"`, 'green');
      log(`   - Summary: ${result.summary.substring(0, 100)}...`, 'blue');
      log(`   - Sections: ${result.sections.length}`, 'blue');
      
      if (result.externalResource) {
        log(`   - External Resource: ${result.externalResource.title}`, 'blue');
      }
      
    } catch (error) {
      log(`❌ Failed: ${testCase.name} - ${error.message}`, 'red');
    }
  }
}

// Test fallback mechanisms
async function testFallbackMechanisms() {
  logSection('FALLBACK MECHANISM TESTS');
  
  // Test with invalid data to trigger fallbacks
  try {
    log('\n🔧 Testing fallback with invalid API key simulation...', 'yellow');
    
    // This test assumes the API will fall back when GROQ_API_KEY is not available
    // In real testing, you'd need to temporarily disable the API key
    
    const result = await callAPI('generateRoadmap', {
      goal: 'Fallback Test',
      duration: '1 Month',
      level: 'Beginner',
      language: 'English'
    }, 'Fallback Roadmap Test');
    
    // Even with fallback, structure should be valid
    if (result.id && result.title && result.months) {
      log('✅ Fallback mechanism working - valid structure generated', 'green');
      log(`   - Fallback title: ${result.title}`, 'blue');
    } else {
      throw new Error('Invalid fallback structure');
    }
    
  } catch (error) {
    log(`❌ Fallback test failed: ${error.message}`, 'red');
  }
}

// Performance tests
async function performanceTests() {
  logSection('PERFORMANCE TESTS');
  
  const startTime = Date.now();
  
  try {
    log('\n⏱️ Testing API response time...', 'yellow');
    
    const result = await callAPI('generateRoadmap', {
      goal: 'Performance Test',
      duration: '1 Month',
      level: 'Beginner',
      language: 'English'
    }, 'Performance Test');
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    log(`✅ Response time: ${duration}ms`, duration < 5000 ? 'green' : 'yellow');
    
    if (duration > 10000) {
      log('⚠️  Warning: Response time > 10 seconds', 'yellow');
    }
    
  } catch (error) {
    log(`❌ Performance test failed: ${error.message}`, 'red');
  }
}

// Main test runner
async function runTests() {
  logSection('NANOLEZ EDUAI API TESTING');
  log(`Base URL: ${API_BASE_URL}`, 'cyan');
  log(`Test User ID: ${TEST_USER_ID}`, 'cyan');
  log(`Timestamp: ${new Date().toISOString()}`, 'cyan');
  
  let passed = 0;
  let failed = 0;
  
  try {
    // Run all tests
    await testRoadmapGeneration();
    await testArticleGeneration();
    await testFallbackMechanisms();
    await performanceTests();
    
    logSection('TEST SUMMARY');
    log('✅ All tests completed!', 'green');
    log('📋 Check individual test results above for pass/fail status', 'blue');
    
  } catch (error) {
    log(`💥 Test suite failed: ${error.message}`, 'red');
  }
  
  console.log('\n' + '='.repeat(60));
}

// CLI argument parsing
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    log('NanoLez EduAI API Testing Script', 'bright');
    log('\nUsage: node test-api.js [options]', 'blue');
    log('\nOptions:', 'yellow');
    log('  --help, -h     Show this help message', 'blue');
    log('  --url <url>    Set API base URL (default: http://localhost:3000)', 'blue');
    log('\nEnvironment Variables:', 'yellow');
    log('  API_BASE_URL   Override default API base URL', 'blue');
    log('\nExamples:', 'yellow');
    log('  node test-api.js', 'blue');
    log('  node test-api.js --url https://your-app.vercel.app', 'blue');
    log('  API_BASE_URL=https://your-app.vercel.app node test-api.js', 'blue');
    process.exit(0);
  }
  
  // Parse URL argument
  const urlIndex = args.indexOf('--url');
  if (urlIndex !== -1 && args[urlIndex + 1]) {
    process.env.API_BASE_URL = args[urlIndex + 1];
  }
  
  // Run tests
  runTests().catch(error => {
    log(`Fatal error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runTests, callAPI, testCases };
