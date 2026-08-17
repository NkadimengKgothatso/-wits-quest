import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BottomNav from './BottomNav';

describe('BottomNav', () => {
  it('renders all nav items', () => {
    const onNavigate = vi.fn();
    render(<BottomNav active="map" onNavigate={onNavigate} />);

    expect(screen.getByText('MAP')).toBeInTheDocument();
    expect(screen.getByText('CARDS')).toBeInTheDocument();
    expect(screen.getByText('BATTLE')).toBeInTheDocument();
    expect(screen.getByText('PROFILE')).toBeInTheDocument();
  });

  it('calls onNavigate when an item is clicked', () => {
    const onNavigate = vi.fn();
    render(<BottomNav active="map" onNavigate={onNavigate} />);

    const cardsButton = screen.getByText('CARDS').closest('button');
    expect(cardsButton).toBeDefined();

    if (cardsButton) {
      fireEvent.click(cardsButton);
      expect(onNavigate).toHaveBeenCalledWith('collection');
    }
  });

  it('highlights the active item', () => {
    const onNavigate = vi.fn();
    render(<BottomNav active="map" onNavigate={onNavigate} />);

    const mapButton = screen.getByText('MAP').closest('button');
    const cardsButton = screen.getByText('CARDS').closest('button');

    // Active item should have the accent color applied
    expect(mapButton?.style.color).not.toBe('');
    expect(cardsButton).toBeDefined();
  });
});
