import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { LanguageProvider } from '@/context/language-context';
import { Session } from 'next-auth';

// Mock session data
export const mockSession: Session = {
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
  },
  expires: '2024-12-31',
};

export const mockAdminSession: Session = {
  user: {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
  },
  expires: '2024-12-31',
};

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: Session | null;
  language?: 'tr' | 'en';
}

function AllTheProviders({ 
  children, 
  session = null, 
  language = 'tr' 
}: { 
  children: React.ReactNode; 
  session?: Session | null;
  language?: 'tr' | 'en';
}) {
  return (
    <SessionProvider session={session}>
      <LanguageProvider defaultLanguage={language}>
        {children}
      </LanguageProvider>
    </SessionProvider>
  );
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    session = null,
    language = 'tr',
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders session={session} language={language}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
}

// Mock fetch responses
export const mockFetchResponse = (data: any, ok = true, status = 200) => {
  const mockFetch = jest.fn().mockResolvedValueOnce({
    ok,
    status,
    json: jest.fn().mockResolvedValueOnce(data),
    text: jest.fn().mockResolvedValueOnce(JSON.stringify(data)),
  });
  
  global.fetch = mockFetch;
  return mockFetch;
};

export const mockFetchError = (error: string) => {
  const mockFetch = jest.fn().mockRejectedValueOnce(new Error(error));
  global.fetch = mockFetch;
  return mockFetch;
};

// Mock audit data
export const mockAuditReport = {
  id: '1',
  url: 'https://example.com',
  status: 'completed',
  overallScore: 78,
  createdAt: '2024-01-01T00:00:00.000Z',
  completedAt: '2024-01-01T00:05:00.000Z',
  categories: {
    performance: {
      score: 75,
      metrics: {
        fcp: 1200,
        lcp: 2500,
        cls: 0.1,
        fid: 50,
        ttfb: 200
      },
      issues: ['Slow server response time']
    },
    seo: {
      score: 85,
      hasMetaDescription: true,
      hasStructuredData: false,
      issues: ['Missing structured data']
    },
    security: {
      score: 90,
      hasHTTPS: true,
      hasSecurityHeaders: true,
      issues: []
    },
    usability: {
      score: 70,
      mobileScore: 65,
      accessibilityScore: 75,
      issues: ['Poor mobile navigation']
    },
    content: {
      score: 80,
      readabilityScore: 75,
      issues: ['Complex sentences detected']
    }
  },
  recommendations: [
    {
      id: 'rec-1',
      type: 'performance',
      priority: 'high',
      title: 'Optimize images',
      description: 'Compress and resize images for better performance'
    }
  ]
};

// Mock package data
export const mockPackages = [
  {
    id: '1',
    name: 'Basic Audit',
    price: 99,
    currency: 'TRY',
    auditsIncluded: 1,
    features: ['Performance Analysis', 'SEO Check', 'Basic Report']
  },
  {
    id: '2',
    name: 'Advanced Audit',
    price: 199,
    currency: 'TRY',
    auditsIncluded: 3,
    features: ['Performance Analysis', 'SEO Check', 'Security Audit', 'Detailed Report']
  }
];

// Mock user data
export const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  createdAt: '2024-01-01T00:00:00.000Z',
  purchases: [
    {
      id: '1',
      packageId: '1',
      packageName: 'Basic Audit',
      purchaseDate: '2024-01-01T00:00:00.000Z',
      auditsRemaining: 1
    }
  ]
};

// Test event helpers
export const createMockEvent = (eventInit: Partial<Event> = {}) => ({
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  ...eventInit,
});

export const createMockKeyboardEvent = (key: string, eventInit: Partial<KeyboardEvent> = {}) => ({
  ...createMockEvent(eventInit),
  key,
  code: `Key${key.toUpperCase()}`,
  keyCode: key.charCodeAt(0),
  which: key.charCodeAt(0),
});

