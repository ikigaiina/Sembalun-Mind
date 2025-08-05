import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<Card>Test Card</Card>);
      expect(screen.getByText('Test Card')).toBeInTheDocument();
    });

    it('renders children correctly', () => {
      render(
        <Card>
          <h2>Card Title</h2>
          <p>Card content</p>
        </Card>
      );
      
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('renders with default styling classes', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      
      expect(card).toHaveClass('bg-white/80');
      expect(card).toHaveClass('rounded-3xl');
      expect(card).toHaveClass('shadow-lg');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('border-gray-100');
      expect(card).toHaveClass('backdrop-blur-sm');
    });
  });

  describe('Padding Variants', () => {
    it('applies default medium padding', () => {
      render(<Card data-testid="card">Default Padding</Card>);
      const card = screen.getByTestId('card');
      
      expect(card).toHaveClass('p-6');
    });

    it('applies small padding', () => {
      render(<Card padding="small" data-testid="card">Small Padding</Card>);
      const card = screen.getByTestId('card');
      
      expect(card).toHaveClass('p-4');
    });

    it('applies large padding', () => {
      render(<Card padding="large" data-testid="card">Large Padding</Card>);
      const card = screen.getByTestId('card');
      
      expect(card).toHaveClass('p-8');
    });
  });

  describe('Interactive Functionality', () => {
    it('applies cursor pointer when onClick is provided', () => {
      const handleClick = vi.fn();
      render(<Card onClick={handleClick} data-testid="card">Clickable Card</Card>);
      const card = screen.getByTestId('card');
      
      expect(card).toHaveClass('cursor-pointer');
    });

    it('does not apply cursor pointer when no onClick', () => {
      render(<Card data-testid="card">Static Card</Card>);
      const card = screen.getByTestId('card');
      
      expect(card).not.toHaveClass('cursor-pointer');
    });

    it('handles click events correctly', () => {
      const handleClick = vi.fn();
      render(<Card onClick={handleClick} data-testid="card">Clickable Card</Card>);
      const card = screen.getByTestId('card');
      
      fireEvent.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles mouse events correctly', () => {
      const handleMouseEnter = vi.fn();
      const handleMouseLeave = vi.fn();
      
      render(
        <Card 
          onMouseEnter={handleMouseEnter} 
          onMouseLeave={handleMouseLeave}
          data-testid="card"
        >
          Mouse Card
        </Card>
      );
      
      const card = screen.getByTestId('card');
      
      fireEvent.mouseEnter(card);
      expect(handleMouseEnter).toHaveBeenCalledTimes(1);
      
      fireEvent.mouseLeave(card);
      expect(handleMouseLeave).toHaveBeenCalledTimes(1);
    });
  });

  describe('Custom Styling', () => {
    it('merges custom className with default classes', () => {
      render(
        <Card className="custom-class bg-blue-100" data-testid="card">
          Custom Styled
        </Card>
      );
      const card = screen.getByTestId('card');
      
      expect(card).toHaveClass('custom-class');
      expect(card).toHaveClass('bg-blue-100');
      expect(card).toHaveClass('rounded-3xl'); // Default class should still be present
    });

    it('applies custom styles', () => {
      const customStyle = { backgroundColor: 'red', color: 'white' };
      render(
        <Card style={customStyle} data-testid="card">
          Custom Style
        </Card>
      );
      const card = screen.getByTestId('card');
      
      expect(card).toHaveStyle('background-color: rgb(255, 0, 0)');
      expect(card).toHaveStyle('color: white');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty content', () => {
      render(<Card data-testid="card"></Card>);
      
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('handles null children', () => {
      render(<Card data-testid="card">{null}</Card>);
      
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('handles undefined children', () => {
      render(<Card data-testid="card">{undefined}</Card>);
      
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('handles complex nested content', () => {
      render(
        <Card>
          <div>
            <h2>Card Title</h2>
            <div>
              <p>Nested content</p>
              <button>Action Button</button>
            </div>
          </div>
        </Card>
      );
      
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Nested content')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('is accessible as a div element', () => {
      render(<Card>Accessible Card</Card>);
      
      const card = screen.getByText('Accessible Card');
      expect(card.tagName).toBe('DIV');
    });

    it('supports custom attributes', () => {
      render(
        <Card 
          data-testid="accessible-card"
          role="article"
          aria-label="Card content"
        >
          Accessible Content
        </Card>
      );
      
      const card = screen.getByTestId('accessible-card');
      expect(card).toHaveAttribute('role', 'article');
      expect(card).toHaveAttribute('aria-label', 'Card content');
    });
  });

  describe('Performance', () => {
    it('maintains performance with frequent re-renders', () => {
      const { rerender } = render(<Card>Initial</Card>);
      
      const start = performance.now();
      
      // Simulate many re-renders
      for (let i = 0; i < 50; i++) {
        rerender(<Card>Render {i}</Card>);
      }
      
      const end = performance.now();
      const duration = end - start;
      
      expect(duration).toBeLessThan(500); // Should complete within 500ms
      expect(screen.getByText('Render 49')).toBeInTheDocument();
    });
  });
});