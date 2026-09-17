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

  it('publishes the required privacy and disclaimer boundaries', async () => {
    await i18n.changeLanguage('en');
    render(<MemoryRouter initialEntries={['/privacy']}><App /></MemoryRouter>);
    expect(screen.getByText(/no user account and no binder-data backend/i)).toBeInTheDocument();
    expect(screen.getByText(/static host necessarily receives ordinary request metadata/i)).toBeInTheDocument();
    expect(screen.getByText(/clearing site data or the browser profile can delete local binder data/i)).toBeInTheDocument();
  });

  it('publishes the security model and organizational disclaimer', async () => {
    await i18n.changeLanguage('en');
    const { unmount } = render(<MemoryRouter initialEntries={['/security']}><App /></MemoryRouter>);
    expect(screen.getByText(/AES-GCM/i)).toBeInTheDocument();
    expect(screen.getByText(/There is no password recovery/i)).toBeInTheDocument();
    unmount();
    render(<MemoryRouter initialEntries={['/disclaimer']}><App /></MemoryRouter>);
    expect(screen.getByText(/Continuity Binder is an organizational tool/i)).toBeInTheDocument();
    expect(screen.getByText(/Verify legal documents and beneficiary designations/i)).toBeInTheDocument();
  });

  it('provides launch help that matches local storage and export behavior', async () => {
    await i18n.changeLanguage('en');
    render(<MemoryRouter initialEntries={['/help']}><App /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Using Continuity Binder' })).toBeInTheDocument();
    expect(screen.getByText(/no binder-data backend/i)).toBeInTheDocument();
    expect(screen.getByText(/readable archive and printed binder can be read without your passphrase/i)).toBeInTheDocument();
    expect(screen.getByText(/does not create or replace legal instruments/i)).toBeInTheDocument();
  });

  it('shows the three required first-run education screens before setup', async () => {
    render(<MemoryRouter initialEntries={['/binder/setup']}><App /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'This binder stays on this device.' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByRole('heading', { name: 'Create a passphrase you can preserve safely.' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByRole('heading', { name: 'Create encrypted backups regularly.' })).toBeInTheDocument();
  });
});
