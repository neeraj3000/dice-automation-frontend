import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SearchProfilesPage from '../features/boards/SearchProfilesPage';
import AutomationFormModal from '../features/automations/AutomationFormModal';

const { mocks, mutation } = vi.hoisted(() => ({
  mutation: (fn) => () => [(arg) => ({ unwrap: () => fn(arg) }), { isLoading: false }],
  mocks: {
    profiles: [],
    resumes: undefined,
    create: vi.fn(),
    upload: vi.fn(),
    refetchResumes: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('../features/boards/searchProfilesApi', () => ({
  useGetSearchProfilesQuery: () => ({ data: mocks.profiles, isLoading: false, isFetching: false, refetch: vi.fn() }),
  useCreateSearchProfileMutation: mutation(mocks.create),
  useUpdateSearchProfileMutation: mutation(mocks.update),
  useDeleteSearchProfileMutation: mutation(vi.fn()),
  useRunSearchProfileMutation: mutation(vi.fn()),
}));

vi.mock('../features/resumes/resumesApi', () => ({
  useGetResumesQuery: () => ({ data: mocks.resumes, isLoading: false, isError: false, refetch: mocks.refetchResumes }),
  useUploadResumeMutation: () => [(arg) => ({ unwrap: () => mocks.upload(arg) })],
}));

vi.mock('../features/automations/automationsApi', () => ({
  useCreateAutomationMutation: mutation(vi.fn()),
  useUpdateAutomationMutation: mutation(vi.fn()),
}));

const RESUMES = [
  { id: 'r1', display_name: 'Data Engineer', file_name: 'de.pdf' },
  { id: 'r2', display_name: 'ML Engineer', file_name: 'ml.pdf', cloudinary_url: 'https://files.test/ml.pdf' },
];

const PROFILE = { id: 'p1', name: 'Data roles', keywords: ['spark'], resume_ids: ['gone', 'r2'] };

const renderPage = () => render(<MemoryRouter><SearchProfilesPage /></MemoryRouter>);

beforeEach(() => {
  mocks.profiles = [];
  mocks.resumes = RESUMES;
  mocks.create.mockReset().mockResolvedValue({});
  mocks.update.mockReset().mockResolvedValue({});
  mocks.upload.mockReset();
  mocks.refetchResumes.mockReset().mockResolvedValue({});
});

describe('Search Profiles page', () => {
  it('sends the selected resumes when creating a profile', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Create your first profile' }));
    fireEvent.change(screen.getByLabelText('Profile name'), { target: { value: 'Data roles' } });
    fireEvent.change(screen.getByLabelText('Keywords'), { target: { value: 'spark' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /ML Engineer/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Create profile' }));

    await waitFor(() => expect(mocks.create).toHaveBeenCalledTimes(1));
    expect(mocks.create.mock.calls[0][0].resume_ids).toEqual(['r2']);
  });

  it('shows the selection on the card and drops deleted resumes when saving an edit', async () => {
    mocks.profiles = [PROFILE];
    renderPage();
    expect(screen.getByText('ML Engineer')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /more|actions|menu/i }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Edit profile' }));
    expect(screen.getByRole('checkbox', { name: /ML Engineer/ })).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(mocks.update).toHaveBeenCalledTimes(1));
    expect(mocks.update.mock.calls[0][0].resume_ids).toEqual(['r2']);
  });

  it('lists a profile\'s resumes on its card and previews them', () => {
    mocks.profiles = [{ ...PROFILE, resume_ids: ['r1', 'r2'] }];
    renderPage();

    const section = screen.getByRole('region', { name: 'Resumes for Data roles' });
    expect(within(section).getAllByRole('listitem')).toHaveLength(2);

    fireEvent.click(within(section).getByRole('button', { name: 'Preview ML Engineer' }));
    expect(screen.getByTitle('Preview of ml.pdf')).toHaveAttribute('src', 'https://files.test/ml.pdf');
  });

  it('collapses long resume lists on the card', () => {
    mocks.resumes = Array.from({ length: 6 }, (_, i) => ({ id: `m${i}`, display_name: `Resume ${i}`, file_name: `${i}.pdf` }));
    mocks.profiles = [{ ...PROFILE, resume_ids: mocks.resumes.map((r) => r.id) }];
    renderPage();

    const section = screen.getByRole('region', { name: 'Resumes for Data roles' });
    expect(within(section).getAllByRole('listitem')).toHaveLength(4);
    fireEvent.click(within(section).getByRole('button', { name: 'Show all 6' }));
    expect(within(section).getAllByRole('listitem')).toHaveLength(6);
  });

  it('explains a profile using the whole library, or one whose resumes were deleted', () => {
    mocks.profiles = [
      { ...PROFILE, id: 'p2', name: 'Open', resume_ids: [] },
      { ...PROFILE, id: 'p3', name: 'Orphaned', resume_ids: ['gone'] },
    ];
    renderPage();

    expect(screen.getByRole('region', { name: 'Resumes for Open' })).toHaveTextContent('All resumes, using the best match');
    expect(screen.getByRole('region', { name: 'Resumes for Orphaned' })).toHaveTextContent('were deleted');
  });

  it('closes only the preview on Escape, keeping what was typed in the form', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Create your first profile' }));
    fireEvent.change(screen.getByLabelText('Profile name'), { target: { value: 'Half written' } });
    fireEvent.click(screen.getByRole('button', { name: 'Preview ML Engineer' }));
    expect(screen.getByTitle('Preview of ml.pdf')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    return waitFor(() => expect(screen.queryByTitle('Preview of ml.pdf')).not.toBeInTheDocument()).then(() => {
      expect(screen.getByLabelText('Profile name')).toHaveValue('Half written');
    });
  });

  it('gives page scrolling back after a refresh lands while a preview is open over the form', () => {
    const page = <MemoryRouter><SearchProfilesPage /></MemoryRouter>;
    const { rerender } = render(page);
    fireEvent.click(screen.getByRole('button', { name: 'Create your first profile' }));
    fireEvent.click(screen.getByRole('button', { name: 'Preview ML Engineer' }));
    expect(document.body.style.overflow).toBe('hidden');

    // Returning to the tab refetches queries, which re-renders the page behind the preview
    rerender(page);
    rerender(page);
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.body.style.overflow).toBe('hidden'); // the form is still open
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(document.body.style.overflow).toBe('');
  });

  it('keeps the selection untouched if resumes have not loaded', async () => {
    mocks.profiles = [PROFILE];
    mocks.resumes = undefined;
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /more|actions|menu/i }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Edit profile' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(mocks.update).toHaveBeenCalledTimes(1));
    expect(mocks.update.mock.calls[0][0].resume_ids).toEqual(['gone', 'r2']);
  });
});

describe('Uploading from the profile form', () => {
  const pick = (...names) =>
    fireEvent.change(screen.getByLabelText('Upload resume files'), {
      target: { files: names.map((n) => new File(['x'], n, { type: 'application/pdf' })) },
    });

  const openForm = () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Create your first profile' }));
  };

  const selected = () => within(screen.getByRole('list', { name: 'Selected resumes' })).getAllByRole('listitem').map((li) => li.textContent);

  it('recognises a file already in the library, shows it, and uploads nothing', async () => {
    mocks.resumes = [...RESUMES, { id: 'r3', display_name: 'Spaced', file_name: 'Veera_Sekhar__1_.pdf' }];
    openForm();

    pick('veera sekhar (1).PDF');

    const notice = await screen.findByRole('status');
    expect(notice).toHaveTextContent('This resume already exists');
    expect(within(notice).getByRole('button', { name: 'Preview Spaced' })).toBeInTheDocument();
    expect(selected()).toEqual(['Spaced']);
    expect(mocks.upload).not.toHaveBeenCalled();

    fireEvent.click(within(notice).getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('uploads a new file and selects it once the list has it, keeping what was picked meanwhile', async () => {
    let finish;
    mocks.upload.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    mocks.refetchResumes.mockImplementation(async () => {
      mocks.resumes = [...RESUMES, { id: 'new', display_name: 'New one', file_name: 'new.pdf' }];
    });
    openForm();

    pick('new.pdf');
    const create = await screen.findByRole('button', { name: 'Create profile' });
    await waitFor(() => expect(create).toBeDisabled());
    fireEvent.click(screen.getByRole('checkbox', { name: /ML Engineer/ }));

    finish({ id: 'new' });
    await waitFor(() => expect(create).toBeEnabled());
    expect(selected()).toEqual(['ML Engineer', 'New one']);
  });

  it('uploads each distinct new file once, and still handles the rest when one fails', async () => {
    mocks.upload.mockImplementation(({ file }) => (file.name === 'bad.pdf' ? Promise.reject(new Error('nope')) : Promise.resolve({ id: 'ok' })));
    openForm();

    pick('ok.pdf', 'OK.pdf', 'bad.pdf', 'de.pdf');

    await waitFor(() => expect(mocks.upload).toHaveBeenCalledTimes(2));
    expect(await screen.findByRole('status')).toHaveTextContent('Data Engineer');
    await waitFor(() => expect(mocks.refetchResumes).toHaveBeenCalledTimes(1));
  });

  it('shows the existing resume when the server finds the same content under another name', async () => {
    const copy = { id: 'r2', display_name: 'ML Engineer', file_name: 'ml.pdf', target_role: 'Machine Learning' };
    mocks.upload.mockRejectedValue({ status: 409, data: { detail: { message: 'exists', resume: copy } } });
    openForm();

    pick('ml (1) final.pdf');

    const notice = await screen.findByRole('status');
    expect(notice).toHaveTextContent('This resume already exists');
    expect(within(notice).getByRole('button', { name: 'Preview ML Engineer' })).toBeInTheDocument();
    expect(mocks.upload.mock.calls[0][0].rejectDuplicates).toBe(true);
    await waitFor(() => expect(selected()).toEqual(['ML Engineer']));
  });

  it('uploads files one at a time, so a copy in the same batch is caught too', async () => {
    let running = 0;
    let peak = 0;
    mocks.upload.mockImplementation(async () => {
      running += 1;
      peak = Math.max(peak, running);
      await new Promise((resolve) => { setTimeout(resolve, 5); });
      running -= 1;
      return { id: 'x' };
    });
    openForm();

    pick('one.pdf', 'two.pdf', 'three.pdf');

    await waitFor(() => expect(mocks.upload).toHaveBeenCalledTimes(3));
    await waitFor(() => expect(mocks.refetchResumes).toHaveBeenCalledTimes(1));
    expect(peak).toBe(1);
  });

  it('rejects unsupported files before uploading', () => {
    openForm();
    pick('notes.txt');
    expect(mocks.upload).not.toHaveBeenCalled();
  });

  it('does not submit the form when the upload button is pressed', () => {
    openForm();
    fireEvent.click(screen.getByRole('button', { name: 'Upload resume' }));
    expect(mocks.create).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Create profile' })).toBeInTheDocument();
  });
});

describe('Automation form', () => {
  it('shows which resumes each selected profile applies with', () => {
    const profiles = [
      { id: 'p1', name: 'Data roles', resume_ids: ['r1', 'r2'] },
      { id: 'p2', name: 'Any role', resume_ids: [] },
      { id: 'p3', name: 'Orphaned', resume_ids: ['gone'] },
    ];
    render(
      <MemoryRouter>
        <AutomationFormModal open onClose={vi.fn()} profiles={profiles} />
      </MemoryRouter>
    );
    expect(screen.queryByRole('list', { name: 'Resumes each profile applies with' })).not.toBeInTheDocument();

    profiles.forEach((p) => fireEvent.click(screen.getByRole('button', { name: p.name })));

    const summary = screen.getByRole('list', { name: 'Resumes each profile applies with' });
    expect(summary).toHaveTextContent('2 resumes');
    expect(summary).toHaveTextContent('All resumes');
    expect(summary).toHaveTextContent('Selected resumes deleted');
  });
});
