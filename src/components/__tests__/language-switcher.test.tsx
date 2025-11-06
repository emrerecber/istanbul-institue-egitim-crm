import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import LanguageSwitcher, { LanguageToggle, LanguageSelector } from '../language-switcher';

// Mock the language context
const mockSetLanguage = jest.fn();
jest.mock('@/context/language-context', () => ({
  useLanguage: () => ({
    language: 'tr',
    setLanguage: mockSetLanguage,
    t: (key: string) => key,
  }),
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Default variant', () => {
    it('renders with Turkish language selected by default', () => {
      renderWithProviders(<LanguageSwitcher />);
      
      expect(screen.getByText('Türkçe')).toBeInTheDocument();
      expect(screen.getByText('🇹🇷')).toBeInTheDocument();
    });

    it('opens dropdown when clicked', async () => {
      renderWithProviders(<LanguageSwitcher />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('English')).toBeInTheDocument();
      });
    });

    it('changes language when option is selected', async () => {
      renderWithProviders(<LanguageSwitcher />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const englishOption = screen.getByText('English');
        fireEvent.click(englishOption);
      });

      expect(mockSetLanguage).toHaveBeenCalledWith('en');
    });

    it('closes dropdown when clicking outside', async () => {
      renderWithProviders(<LanguageSwitcher />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('English')).toBeInTheDocument();
      });

      // Click outside the dropdown
      fireEvent.mouseDown(document.body);

      await waitFor(() => {
        expect(screen.queryByText('English')).not.toBeInTheDocument();
      });
    });

    it('shows check mark for currently selected language', async () => {
      renderWithProviders(<LanguageSwitcher />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        // Should have check mark for Turkish (current language)
        const turkishOption = screen.getByText('Türkçe').closest('button');
        expect(turkishOption).toHaveClass('text-purple-600');
      });
    });
  });

  describe('Compact variant', () => {
    it('renders in compact mode', () => {
      renderWithProviders(<LanguageSwitcher variant="compact" />);
      
      expect(screen.getByText('TR')).toBeInTheDocument();
      expect(screen.getByText('🇹🇷')).toBeInTheDocument();
    });

    it('works without flags', () => {
      renderWithProviders(<LanguageSwitcher variant="compact" showFlag={false} />);
      
      expect(screen.getByText('TR')).toBeInTheDocument();
      expect(screen.queryByText('🇹🇷')).not.toBeInTheDocument();
    });
  });

  describe('Text-only variant', () => {
    it('renders text-only variant', () => {
      renderWithProviders(<LanguageSwitcher variant="text-only" />);
      
      expect(screen.getByText('Türkçe')).toBeInTheDocument();
      expect(screen.queryByText('🇹🇷')).not.toBeInTheDocument();
    });

    it('shows globe icon', () => {
      renderWithProviders(<LanguageSwitcher variant="text-only" />);
      
      const globeIcon = screen.getByRole('button').querySelector('svg');
      expect(globeIcon).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderWithProviders(<LanguageSwitcher />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'profile.language');
    });

    it('supports keyboard navigation', async () => {
      renderWithProviders(<LanguageSwitcher />);
      
      const button = screen.getByRole('button');
      
      // Tab to button and press Enter
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('English')).toBeInTheDocument();
      });

      // Press Escape to close
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    it('has proper flag alt text', () => {
      renderWithProviders(<LanguageSwitcher />);
      
      const flagSpan = screen.getByLabelText('Türkçe');
      expect(flagSpan).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('handles missing language gracefully', () => {
      // Override the mock to return undefined language
      const mockUseLanguage = jest.fn(() => ({
        language: undefined,
        setLanguage: mockSetLanguage,
        t: (key: string) => key,
      }));

      jest.doMock('@/context/language-context', () => ({
        useLanguage: mockUseLanguage,
      }));

      expect(() => {
        renderWithProviders(<LanguageSwitcher />);
      }).not.toThrow();
    });
  });
});

describe('LanguageToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders current language', () => {
    renderWithProviders(<LanguageToggle />);
    
    expect(screen.getByText('TR')).toBeInTheDocument();
    expect(screen.getByText('🇹🇷')).toBeInTheDocument();
  });

  it('toggles language on click', () => {
    renderWithProviders(<LanguageToggle />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockSetLanguage).toHaveBeenCalledWith('en');
  });

  it('has proper title attribute', () => {
    renderWithProviders(<LanguageToggle />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Switch to English');
  });

  it('hides text on small screens', () => {
    renderWithProviders(<LanguageToggle />);
    
    const textElement = screen.getByText('TR');
    expect(textElement).toHaveClass('hidden', 'sm:inline');
  });
});

describe('LanguageSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders both language options', () => {
    renderWithProviders(<LanguageSelector />);
    
    expect(screen.getByText('Türkçe')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('shows current selection', () => {
    renderWithProviders(<LanguageSelector />);
    
    const turkishButton = screen.getByText('Türkçe').closest('button');
    expect(turkishButton).toHaveClass('border-purple-500', 'bg-purple-50');
  });

  it('calls onChange when provided', () => {
    const mockOnChange = jest.fn();
    renderWithProviders(<LanguageSelector onChange={mockOnChange} />);
    
    const englishButton = screen.getByText('English').closest('button');
    fireEvent.click(englishButton!);

    expect(mockOnChange).toHaveBeenCalledWith('en');
  });

  it('uses context language when no value provided', () => {
    renderWithProviders(<LanguageSelector />);
    
    const englishButton = screen.getByText('English').closest('button');
    fireEvent.click(englishButton!);

    expect(mockSetLanguage).toHaveBeenCalledWith('en');
  });

  it('shows labels when enabled', () => {
    renderWithProviders(<LanguageSelector showLabels={true} />);
    
    expect(screen.getByText('profile.language')).toBeInTheDocument();
  });

  it('hides labels when disabled', () => {
    renderWithProviders(<LanguageSelector showLabels={false} />);
    
    expect(screen.queryByText('profile.language')).not.toBeInTheDocument();
  });

  it('uses provided value', () => {
    renderWithProviders(<LanguageSelector value="en" />);
    
    const englishButton = screen.getByText('English').closest('button');
    expect(englishButton).toHaveClass('border-purple-500', 'bg-purple-50');
    
    const turkishButton = screen.getByText('Türkçe').closest('button');
    expect(turkishButton).not.toHaveClass('border-purple-500', 'bg-purple-50');
  });
});

describe('Component Integration', () => {
  it('works with different language contexts', () => {
    renderWithProviders(<LanguageSwitcher />, { language: 'en' });
    
    // Mock should be overridden by the provider
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('maintains state across re-renders', async () => {
    const { rerender } = renderWithProviders(<LanguageSwitcher />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument();
    });

    rerender(<LanguageSwitcher />);

    // Dropdown should remain open
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    
    const { unmount } = renderWithProviders(<LanguageSwitcher />);
    
    // Open dropdown to add event listeners
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
  });
});