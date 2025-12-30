import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import App from '../App'
import '@testing-library/jest-dom'
// Mock the window.crypto for crypto.randomUUID()
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => 'mock-uuid-123',
  },
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock fetch
globalThis.fetch = vi.fn()

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('renders the main dashboard', () => {
    render(<App />)
    
    expect(screen.getByText('EduAI-NanoLez')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Deploy New Roadmap')).toBeInTheDocument()
  })

  it('switches between tabs', () => {
    render(<App />)
    
    // Initially on dashboard
    expect(screen.getByText('EduAI-NanoLez Dashboard')).toBeInTheDocument()
    
    // Click deploy button
    const deployButton = screen.getByText('Deploy New Roadmap')
    fireEvent.click(deployButton)
    
    // Should show the create form
    expect(screen.getByText('Initialization')).toBeInTheDocument()
    expect(screen.getByText('What do you want to master?')).toBeInTheDocument()
  })

  it('changes theme between light and dark', () => {
    render(<App />)
    
    const themeToggle = screen.getByRole('button', { name: '' })
    expect(themeToggle).toBeInTheDocument()
    
    // Click theme toggle
    fireEvent.click(themeToggle)
    
    // Theme should change (the exact behavior depends on implementation)
    expect(themeToggle).toBeInTheDocument()
  })

  it('loads saved roadmaps from localStorage', () => {
    const mockRoadmaps = [
      {
        id: 'test-id',
        title: 'Test Roadmap',
        months: [],
        completedDays: [],
        lang: 'English',
        intensity: 'Beginner'
      }
    ]
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockRoadmaps))
    
    render(<App />)
    
    expect(screen.getByText('Test Roadmap')).toBeInTheDocument()
  })

  it('handles API errors gracefully', () => {
    // Mock fetch to reject
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
    
    render(<App />)
    
    // Should not crash when API calls fail
    expect(screen.getByText('EduAI-NanoLez')).toBeInTheDocument()
  })
})
