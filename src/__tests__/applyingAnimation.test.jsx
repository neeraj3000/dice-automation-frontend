import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ApplyingAnimationModal from '../features/jobs/ApplyingAnimationModal';

describe('ApplyingAnimationModal', () => {
  const mockJob = {
    id: 'job-123',
    title: 'Senior Frontend Engineer',
    company: 'TechCorp Global',
    url: 'https://example.com/job/123',
  };

  it('renders nothing when open is false', () => {
    const { container } = render(
      <ApplyingAnimationModal
        open={false}
        job={mockJob}
        stage="applying"
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders centered applying animation and status while applying', () => {
    render(
      <ApplyingAnimationModal
        open={true}
        job={mockJob}
        stage="applying"
        message="Connecting & submitting application via Dice..."
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Applying to Job')).toBeInTheDocument();
    expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
    expect(screen.getByText('TechCorp Global')).toBeInTheDocument();
    expect(screen.getByText('Connecting & submitting application via Dice...')).toBeInTheDocument();
    expect(screen.getByText(/Automating submission/i)).toBeInTheDocument();
  });

  it('renders celebratory success checkmark and marked as applied upon success', () => {
    render(
      <ApplyingAnimationModal
        open={true}
        job={mockJob}
        stage="success"
        message="Application submitted successfully!"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Application Submitted!')).toBeInTheDocument();
    expect(screen.getByText('Marked as Applied')).toBeInTheDocument();
    expect(screen.getByText(/Successfully submitted to/i)).toBeInTheDocument();
    expect(screen.getByText('TechCorp Global')).toBeInTheDocument();
  });

  it('renders failure state and handles dismiss', () => {
    const handleClose = vi.fn();
    render(
      <ApplyingAnimationModal
        open={true}
        job={mockJob}
        stage="failed"
        message="Dice session expired. Please re-authenticate."
        onClose={handleClose}
      />
    );

    expect(screen.getByText('Application Incomplete')).toBeInTheDocument();
    expect(screen.getByText('Dice session expired. Please re-authenticate.')).toBeInTheDocument();
    
    const dismissButton = screen.getByRole('button', { name: /Dismiss/i });
    fireEvent.click(dismissButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
