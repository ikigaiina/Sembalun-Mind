import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// 2025 Enhanced utility function for merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Export alias for compatibility
export { cn as classNames };