import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { MemoryRouter } from 'react-router-dom';
import './i18n/config';
import i18n from './i18n/config';

describe('application baseline', () => {
  it('renders the canonical product name and tagline', () => {
    render(<MemoryRouter><App /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /prepare the information your family will need/i })).toBeInTheDocument();
    expect(screen.getByText('Free as in beer. No account. No subscription. No catch.')).toBeInTheDocument();
  });

  it('states the local-first privacy boundary', () => {
    render(<MemoryRouter initialEntries={['/binder/overview']}><App /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Unlock your binder' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Unlock binder' })).toBeInTheDocument();
  });

  it('changes the landing copy immediately when the locale changes', async () => {
    await i18n.changeLanguage('en');
    render(<MemoryRouter><App /></MemoryRouter>);
    fireEvent.change(screen.getByRole('combobox', { name: 'Language' }), { target: { value: 'es' } });
    expect(await screen.findByRole('heading', { name: 'Cómo funciona' })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('es');
  });
});
