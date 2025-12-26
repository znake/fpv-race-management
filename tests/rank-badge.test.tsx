import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RankBadge } from '../src/components/ui/rank-badge';

describe('RankBadge', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<RankBadge rank={1} />);
      const badge = document.querySelector('.rounded-full');
      expect(badge).toBeInTheDocument();
    });

    it('displays the rank number', () => {
      render(<RankBadge rank={1} />);
      const badge = document.querySelector('.rounded-full');
      expect(badge?.textContent).toBe('1');
    });

    it('displays rank 2', () => {
      render(<RankBadge rank={2} />);
      const badge = document.querySelector('.rounded-full');
      expect(badge?.textContent).toBe('2');
    });

    it('displays rank 3', () => {
      render(<RankBadge rank={3} />);
      const badge = document.querySelector('.rounded-full');
      expect(badge?.textContent).toBe('3');
    });

    it('displays rank 4', () => {
      render(<RankBadge rank={4} />);
      const badge = document.querySelector('.rounded-full');
      expect(badge?.textContent).toBe('4');
    });
  });

  describe('Rank Colors', () => {
    it('rank 1 has gold gradient', () => {
      render(<RankBadge rank={1} />);
      const badge = document.querySelector('.rounded-full');
      expect(badge).toHaveClass('from-yellow-400', 'to-yellow-600', 'text-black');
    });

    it('rank 2 has silver gradient', () => {
      render(<RankBadge rank={2} />);
      const badge = document.querySelector('.rounded-full');
      expect(badge).toHaveClass('from-gray-300', 'to-gray-500', 'text-black');
    });

    it('rank 3 has bronze gradient', () => {
      render(<RankBadge rank={3} />);
      const badge = document.querySelector('.rounded-full');
      expect(badge).toHaveClass('from-amber-600', 'to-amber-800', 'text-white');
    });

    it('rank 4 has pink gradient', () => {
      render(<RankBadge rank={4} />);
      const badge = document.querySelector('.rounded-full');
      expect(badge).toHaveClass('from-neon-pink', 'to-purple-600', 'text-white');
    });
  });

  describe('Size Variants', () => {
    it('renders with sm size', () => {
      render(<RankBadge rank={1} size="sm" />);
      const badge = document.querySelector('.rounded-full');
      expect(badge).toHaveClass('w-5', 'h-5', 'text-xs');
    });

    it('renders with md size (default)', () => {
      render(<RankBadge rank={1} size="md" />);
      const badge = document.querySelector('.rounded-full');
      expect(badge).toHaveClass('w-7', 'h-7', 'text-sm');
    });

    it('renders with lg size', () => {
      render(<RankBadge rank={1} size="lg" />);
      const badge = document.querySelector('.rounded-full');
      expect(badge).toHaveClass('w-9', 'h-9', 'text-base');
    });
  });

  describe('Animation', () => {
    it('does not show glow or pulse when animated is false (default)', () => {
      render(<RankBadge rank={1} />);
      const badge = document.querySelector('.rounded-full');
      expect(badge).not.toHaveClass('animate-pulse');
      expect(badge).not.toHaveClass('shadow-[0_0_10px_rgba(250,204,21,0.5)]');
    });

    it('shows glow when animated is true for rank 1', () => {
      render(<RankBadge rank={1} animated={true} />);
      const badge = document.querySelector('.rounded-full');
      expect(badge).toHaveClass('shadow-[0_0_10px_rgba(250,204,21,0.5)]', 'animate-pulse');
    });

    it('shows glow when animated is true for rank 2', () => {
      render(<RankBadge rank={2} animated={true} />);
      const badge = document.querySelector('.rounded-full');
      expect(badge).toHaveClass('shadow-[0_0_10px_rgba(156,163,175,0.5)]', 'animate-pulse');
    });

    it('shows glow when animated is true for rank 3', () => {
      render(<RankBadge rank={3} animated={true} />);
      const badge = document.querySelector('.rounded-full');
      expect(badge).toHaveClass('shadow-[0_0_10px_rgba(217,119,6,0.5)]', 'animate-pulse');
    });

    it('shows glow when animated is true for rank 4', () => {
      render(<RankBadge rank={4} animated={true} />);
      const badge = document.querySelector('.rounded-full');
      expect(badge).toHaveClass('shadow-[0_0_10px_rgba(236,72,153,0.5)]', 'animate-pulse');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with base classes', () => {
      render(<RankBadge rank={1} className="custom-class" />);
      const badge = document.querySelector('.rounded-full');
      expect(badge).toHaveClass('custom-class');
    });
  });

  describe('Base Styling', () => {
    it('has rounded-full and flex layout', () => {
      render(<RankBadge rank={1} />);
      const badge = document.querySelector('.rounded-full');
      expect(badge).toHaveClass('rounded-full', 'flex', 'items-center', 'justify-center', 'font-bold');
    });
  });
});
