import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Bot, History, Pencil, Play, Plus, Search, Timer, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/Card';
import ActionMenu from '../../components/ui/ActionMenu';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { EmptyState, PageHeader, Skeleton } from '../../components/ui/Misc';
import { useDice } from '../../context/DiceContext';
import { cn } from '../../lib/cn';
import { errorMessage, timeAgo } from '../../lib/format';
import { useGetSearchProfilesQuery } from '../boards/searchProfilesApi';
import ActiveRunPanel from './ActiveRunPanel';
import AutomationFormModal from './AutomationFormModal';
import RunHistory from './RunHistory';
import {
  useDeleteAutomationMutation,
  useGetActiveAutomationRunQuery,
  useGetAutomationsQuery,
  useStartAutomationMutation,
} from './automationsApi';
import { RUN_STATUS_META, formatDuration } from './runMeta';

function LastRun({ run }) {
  if (!run) return <p className="text-xs text-ink-soft">Never run</p>;
  const meta = RUN_STATUS_META[run.status] || RUN_STATUS_META.FAILED;
  const { submitted = 0, review = 0, failed = 0 } = run.counters || {};
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-ink-soft">
      <Badge tone={meta.tone} dot>{meta.label}</Badge>
      <span>{submitted} applied · {review} to review · {failed} failed</span>
      {run.started_at && <span>· {timeAgo(run.started_at)}</span>}
      {['LOGIN_REQUIRED', 'FAILED', 'INTERRUPTED'].includes(run.status) && run.end_reason && (
        <span className="w-full text-rust">{run.end_reason}</span>
      )}
    </div>
  );
}

