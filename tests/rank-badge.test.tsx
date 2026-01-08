import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RankBadge } from '../src/components/ui/rank-badge';

/**
 * US-14.5: Updated tests for new CSS class-based RankBadge
 * Now uses .rank-badge and .r1/.r2/.r3/.r4 CSS classes
 */
describe('RankBadge', () => {
  describe('Rendering', () => {
    it('renders with rank-badge class', () => {
      render(<RankBadge rank={1} />);
      const badge = document.querySelector('.rank-badge');
      expect(badge).toBeInTheDocument();
    });

    it('displays the rank number', () => {
      render(<RankBadge rank={1} />);
      const badge = document.querySelector('.rank-badge');
      expect(badge?.textContent).toBe('1');
    });

    it('displays rank 2', () => {
      render(<RankBadge rank={2} />);
      const badge = document.querySelector('.rank-badge');
      expect(badge?.textContent).toBe('2');
    });

    it('displays rank 3', () => {
      render(<RankBadge rank={3} />);
      const badge = document.querySelector('.rank-badge');
      expect(badge?.textContent).toBe('3');
    });

    it('displays rank 4', () => {
      render(<RankBadge rank={4} />);
      const badge = document.querySelector('.rank-badge');
      expect(badge?.textContent).toBe('4');
    });
  });

  describe('Rank Colors (CSS Classes)', () => {
    it('rank 1 has .r1 class for gold color', () => {
      render(<RankBadge rank={1} />);
      const badge = document.querySelector('.rank-badge.r1');
      expect(badge).toBeInTheDocument();
    });

    it('rank 2 has .r2 class for silver color', () => {
      render(<RankBadge rank={2} />);
      const badge = document.querySelector('.rank-badge.r2');
      expect(badge).toBeInTheDocument();
    });

    it('rank 3 has .r3 class for bronze color', () => {
      render(<RankBadge rank={3} />);
      const badge = document.querySelector('.rank-badge.r3');
      expect(badge).toBeInTheDocument();
    });

    it('rank 4 has .r4 class for cyan color', () => {
      render(<RankBadge rank={4} />);
      const badge = document.querySelector('.rank-badge.r4');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('renders with sm size (14px - mockup size)', () => {
      render(<RankBadge rank={1} size="sm" />);
      const badge = document.querySelector('.rank-badge');
      expect(badge).toBeInTheDocument();
      // sm is default mockup size: 14px (w-3.5 h-3.5)
      expect(badge).toHaveClass('w-3.5', 'h-3.5');
    });

    it('renders with md size', () => {
      render(<RankBadge rank={1} size="md" />);
      const badge = document.querySelector('.rank-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('w-5', 'h-5');
    });

    it('renders with lg size', () => {
      render(<RankBadge rank={1} size="lg" />);
      const badge = document.querySelector('.rank-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('w-7', 'h-7');
    });
  });

  describe('Animation', () => {
    it('does not show animation when animated is false (default)', () => {
      render(<RankBadge rank={1} />);
      const badge = document.querySelector('.rank-badge');
      expect(badge).not.toHaveClass('rank-badge-animate');
    });

    it('shows animation class when animated is true', () => {
      render(<RankBadge rank={1} animated={true} />);
      const badge = document.querySelector('.rank-badge');
      expect(badge).toHaveClass('rank-badge-animate');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with base classes', () => {
      render(<RankBadge rank={1} className="custom-class" />);
      const badge = document.querySelector('.rank-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('custom-class');
    });
  });

  describe('Base Styling', () => {
    it('has rank-badge base class', () => {
      render(<RankBadge rank={1} />);
      const badge = document.querySelector('.rank-badge');
      expect(badge).toBeInTheDocument();
      // Base CSS class provides: rounded, flex, centered
    });

    it('has correct rank class', () => {
      render(<RankBadge rank={2} />);
      const badge = document.querySelector('.rank-badge');
      expect(badge).toHaveClass('r2');
    });
  });
});
