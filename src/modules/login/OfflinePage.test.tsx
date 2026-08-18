import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import OfflinePage from './OfflinePage';

const { mockReloadPage } = vi.hoisted(() => ({
  mockReloadPage: vi.fn(),
}));

vi.mock('../../utils/browser', () => ({
  reloadPage: mockReloadPage,
}));

beforeEach(() => {
  mockReloadPage.mockClear();
});

describe('OfflinePage', () => {
  it('renders the offline message', () => {
    render(<OfflinePage open={true} />);

    expect(
      screen.getByRole('dialog', { name: /no internet connection/i }),
    ).toBeInTheDocument();
  });

  it('reloads the page when Try Again is clicked', () => {
    render(<OfflinePage open={true} />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Try Again' }),
    );

    expect(mockReloadPage).toHaveBeenCalled();
  });
});