import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { APP_NAME } from './constants';

describe('application baseline', () => {
  it('renders the canonical product name and tagline', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: APP_NAME })).toBeInTheDocument();
    expect(screen.getByText('Free as in beer. No account. No subscription. No catch.')).toBeInTheDocument();
  });

  it('states the local-first privacy boundary', () => {
    render(<App />);
    expect(screen.getByText(/encrypted on this device and is not sent to us/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Local-first does not mean magic.' })).toBeInTheDocument();
  });
});
