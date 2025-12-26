import { render, screen, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PilotAvatar } from '../src/components/ui/pilot-avatar';

describe('PilotAvatar', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<PilotAvatar name="Test Pilot" />);
      const avatar = document.querySelector('.rounded-full');
      expect(avatar).toBeInTheDocument();
    });

    it('renders with image URL', () => {
      render(<PilotAvatar name="Test Pilot" imageUrl="https://example.com/pilot.jpg" />);
      const img = document.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/pilot.jpg');
      expect(img).toHaveAttribute('alt', 'Test Pilot');
    });

    it('renders fallback gradient when no image URL provided', () => {
      render(<PilotAvatar name="Test Pilot" />);
      const img = document.querySelector('img');
      expect(img).not.toBeInTheDocument();

      const gradientDiv = document.querySelector('.bg-gradient-to-br');
      expect(gradientDiv).toBeInTheDocument();
    });

    it('renders first letter of name in uppercase in fallback', () => {
      render(<PilotAvatar name="test pilot" />);
      const span = document.querySelector('.font-bold');
      expect(span?.textContent).toBe('T');
    });
  });

  describe('Image Error Handling', () => {
    it('shows fallback when image fails to load', () => {
      render(<PilotAvatar name="Test Pilot" imageUrl="https://invalid-url.com/broken.jpg" />);

      const img = document.querySelector('img') as HTMLImageElement;
      expect(img).toBeInTheDocument();

      // Simulate image error
      act(() => {
        if (img) {
          img.dispatchEvent(new Event('error'));
        }
      });

      // After error, should show fallback
      const span = document.querySelector('.font-bold');
      expect(span).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('renders with sm size', () => {
      render(<PilotAvatar name="Test Pilot" size="sm" />);
      const avatar = document.querySelector('.rounded-full');
      expect(avatar).toHaveClass('w-6', 'h-6');
    });

    it('renders with md size (default)', () => {
      render(<PilotAvatar name="Test Pilot" size="md" />);
      const avatar = document.querySelector('.rounded-full');
      expect(avatar).toHaveClass('w-10', 'h-10');
    });

    it('renders with lg size', () => {
      render(<PilotAvatar name="Test Pilot" size="lg" />);
      const avatar = document.querySelector('.rounded-full');
      expect(avatar).toHaveClass('w-16', 'h-16');
    });

    it('renders with xl size', () => {
      render(<PilotAvatar name="Test Pilot" size="xl" />);
      const avatar = document.querySelector('.rounded-full');
      expect(avatar).toHaveClass('w-24', 'h-24');
    });
  });

  describe('Glow Effect', () => {
    it('does not show glow when showGlow is false (default)', () => {
      render(<PilotAvatar name="Test Pilot" />);
      const avatar = document.querySelector('.rounded-full');
      expect(avatar).not.toHaveClass('shadow-glow-cyan');
    });

    it('shows glow when showGlow is true', () => {
      render(<PilotAvatar name="Test Pilot" showGlow={true} />);
      const avatar = document.querySelector('.rounded-full');
      expect(avatar).toHaveClass('shadow-glow-cyan');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with base classes', () => {
      render(<PilotAvatar name="Test Pilot" className="custom-class" />);
      const avatar = document.querySelector('.rounded-full');
      expect(avatar).toHaveClass('custom-class');
    });
  });

  describe('Base Styling', () => {
    it('has border styling', () => {
      render(<PilotAvatar name="Test Pilot" />);
      const avatar = document.querySelector('.rounded-full');
      expect(avatar).toHaveClass('border-2', 'border-cyber-cyan/50');
    });
  });
});
