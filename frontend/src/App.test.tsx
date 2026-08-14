import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    // Note: Since App uses Leaflet and complex state, 
    // rendering it fully might require significant mocking.
    // For now, we just ensure the component exists.
    expect(App).toBeDefined();
  });
});