function AutomationCard({ automation, profileNames, isRunning, startDisabled, starting, onStart, onEdit, onHistory, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={cn('relative', menuOpen && 'z-20')}
    >
      <Card className="p-5 transition-colors hover:border-line-strong sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="hidden size-10 shrink-0 place-items-center rounded-xl bg-signal-soft text-signal sm:grid">
            <Bot className="size-[18px]" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{automation.name}</h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-soft">
              <span className="inline-flex items-center gap-1.5">
                <Play className="size-3.5 text-ink-soft/70" /> Apply to up to {automation.apply_limit} jobs
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Timer className="size-3.5 text-ink-soft/70" /> {formatDuration(automation.duration_minutes)}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {profileNames.map(({ id, name }) => (
                <span
                  key={id}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium',
                    name ? 'border-line bg-paper text-ink-soft' : 'border-rust/30 bg-rust-soft text-rust'
                  )}
                >
                  <Search className="size-3" /> {name || 'Deleted profile'}
                </span>
              ))}
            </div>
            <div className="mt-3">
              <LastRun run={automation.last_run} />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              size="sm"
              icon={Play}
              loading={starting}
              disabled={startDisabled}
              onClick={onStart}
              className="whitespace-nowrap max-sm:flex-1"
            >
              {isRunning ? 'Running…' : 'Start'}
            </Button>
            <ActionMenu
              open={menuOpen}
              onOpenChange={setMenuOpen}
              items={[
                { label: 'Edit automation', icon: Pencil, onClick: onEdit },
                { label: 'View history', icon: History, onClick: onHistory },
                'divider',
                { label: 'Delete', icon: Trash2, onClick: onDelete, danger: true },
              ]}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function AutomationsPage() {
  const navigate = useNavigate();
  const { diceStatus } = useDice();
  const { data: automations = [], isLoading } = useGetAutomationsQuery();
  const { data: rawProfiles = [] } = useGetSearchProfilesQuery();
  // Polled by the app-wide watcher; this subscription just reads the shared cache
  const { data: activeRun, fulfilledTimeStamp } = useGetActiveAutomationRunQuery();
  const [startAutomation] = useStartAutomationMutation();
  const [deleteAutomation, { isLoading: deleting }] = useDeleteAutomationMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [startingId, setStartingId] = useState(null);
  const [tab, setTab] = useState('automations');
  const [historyFilter, setHistoryFilter] = useState(null);

  // Profiles only saved in this browser (offline fallback) can't be run on the server
  const profiles = rawProfiles.filter((p) => p.id && !String(p.id).startsWith('local_'));
  const profileName = Object.fromEntries(profiles.map((p) => [p.id, p.name]));
  const diceConnected = Boolean(diceStatus?.is_connected);

  const openForm = (automation = null) => {
    setEditing(automation);
    setFormOpen(true);
  };

  const handleStart = async (automation) => {
    if (!diceConnected) {
      toast.error('Connect your Dice account before starting an automation.');
      return;
    }
    setStartingId(automation.id);
    try {
      await startAutomation(automation.id).unwrap();
      toast.success(`"${automation.name}" started. You can close this tab; it keeps running.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setStartingId(null);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAutomation(confirmDelete.id).unwrap();
      toast.success(`Automation "${confirmDelete.name}" deleted.`);
      setConfirmDelete(null);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automations"
        description="Pick search profiles, how many jobs to apply to, and a time limit. Automations run on our servers, so you can close this tab."
        action={<Button icon={Plus} onClick={() => openForm()}>New automation</Button>}
      />

      {!diceConnected && (
        <Card className="flex items-start gap-3 border-amber/30 bg-amber-soft/40 p-4">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber" />
          <div className="text-sm">
            <p className="font-medium text-amber">Dice isn't connected</p>
            <p className="text-ink-soft">
              Automations apply with your Dice account.{' '}
              <button type="button" onClick={() => navigate('/settings')} className="font-medium text-signal-deep underline-offset-2 hover:underline">
                Connect Dice in Settings
              </button>{' '}
              before starting one.
            </p>
          </div>
        </Card>
      )}

      {activeRun && <ActiveRunPanel run={activeRun} receivedAt={fulfilledTimeStamp} />}

      <div className="flex gap-1 border-b border-line" role="tablist">
        {[['automations', 'Automations'], ['history', 'History']].map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => {
              setTab(key);
              if (key === 'history') setHistoryFilter(null);
            }}
            className={cn(
              '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              tab === key ? 'border-signal text-signal-deep' : 'border-transparent text-ink-soft hover:text-ink'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'history' ? (
        <RunHistory automations={automations} filterId={historyFilter} onFilterChange={setHistoryFilter} />
      ) : (
        <div className="space-y-3">
          {isLoading ? (
            [0, 1].map((i) => <Skeleton key={i} className="h-32 rounded-card" />)
          ) : automations.length === 0 ? (
            <EmptyState
              icon={Bot}
              title="No automations yet"
              description={
                profiles.length
                  ? 'Create an automation to search and apply to jobs on a timer, without keeping this page open.'
                  : 'Automations run your search profiles. Create a search profile first, then set up an automation.'
              }
              action={
                profiles.length ? (
                  <Button icon={Plus} onClick={() => openForm()}>Create your first automation</Button>
                ) : (
                  <Button icon={Search} onClick={() => navigate('/search-profiles')}>Go to search profiles</Button>
                )
              }
            />
          ) : (
            <AnimatePresence initial={false}>
              {automations.map((a) => (
                <AutomationCard
                  key={a.id}
                  automation={a}
                  profileNames={a.search_profile_ids.map((id) => ({ id, name: profileName[id] }))}
                  isRunning={activeRun?.automation_id === a.id}
                  startDisabled={Boolean(activeRun) || (startingId !== null && startingId !== a.id)}
                  starting={startingId === a.id}
                  onStart={() => handleStart(a)}
                  onEdit={() => openForm(a)}
                  onHistory={() => {
                    setHistoryFilter(a.id);
                    setTab('history');
                  }}
                  onDelete={() => setConfirmDelete(a)}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      )}

      <AutomationFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        automation={editing}
        profiles={profiles}
      />

      <Modal
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title="Delete this automation?"
        description={confirmDelete?.name}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete automation</Button>
          </>
        }
      >
        <p className="text-sm text-ink-soft">
          Its past runs stay in History, and the applications it made stay in Applications and the Review Queue.
        </p>
      </Modal>
    </div>
  );
}
