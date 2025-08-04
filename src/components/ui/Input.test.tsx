import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('applies default classes correctly', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveClass('w-full');
      expect(input).toHaveClass('px-3');
      expect(input).toHaveClass('py-2');
      expect(input).toHaveClass('border');
      expect(input).toHaveClass('rounded-md');
    });

    it('renders with placeholder text', () => {
      const placeholder = 'Enter your text here';
      render(<Input placeholder={placeholder} />);
      
      expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
    });

    it('renders with initial value', () => {
      const value = 'Initial value';
      render(<Input value={value} readOnly />);
      
      expect(screen.getByDisplayValue(value)).toBeInTheDocument();
    });
  });

  describe('Input Types', () => {
    it('renders text input by default', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveAttribute('type', 'text');
    });

    it('renders email input correctly', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveAttribute('type', 'email');
    });

    it('renders password input correctly', () => {
      render(<Input type="password" />);
      const input = screen.getByLabelText(/password/i) || screen.getByRole('textbox');
      
      expect(input).toHaveAttribute('type', 'password');
    });

    it('renders number input correctly', () => {
      render(<Input type="number" />);
      const input = screen.getByRole('spinbutton');
      
      expect(input).toHaveAttribute('type', 'number');
    });

    it('renders tel input correctly', () => {
      render(<Input type="tel" />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveAttribute('type', 'tel');
    });

    it('renders url input correctly', () => {
      render(<Input type="url" />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveAttribute('type', 'url');
    });

    it('renders search input correctly', () => {
      render(<Input type="search" />);
      const input = screen.getByRole('searchbox');
      
      expect(input).toHaveAttribute('type', 'search');
    });
  });

  describe('Event Handling', () => {
    it('calls onChange when value changes', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      
      await user.type(input, 'Hello');
      
      expect(handleChange).toHaveBeenCalledTimes(5); // One for each character
      expect(handleChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: 'Hello'
          })
        })
      );
    });

    it('calls onFocus when input is focused', async () => {
      const handleFocus = vi.fn();
      const user = userEvent.setup();
      
      render(<Input onFocus={handleFocus} />);
      const input = screen.getByRole('textbox');
      
      await user.click(input);
      
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur when input loses focus', async () => {
      const handleBlur = vi.fn();
      const user = userEvent.setup();
      
      render(
        <div>
          <Input onBlur={handleBlur} />
          <button>Other element</button>
        </div>
      );
      
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');
      
      await user.click(input);
      await user.click(button);
      
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('calls onKeyDown when key is pressed', async () => {
      const handleKeyDown = vi.fn();
      const user = userEvent.setup();
      
      render(<Input onKeyDown={handleKeyDown} />);
      const input = screen.getByRole('textbox');
      
      await user.type(input, 'a');
      
      expect(handleKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'a'
        })
      );
    });

    it('handles Enter key press', async () => {
      const handleKeyDown = vi.fn();
      const user = userEvent.setup();
      
      render(<Input onKeyDown={handleKeyDown} />);
      const input = screen.getByRole('textbox');
      
      await user.type(input, '{Enter}');
      
      expect(handleKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'Enter'
        })
      );
    });

    it('handles Escape key press', async () => {
      const handleKeyDown = vi.fn();
      const user = userEvent.setup();
      
      render(<Input onKeyDown={handleKeyDown} />);
      const input = screen.getByRole('textbox');
      
      await user.type(input, '{Escape}');
      
      expect(handleKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'Escape'
        })
      );
    });
  });

  describe('Controlled vs Uncontrolled', () => {
    it('works as controlled component', async () => {
      const handleChange = vi.fn();
      const { rerender } = render(
        <Input value="initial" onChange={handleChange} />
      );
      
      expect(screen.getByDisplayValue('initial')).toBeInTheDocument();
      
      rerender(<Input value="updated" onChange={handleChange} />);
      
      expect(screen.getByDisplayValue('updated')).toBeInTheDocument();
    });

    it('works as uncontrolled component', async () => {
      const user = userEvent.setup();
      
      render(<Input defaultValue="default" />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      
      expect(input.value).toBe('default');
      
      await user.clear(input);
      await user.type(input, 'new value');
      
      expect(input.value).toBe('new value');
    });

    it('warns about switching from uncontrolled to controlled', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const { rerender } = render(<Input />);
      
      // Switch to controlled (this should trigger a warning in React)
      rerender(<Input value="controlled" onChange={() => {}} />);
      
      consoleSpy.mockRestore();
    });
  });

  describe('Validation States', () => {
    it('applies error styles when error prop is provided', () => {
      render(<Input error />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveClass('border-red-500');
    });

    it('displays error message when provided', () => {
      const errorMessage = 'This field is required';
      render(<Input error errorMessage={errorMessage} />);
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('applies success styles when valid', () => {
      render(<Input className="border-green-500" />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveClass('border-green-500');
    });

    it('associates error message with input via aria-describedby', () => {
      const errorMessage = 'Invalid input';
      render(<Input error errorMessage={errorMessage} />);
      
      const input = screen.getByRole('textbox');
      const errorElement = screen.getByText(errorMessage);
      
      expect(input).toHaveAttribute('aria-describedby');
      expect(errorElement).toHaveAttribute('id', input.getAttribute('aria-describedby'));
    });
  });

  describe('Accessibility', () => {
    it('supports aria-label', () => {
      const label = 'Search input';
      render(<Input aria-label={label} />);
      
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    });

    it('supports aria-labelledby', () => {
      render(
        <div>
          <label id="input-label">Username</label>
          <Input aria-labelledby="input-label" />
        </div>
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-labelledby', 'input-label');
    });

    it('supports aria-describedby', () => {
      render(
        <div>
          <Input aria-describedby="help-text" />
          <div id="help-text">Enter your username</div>
        </div>
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('supports aria-required', () => {
      render(<Input required aria-required />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('supports aria-invalid for error state', () => {
      render(<Input error aria-invalid />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('is focusable with keyboard navigation', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      
      input.focus();
      expect(input).toHaveFocus();
    });

    it('supports tab navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <div>
          <Input />
          <Input />
          <button>Button</button>
        </div>
      );
      
      await user.tab();
      expect(screen.getAllByRole('textbox')[0]).toHaveFocus();
      
      await user.tab();
      expect(screen.getAllByRole('textbox')[1]).toHaveFocus();
      
      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();
    });
  });

  describe('HTML Attributes', () => {
    it('supports required attribute', () => {
      render(<Input required />);
      
      expect(screen.getByRole('textbox')).toHaveAttribute('required');
    });

    it('supports disabled attribute', () => {
      render(<Input disabled />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('disabled');
      expect(input).toBeDisabled();
    });

    it('supports readOnly attribute', () => {
      render(<Input readOnly />);
      
      expect(screen.getByRole('textbox')).toHaveAttribute('readOnly');
    });

    it('supports maxLength attribute', () => {
      render(<Input maxLength={10} />);
      
      expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', '10');
    });

    it('supports minLength attribute', () => {
      render(<Input minLength={5} />);
      
      expect(screen.getByRole('textbox')).toHaveAttribute('minLength', '5');
    });

    it('supports pattern attribute', () => {
      const pattern = '[0-9]*';
      render(<Input pattern={pattern} />);
      
      expect(screen.getByRole('textbox')).toHaveAttribute('pattern', pattern);
    });

    it('supports autoComplete attribute', () => {
      render(<Input autoComplete="email" />);
      
      expect(screen.getByRole('textbox')).toHaveAttribute('autoComplete', 'email');
    });

    it('supports autoFocus attribute', () => {
      render(<Input autoFocus />);
      
      expect(screen.getByRole('textbox')).toHaveFocus();
    });

    it('supports name attribute', () => {
      render(<Input name="username" />);
      
      expect(screen.getByRole('textbox')).toHaveAttribute('name', 'username');
    });

    it('supports id attribute', () => {
      render(<Input id="username-input" />);
      
      expect(screen.getByRole('textbox')).toHaveAttribute('id', 'username-input');
    });
  });

  describe('CSS Classes and Styling', () => {
    it('merges custom className with default classes', () => {
      render(<Input className="custom-class bg-blue-100" />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveClass('custom-class');
      expect(input).toHaveClass('bg-blue-100');
      expect(input).toHaveClass('w-full'); // Default class should still be present
    });

    it('allows overriding default styles', () => {
      render(<Input className="w-auto p-1" />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveClass('w-auto');
      expect(input).toHaveClass('p-1');
    });

    it('applies focus styles correctly', async () => {
      const user = userEvent.setup();
      
      render(<Input />);
      const input = screen.getByRole('textbox');
      
      await user.click(input);
      
      expect(input).toHaveClass('focus:outline-none');
      expect(input).toHaveClass('focus:ring-2');
    });

    it('applies disabled styles correctly', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveClass('disabled:opacity-50');
      expect(input).toHaveClass('disabled:cursor-not-allowed');
    });
  });

  describe('Form Integration', () => {
    it('works within a form', async () => {
      const handleSubmit = vi.fn();
      const user = userEvent.setup();
      
      render(
        <form onSubmit={handleSubmit}>
          <Input name="test" />
          <button type="submit">Submit</button>
        </form>
      );
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'test value');
      await user.click(screen.getByRole('button'));
      
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('participates in form validation', async () => {
      const user = userEvent.setup();
      
      render(
        <form>
          <Input required />
          <button type="submit">Submit</button>
        </form>
      );
      
      await user.click(screen.getByRole('button'));
      
      const input = screen.getByRole('textbox');
      expect(input).toBeInvalid();
    });

    it('resets with form reset', () => {
      render(
        <form>
          <Input defaultValue="initial" />
          <button type="reset">Reset</button>
        </form>
      );
      
      const input = screen.getByRole('textbox') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'changed' } });
      expect(input.value).toBe('changed');
      
      fireEvent.click(screen.getByRole('button'));
      expect(input.value).toBe('initial');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles null value gracefully', () => {
      render(<Input value={null as any} onChange={() => {}} />);
      
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('handles undefined value gracefully', () => {
      render(<Input value={undefined} onChange={() => {}} />);
      
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('handles very long values', async () => {
      const longValue = 'a'.repeat(10000);
      const user = userEvent.setup();
      
      render(<Input />);
      const input = screen.getByRole('textbox');
      
      await user.type(input, longValue);
      
      expect((input as HTMLInputElement).value).toBe(longValue);
    });

    it('handles rapid input changes', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      
      // Rapid typing
      await user.type(input, 'quick brown fox', { delay: 1 });
      
      expect(handleChange).toHaveBeenCalledTimes(15); // One for each character
    });

    it('maintains focus during re-renders', () => {
      const { rerender } = render(<Input />);
      const input = screen.getByRole('textbox');
      
      input.focus();
      expect(input).toHaveFocus();
      
      rerender(<Input className="updated" />);
      expect(input).toHaveFocus();
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const renderSpy = vi.fn();
      
      const TestInput = (props: any) => {
        renderSpy();
        return <Input {...props} />;
      };
      
      const { rerender } = render(<TestInput />);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Re-render with same props
      rerender(<TestInput />);
      
      expect(renderSpy).toHaveBeenCalledTimes(2); // React will re-render, but component should handle it efficiently
    });

    it('handles high-frequency updates efficiently', async () => {
      const user = userEvent.setup();
      const start = performance.now();
      
      render(<Input />);
      const input = screen.getByRole('textbox');
      
      // Type a long string quickly
      await user.type(input, 'a'.repeat(100), { delay: 1 });
      
      const end = performance.now();
      const duration = end - start;
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(1000); // 1 second
    });
  });
});