export const createMockMouseEvent = (eventInit: Partial<MouseEvent> = {}) => ({
  ...createMockEvent(eventInit),
  clientX: 0,
  clientY: 0,
  button: 0,
  buttons: 1,
  ...eventInit,
});

// Async test helpers
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

export const flushPromises = () => {
  return new Promise(resolve => setImmediate(resolve));
};

// Mock intersection observer entry
export const mockIntersectionObserverEntry = (
  isIntersecting = false,
  intersectionRatio = 0
): IntersectionObserverEntry => ({
  isIntersecting,
  intersectionRatio,
  intersectionRect: {} as DOMRectReadOnly,
  boundingClientRect: {} as DOMRectReadOnly,
  rootBounds: {} as DOMRectReadOnly,
  target: document.createElement('div'),
  time: Date.now(),
});

// Mock file for testing file uploads
export const createMockFile = (
  name = 'test.txt',
  size = 1024,
  type = 'text/plain'
): File => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

// Custom test hooks
export const renderHook = <T>(hook: () => T) => {
  let result: T;
  let error: Error | undefined;

  const TestComponent = () => {
    try {
      result = hook();
    } catch (err) {
      error = err as Error;
    }
    return null;
  };

  const { rerender, unmount } = render(<TestComponent />);

  return {
    result: {
      get current() {
        if (error) throw error;
        return result;
      }
    },
    rerender: () => rerender(<TestComponent />),
    unmount
  };
};

// Mock window dimensions
export const mockWindowDimensions = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });

  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

// Mock API endpoints
export const mockApiEndpoints = {
  // Audit endpoints
  '/api/audits': () => mockFetchResponse([mockAuditReport]),
  '/api/audits/1': () => mockFetchResponse(mockAuditReport),
  '/api/audits/start': () => mockFetchResponse({ id: '1', status: 'pending' }),
  
  // Package endpoints
  '/api/packages': () => mockFetchResponse(mockPackages),
  '/api/packages/1/purchase': () => mockFetchResponse({ success: true }),
  
  // User endpoints
  '/api/user/profile': () => mockFetchResponse(mockUser),
  '/api/user/purchases': () => mockFetchResponse(mockUser.purchases),
  
  // Admin endpoints
  '/api/admin/stats': () => mockFetchResponse({
    totalUsers: 1000,
    totalSales: 500,
    totalRevenue: 50000,
    totalAudits: 2000,
    monthlyGrowth: 15
  }),
  '/api/admin/analytics': () => mockFetchResponse({
    userBehavior: {
      totalUsers: 1000,
      activeUsers: 800,
      newUsers: 100
    }
  })
};

// Accessibility test helpers
export const expectToBeAccessible = async (element: HTMLElement) => {
  // Basic accessibility checks
  const hasAriaLabel = element.getAttribute('aria-label') !== null;
  const hasRole = element.getAttribute('role') !== null;
  const hasTabIndex = element.getAttribute('tabindex') !== null;
  const isButton = element.tagName === 'BUTTON';
  const isLink = element.tagName === 'A';
  const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName);
  
  if (isButton || isLink || isInput) {
    // Interactive elements should be accessible
    expect(hasAriaLabel || hasRole || hasTabIndex || element.textContent).toBeTruthy();
  }
  
  // Check for proper heading hierarchy
  if (element.tagName.match(/^H[1-6]$/)) {
    expect(element.textContent).toBeTruthy();
  }
  
  // Check for alt text on images
  if (element.tagName === 'IMG') {
    expect(element.getAttribute('alt')).toBeTruthy();
  }
};

// Performance testing helpers
export const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now();
  renderFn();
  await waitForLoadingToFinish();
  const end = performance.now();
  return end - start;
};

// Re-export testing library utilities
export * from '@testing-library/react';
export * from '@testing-library/user-event';

// Export custom render as default render
export { renderWithProviders as render };