import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BottomNav from './BottomNav';

describe('BottomNav', () => {
  it('renders all nav items', () => {
    const onNavigate = vi.fn();
    render(<BottomNav active="map" onNavigate={onNavigate} />);

    expect(screen.getByText('Map')).toBeInTheDocument();
    expect(screen.getByText('Cards')).toBeInTheDocument();
    expect(screen.getByText('Deck')).toBeInTheDocument();
    expect(screen.getByText('Battle')).toBeInTheDocument();
    expect(screen.getByText('Ranks')).toBeInTheDocument();
  });

  it('calls onNavigate when an item is clicked', () => {
    const onNavigate = vi.fn();
    render(<BottomNav active="map" onNavigate={onNavigate} />);

    const deckButton = screen.getByText('Deck').closest('button');
    expect(deckButton).toBeDefined();
    
    if (deckButton) {
      fireEvent.click(deckButton);
      expect(onNavigate).toHaveBeenCalledWith('deck');
    }
  });

  it('highlights the active item', () => {
    const onNavigate = vi.fn();
    render(<BottomNav active="deck" onNavigate={onNavigate} />);

    const deckButton = screen.getByText('Deck').closest('button');
    const mapButton = screen.getByText('Map').closest('button');
    
    // Check styles or active state (we can check the style prop directly via test id or inline styles)
    // The active one has color #dca668
    expect(deckButton?.style.color).toBe('rgb(220, 166, 104)');
    expect(mapButton?.style.color).toBe('rgba(220, 166, 104, 0.6)');
  });
});
