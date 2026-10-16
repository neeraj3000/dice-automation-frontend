import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { STATUS_META, uiStatus } from '../features/applications/statusMeta';
import TrackLinkedInModal from '../features/applications/TrackLinkedInModal';
import ApplicationHistoryModal from '../features/applications/ApplicationHistoryModal';
import UpdateStatusModal from '../features/applications/UpdateStatusModal';
import authReducer from '../features/auth/authSlice';
import { api } from '../app/api';

function renderWithProviders(ui) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </Provider>
  );
}

describe('LinkedIn Application Status Metadata', () => {
  it('correctly maps external statuses to appropriate labels and tones', () => {
    expect(uiStatus('APPLIED')).toBe('APPLIED');
    expect(uiStatus('DISCOVERED')).toBe('DISCOVERED');
    expect(uiStatus('INTERVIEWING')).toBe('INTERVIEWING');
    expect(uiStatus('OFFER')).toBe('OFFER');
    expect(uiStatus('REJECTED')).toBe('REJECTED');

    expect(STATUS_META.APPLIED.label).toBe('Applied');
    expect(STATUS_META.DISCOVERED.label).toBe('Tracked');
    expect(STATUS_META.INTERVIEWING.label).toBe('Interviewing');
    expect(STATUS_META.OFFER.label).toBe('Offer');
    expect(STATUS_META.REJECTED.label).toBe('Rejected');
    expect(STATUS_META.REJECTED.tone).toBe('rust');
  });
});

describe('TrackLinkedInModal Component', () => {
  it('renders modal with required inputs and mode selectors', () => {
    renderWithProviders(
      <TrackLinkedInModal open={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    expect(screen.getByText('Track LinkedIn Application')).toBeInTheDocument();
    expect(screen.getByLabelText(/LinkedIn Job URL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Job Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Company/i)).toBeInTheDocument();
    expect(screen.getByText('I applied on LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('Save as Tracked')).toBeInTheDocument();
    expect(screen.getByText(/User Confirmed/i)).toBeInTheDocument();
  });

  it('validates URL protocol and non-empty title and company before submission', async () => {
    renderWithProviders(
      <TrackLinkedInModal open={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    const submitBtn = screen.getByRole('button', { name: /Confirm & Record Application/i });

    // Submit with empty inputs
    fireEvent.click(submitBtn);
    expect(screen.getByRole('alert')).toHaveTextContent(/Job posting URL is required/i);

    // Provide invalid non-HTTP URL
    const urlInput = screen.getByLabelText(/LinkedIn Job URL/i);
    fireEvent.change(urlInput, { target: { value: 'ftp://linkedin.com/bad' } });
    fireEvent.click(submitBtn);
    expect(screen.getByRole('alert')).toHaveTextContent(/valid HTTP or HTTPS job URL/i);

    // Provide valid URL but empty title
    fireEvent.change(urlInput, { target: { value: 'https://www.linkedin.com/jobs/view/123456789' } });
    fireEvent.click(submitBtn);
    expect(screen.getByRole('alert')).toHaveTextContent(/Job title is required/i);

    // Provide title but empty company
    const titleInput = screen.getByLabelText(/Job Title/i);
    fireEvent.change(titleInput, { target: { value: 'Senior Backend Engineer' } });
    fireEvent.click(submitBtn);
    expect(screen.getByRole('alert')).toHaveTextContent(/Company name is required/i);
  });

  it('toggles status mode between Applied and Save as Tracked', () => {
    renderWithProviders(
      <TrackLinkedInModal open={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    const trackedModeBtn = screen.getByText('Save as Tracked');
    fireEvent.click(trackedModeBtn);

    expect(screen.getByRole('button', { name: /Save as Tracked Job/i })).toBeInTheDocument();

    const appliedModeBtn = screen.getByText('I applied on LinkedIn');
    fireEvent.click(appliedModeBtn);

    expect(screen.getByRole('button', { name: /Confirm & Record Application/i })).toBeInTheDocument();
  });
});

describe('ApplicationHistoryModal Component', () => {
  it('renders application details, User Confirmed badge, and timeline entries', () => {
    const mockApp = {
      id: 'app_linkedin_123',
      job_title: 'Staff Python Engineer',
      company: 'Tech Giants Inc',
      board: 'linkedin',
      status: 'APPLIED',
      status_provenance: 'user_confirmed',
      status_history: [
        {
          status: 'DISCOVERED',
          status_provenance: 'user_confirmed',
          actor: 'user',
          at: '2026-10-15T12:00:00Z',
          notes: 'Saved from LinkedIn search',
        },
        {
          status: 'APPLIED',
          status_provenance: 'user_confirmed',
          actor: 'user',
          at: '2026-10-16T14:30:00Z',
          notes: 'Submitted resume directly via company site',
        },
      ],
    };

    renderWithProviders(
      <ApplicationHistoryModal application={mockApp} onClose={vi.fn()} />
    );

    expect(screen.getByText('Application Status History')).toBeInTheDocument();
    expect(screen.getByText(/Staff Python Engineer at Tech Giants Inc/i)).toBeInTheDocument();
    expect(screen.getByText('User Confirmed')).toBeInTheDocument();
    expect(screen.getByText('Saved from LinkedIn search', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Submitted resume directly via company site', { exact: false })).toBeInTheDocument();
  });
});

describe('UpdateStatusModal Component', () => {
  it('renders status options and allows selecting a new status', () => {
    const mockApp = {
      id: 'app_update_456',
      job_title: 'Full Stack Engineer',
      company: 'Innovate Labs',
      status: 'APPLIED',
    };

    renderWithProviders(
      <UpdateStatusModal application={mockApp} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    expect(screen.getByText('Update Application Status')).toBeInTheDocument();
    expect(screen.getByText('Interviewing')).toBeInTheDocument();
    expect(screen.getByText('Offer')).toBeInTheDocument();
    expect(screen.getByText('Rejected')).toBeInTheDocument();
    expect(screen.getByLabelText(/Status Notes/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Status/i })).toBeInTheDocument();
  });
});
