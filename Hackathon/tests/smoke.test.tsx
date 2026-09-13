import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { Shell } from '@/App';

describe('Shell', () => {
  it('renders the AI EXPO brand', () => {
    render(
      <MemoryRouter>
        <Shell />
      </MemoryRouter>,
    );
    expect(screen.getAllByText('AI EXPO').length).toBeGreaterThan(0); // the HUD brand; later the footer repeats it
  });
});
