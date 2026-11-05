import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ResumePicker from '../features/boards/ResumePicker';
import { describeProfileResumes } from '../features/boards/profileResumes';
import { storedFileName } from '../features/resumes/resumeFiles';

const RESUMES = [
  { id: 'r1', display_name: 'Data Engineer', file_name: 'de.pdf', target_role: 'Data Engineer', is_default: true },
  { id: 'r2', display_name: 'ML Engineer', file_name: 'ml.pdf', target_role: 'Machine Learning' },
  { id: 'r3', display_name: 'No Role', file_name: 'x.pdf' },
];

function Harness({ initial = [], resumes = RESUMES, onChange = () => {}, onUpload = () => {}, ...rest }) {
  const [ids, setIds] = useState(initial);
  return (
    <MemoryRouter>
      <ResumePicker
        resumes={resumes}
        selectedIds={ids}
        onUpload={onUpload}
        onChange={(next) => {
          setIds(next);
          onChange(next);
        }}
        {...rest}
      />
    </MemoryRouter>
  );
}

describe('storedFileName', () => {
  it('mirrors how the server renames uploads', () => {
    expect(storedFileName('Veera Sekhar (1).PDF')).toBe('Veera_Sekhar__1_.pdf');
    expect(storedFileName('resume.v2-final.docx')).toBe('resume.v2-final.docx');
    expect(storedFileName('cv \u{1F600}.pdf')).toBe('cv__.pdf');
  });
});

describe('describeProfileResumes', () => {
  it('treats an empty selection as the whole library', () => {
    expect(describeProfileResumes({ resume_ids: [] }, RESUMES).text).toBe('All resumes');
    expect(describeProfileResumes({}, RESUMES).text).toBe('All resumes');
  });

  it('names a single resume and counts several', () => {
    expect(describeProfileResumes({ resume_ids: ['r2'] }, RESUMES).text).toBe('Machine Learning');
    expect(describeProfileResumes({ resume_ids: ['r3'] }, RESUMES).text).toBe('No Role');
    expect(describeProfileResumes({ resume_ids: ['r1', 'r2'] }, RESUMES)).toMatchObject({
      text: '2 resumes',
      names: ['Data Engineer', 'Machine Learning'],
    });
  });

  it('reports deleted resumes, but only once the library has loaded', () => {
    expect(describeProfileResumes({ resume_ids: ['gone'] }, undefined)).toMatchObject({ text: '1 resume', allMissing: false });
    expect(describeProfileResumes({ resume_ids: ['gone'] }, RESUMES)).toMatchObject({
      text: 'Selected resumes deleted',
      allMissing: true,
    });
    expect(describeProfileResumes({ resume_ids: ['gone', 'r1'] }, RESUMES)).toMatchObject({
      text: 'Data Engineer',
      missingCount: 1,
      allMissing: false,
    });
  });
});

describe('ResumePicker', () => {
  it('lists the available resumes and toggles the selection', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    expect(screen.getByText('None selected: automations use the best match from all your resumes.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: /ML Engineer/ }));
    expect(onChange).toHaveBeenLastCalledWith(['r2']);
    expect(screen.getByText('Automations apply only with this resume.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox', { name: /Data Engineer/ }));
    expect(onChange).toHaveBeenLastCalledWith(['r2', 'r1']);

    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('shows what is selected, in the order it was picked, and removes from there', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    expect(screen.queryByRole('list', { name: 'Selected resumes' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox', { name: /ML Engineer/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Data Engineer/ }));
    const tray = screen.getByRole('list', { name: 'Selected resumes' });
    expect(within(tray).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Machine Learning', 'Data Engineer']);

    fireEvent.click(within(tray).getByRole('button', { name: 'Remove Machine Learning' }));
    expect(onChange).toHaveBeenLastCalledWith(['r1']);
    expect(screen.getByRole('checkbox', { name: /ML Engineer/ })).not.toBeChecked();
  });

  it('searches long lists without losing the selection', () => {
    const many = Array.from({ length: 8 }, (_, i) => ({ id: `m${i}`, display_name: `Resume ${i}`, file_name: `${i}.pdf` }));
    render(<Harness resumes={many} initial={['m7']} />);

    fireEvent.change(screen.getByRole('textbox', { name: 'Search resumes' }), { target: { value: 'resume 3' } });
    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
    // Filtered out of the list, but still on show as selected
    expect(within(screen.getByRole('list', { name: 'Selected resumes' })).getByText('Resume 7')).toBeInTheDocument();
  });

  it('warns about deleted resumes in the selection', () => {
    render(<Harness initial={['gone', 'r1']} />);
    expect(screen.getByRole('alert')).toHaveTextContent('1 selected resume was deleted');
  });

  it('does not call a selection deleted while resumes are unavailable', () => {
    const onRetry = vi.fn();
    render(<Harness initial={['r1']} resumes={[]} isError onRetry={onRetry} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('offers an upload when the library is empty', () => {
    render(<Harness resumes={[]} />);
    expect(screen.getByText(/You have no resumes yet/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload resume' })).toBeEnabled();
  });

  it('holds the upload back until the library is known, so duplicates can be recognised', () => {
    render(<Harness resumes={[]} isLoading />);
    expect(screen.getByRole('button', { name: 'Upload resume' })).toBeDisabled();
  });
});
