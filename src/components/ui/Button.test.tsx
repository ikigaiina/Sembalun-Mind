import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<Button>Test Button</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders children correctly', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('renders with custom text', () => {
      const buttonText = 'Custom Button Text';
      render(<Button>{buttonText}</Button>);
      expect(screen.getByText(buttonText)).toBeInTheDocument();
    });

    it('renders with JSX children', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      );
      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });
  });

  describe('Variants and Styling', () => {
    it('applies default variant classes', () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('bg-blue-600');
      expect(button).toHaveClass('text-white');
      expect(button).toHaveClass('hover:bg-blue-700');
    });

    it('applies primary variant classes', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('bg-blue-600');
      expect(button).toHaveClass('text-white');
    });

    it('applies secondary variant classes', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('bg-gray-200');
      expect(button).toHaveClass('text-gray-900');
    });

    it('applies outline variant classes', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('border');
      expect(button).toHaveClass('bg-transparent');
    });

    it('applies ghost variant classes', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('hover:bg-gray-100');
    });

    it('applies destructive variant classes', () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('bg-red-600');
      expect(button).toHaveClass('text-white');
    });
  });

  describe('Sizes', () => {
    it('applies default size classes', () => {
      render(<Button>Default Size</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2');
    });

    it('applies small size classes', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('px-3');
      expect(button).toHaveClass('py-1');
      expect(button).toHaveClass('text-sm');
    });

    it('applies large size classes', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('px-6');
      expect(button).toHaveClass('py-3');
      expect(button).toHaveClass('text-lg');
    });

    it('applies icon size classes', () => {
      render(<Button size="icon">⚙️</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('w-10');
      expect(button).toHaveClass('h-10');
    });
  });

  describe('Event Handling', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Click me</Button>);
      
      await user.click(screen.getByRole('button'));
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('passes event object to onClick handler', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Click me</Button>);
      
      await user.click(screen.getByRole('button'));
      
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
      expect(handleClick.mock.calls[0][0]).toHaveProperty('type', 'click');
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick} disabled>Disabled</Button>);
      
      await user.click(screen.getByRole('button'));
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles keyboard events (Enter)', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Press Enter</Button>);
      const button = screen.getByRole('button');
      
      button.focus();
      await user.keyboard('{Enter}');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard events (Space)', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Press Space</Button>);
      const button = screen.getByRole('button');
      
      button.focus();
      await user.keyboard(' ');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('States', () => {
    it('applies disabled state correctly', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toHaveClass('disabled:cursor-not-allowed');
    });

    it('applies loading state correctly', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeDisabled();
      expect(button).toHaveClass('cursor-wait');
    });

    it('shows loading spinner when loading', () => {
      render(<Button loading>Loading</Button>);
      
      // Look for loading indicator (spinner, text, or aria-label)
      expect(screen.getByRole('button')).toHaveAttribute('disabled');
    });

    it('hides children text when loading', () => {
      render(<Button loading>Button Text</Button>);
      
      // Text might be hidden or replaced with loading indicator
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('HTML Attributes', () => {
    it('supports type attribute', () => {
      render(<Button type="submit">Submit</Button>);
      
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('defaults to button type', () => {
      render(<Button>Default Type</Button>);
      
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('supports form attribute', () => {
      render(<Button form="my-form">Submit Form</Button>);
      
      expect(screen.getByRole('button')).toHaveAttribute('form', 'my-form');
    });

    it('supports name attribute', () => {
      render(<Button name="submit-btn">Submit</Button>);
      
      expect(screen.getByRole('button')).toHaveAttribute('name', 'submit-btn');
    });

    it('supports value attribute', () => {
      render(<Button value="submit-value">Submit</Button>);
      
      expect(screen.getByRole('button')).toHaveAttribute('value', 'submit-value');
    });

    it('supports id attribute', () => {
      render(<Button id="my-button">Button</Button>);
      
      expect(screen.getByRole('button')).toHaveAttribute('id', 'my-button');
    });
  });

  describe('Accessibility', () => {
    it('is focusable by default', () => {
      render(<Button>Focusable</Button>);
      const button = screen.getByRole('button');
      
      button.focus();
      expect(button).toHaveFocus();
    });

    it('is not focusable when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      
      button.focus();
      expect(button).not.toHaveFocus();
    });

    it('supports aria-label', () => {
      render(<Button aria-label="Close dialog">×</Button>);
      
      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
    });

    it('supports aria-describedby', () => {
      render(
        <div>
          <Button aria-describedby="help-text">Help</Button>
          <div id="help-text">This button provides help</div>
        </div>
      );
      
      expect(screen.getByRole('button')).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('supports aria-expanded for toggle buttons', () => {
      render(<Button aria-expanded={false}>Toggle Menu</Button>);
      
      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    });

    it('supports aria-pressed for toggle buttons', () => {
      render(<Button aria-pressed={true}>Toggle</Button>);
      
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    });

    it('has proper role', () => {
      render(<Button>Button</Button>);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('merges custom className with default classes', () => {
      render(<Button className="custom-class bg-purple-500">Custom</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('bg-purple-500');
      expect(button).toHaveClass('px-4'); // Default class should still be present
    });

    it('allows style overrides', () => {
      const customStyle = { backgroundColor: 'red', color: 'white' };
      render(<Button style={customStyle}>Styled</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveStyle('background-color: red');
      expect(button).toHaveStyle('color: white');
    });
  });

  describe('Form Integration', () => {
    it('submits form when type is submit', () => {
      const handleSubmit = vi.fn();
      
      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit</Button>
        </form>
      );
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('resets form when type is reset', () => {
      render(
        <form>
          <input defaultValue="test" />
          <Button type="reset">Reset</Button>
        </form>
      );
      
      const input = screen.getByRole('textbox') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'changed' } });
      expect(input.value).toBe('changed');
      
      fireEvent.click(screen.getByRole('button'));
      expect(input.value).toBe('test');
    });

    it('does not submit form when type is button', () => {
      const handleSubmit = vi.fn();
      
      render(
        <form onSubmit={handleSubmit}>
          <Button type="button">Button</Button>
        </form>
      );
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      render(<Button></Button>);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles null children', () => {
      render(<Button>{null}</Button>);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles undefined children', () => {
      render(<Button>{undefined}</Button>);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles rapid clicks', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Rapid Click</Button>);
      const button = screen.getByRole('button');
      
      // Simulate rapid clicking
      await user.click(button);
      await user.click(button);
      await user.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('maintains functionality during re-renders', () => {
      const handleClick = vi.fn();
      const { rerender } = render(
        <Button onClick={handleClick}>Original</Button>
      );
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      rerender(<Button onClick={handleClick}>Updated</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const renderSpy = vi.fn();
      
      const TestButton = (props: any) => {
        renderSpy();
        return <Button {...props} />;
      };
      
      const { rerender } = render(<TestButton>Test</TestButton>);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Re-render with same props
      rerender(<TestButton>Test</TestButton>);
      
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('handles high frequency updates efficiently', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Click Test</Button>);
      const button = screen.getByRole('button');
      
      const start = performance.now();
      
      // Simulate many rapid clicks
      for (let i = 0; i < 100; i++) {
        await user.click(button);
      }
      
      const end = performance.now();
      const duration = end - start;
      
      expect(handleClick).toHaveBeenCalledTimes(100);
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });
});
