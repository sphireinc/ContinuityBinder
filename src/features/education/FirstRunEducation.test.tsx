import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../i18n/config';
import { FirstRunEducation } from './FirstRunEducation';

describe('first-run education timer', () => {
  afterEach(() => vi.useRealTimers());

  it.each([
    [0, 'Continue'],
    [1, 'Continue'],
    [2, 'Begin Binder Setup'],
  ])('starts disabled at 5 and enables the expected action on step %s', (step, label) => {
    vi.useFakeTimers();
    const onNext = vi.fn();
    render(<FirstRunEducation step={step} onNext={onNext} />);
    const button = screen.getByRole('button', { name: '5...' });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onNext).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole('button', { name: '4...' })).toBeDisabled();
    act(() => vi.advanceTimersByTime(4000));
    expect(screen.getByRole('button', { name: label })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: label }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('resets on re-entry and cleans up after unmount', () => {
    vi.useFakeTimers();
    const onNext = vi.fn();
    const { rerender, unmount } = render(<FirstRunEducation step={0} onNext={onNext} />);
    act(() => vi.advanceTimersByTime(5000));
    rerender(<FirstRunEducation step={1} onNext={onNext} />);
    expect(screen.getByRole('button', { name: '5...' })).toBeDisabled();
    unmount();
    expect(() => act(() => vi.advanceTimersByTime(5000))).not.toThrow();
  });

  it('does not render a skip action and exposes a non-live countdown description', () => {
    vi.useFakeTimers();
    render(<FirstRunEducation step={1} onNext={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /skip/i })).not.toBeInTheDocument();
    expect(screen.getByText(/introduction button becomes available/i)).toHaveAttribute('aria-live', 'off');
  });
});
