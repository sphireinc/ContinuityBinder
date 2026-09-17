import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { APP_NAME, APP_TAGLINE } from './constants';

function BaselineApp() {
  return (
    <main>
      <h1>{APP_NAME}</h1>
      <p>{APP_TAGLINE}</p>
    </main>
  );
}

describe('application baseline', () => {
  it('renders the canonical product name and tagline', () => {
    render(<BaselineApp />);
    expect(screen.getByRole('heading', { name: APP_NAME })).toBeInTheDocument();
    expect(screen.getByText(APP_TAGLINE)).toBeInTheDocument();
  });
});
