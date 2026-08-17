import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import OfflinePage from './OfflinePage';

describe('OfflinePage', () => {
    it('renders the offline message', () => {
        render(<OfflinePage open={true} />);

        expect(screen.getByText('No Internet Connection')).toBeInTheDocument();
        expect(
            screen.getByText(
                'Please check your internet connection and try again.',
            ),
        ).toBeInTheDocument();
    });

    it('reloads the page when Try Again is clicked', () => {
        const reload = vi.fn();

        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { reload },
        });

        render(<OfflinePage open={true} />);

        fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));

        expect(reload).toHaveBeenCalled();
    });
});