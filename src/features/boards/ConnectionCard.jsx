import { useEffect, useRef, useState, useCallback } from 'react';
import {
  CheckCircle2,
  Blocks,
  FileJson,
  PlugZap,
  RefreshCw,
  Unplug,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { errorMessage, timeAgo } from '../../lib/format';
import {
  useDisconnectBoardMutation,
  useGetBoardsQuery,
  useImportCookiesMutation,
  useVerifyBoardMutation,
} from './boardsApi';

export default function ConnectionCard({ boardKey, name }) {
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [poll, setPoll] = useState(0);

  const { data: boards, refetch } = useGetBoardsQuery(undefined, { pollingInterval: poll });
  const board = boards?.find((b) => b.key === boardKey);
  const status = board?.status ?? 'DISCONNECTED';

  const [verify, { isLoading: verifying }] = useVerifyBoardMutation();
  const [disconnect, { isLoading: disconnecting }] = useDisconnectBoardMutation();
  const [importCookies, { isLoading: importing }] = useImportCookiesMutation();
  const fileRef = useRef(null);
  const prevStatusRef = useRef(status);

  // Poll while modal is open and not yet connected
  useEffect(() => {
    if (connectModalOpen && status !== 'CONNECTED') {
      setPoll(2500);
    } else {
      setPoll(0);
    }
  }, [connectModalOpen, status]);

  // Window focus listener: re-check status immediately when candidate returns to this tab
  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetch]);

  // Detect transition to connected
  useEffect(() => {
    if (prevStatusRef.current !== 'CONNECTED' && status === 'CONNECTED') {
      toast.success(`${name} account connected successfully!`);
    }
    prevStatusRef.current = status;
  }, [status, name]);

  const run = async (fn, arg, okMsg) => {
    try {
      await fn(arg).unwrap();
      if (okMsg) toast.success(okMsg);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const cookies = JSON.parse(await file.text());
      if (!Array.isArray(cookies)) throw new Error('not an array');
      await run(importCookies, { key: boardKey, cookies }, 'Session imported');
    } catch {
      toast.error('That file should be a JSON list of cookies.');
    }
  };

  const tone = status === 'CONNECTED' ? 'signal' : status === 'ERROR' ? 'rust' : 'neutral';
  const label = { CONNECTED: 'Connected', ERROR: 'Connection failed', DISCONNECTED: 'Not connected' }[status] || 'Not connected';

  return (
    <>
      <Card>
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className={`grid size-11 shrink-0 place-items-center rounded-xl ${status === 'CONNECTED' ? 'bg-signal-soft text-signal' : 'bg-paper-sunken text-ink-soft'}`}>
              {status === 'CONNECTED' ? <CheckCircle2 className="size-5" /> : <PlugZap className="size-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-serif text-lg font-medium">{name} account</h2>
                <Badge tone={tone} dot>{label}</Badge>
              </div>
              <p className="mt-1 text-sm text-ink-soft">
                {status === 'CONNECTED'
                  ? `Signed in ${timeAgo(board?.connected_at)}. Applications run using this authenticated session.`
                  : `Connect your ${name} session via Chrome Extension to enable 1-click applications and automated job scraping.`}
              </p>
              {board?.error && status !== 'CONNECTED' && (
                <p className="mt-1.5 text-sm text-rust" role="alert">{board.error}</p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {status === 'CONNECTED' ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={RefreshCw}
                  loading={verifying}
                  onClick={() => run(verify, boardKey, 'Session is active')}
                >
                  Check session
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Unplug}
                  loading={disconnecting}
                  onClick={() => run(disconnect, boardKey, 'Disconnected from Dice')}
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={RefreshCw}
                  loading={verifying}
                  onClick={() => run(verify, boardKey, 'Session verified')}
                >
                  Check Status
                </Button>
                <Button
                  size="sm"
                  icon={PlugZap}
                  onClick={() => setConnectModalOpen(true)}
                >
                  Connect {name}
                </Button>
              </>
            )}
          </div>
        </CardBody>

        {status !== 'CONNECTED' && (
          <details className="border-t border-line px-5 py-3 text-sm sm:px-6">
            <summary className="cursor-pointer text-ink-soft hover:text-ink">
              Alternative ways to sync session (Extension or Cookie JSON)
            </summary>
            <div className="mt-3 space-y-4 text-ink-soft">
              <div className="rounded-control border border-line bg-paper-sunken p-3">
                <p className="flex items-center gap-1.5 font-medium text-ink">
                  <Blocks className="size-4 text-signal" /> Sync via Chrome Extension
                </p>
                <ol className="mt-1.5 list-inside list-decimal space-y-1 text-xs">
                  <li>Sign into your {name} account normally in Google Chrome.</li>
                  <li>Click the Apply2Hire / Dice Sync extension icon in your toolbar.</li>
                  <li>Click "Sync Account" — this page will detect the authenticated session automatically.</li>
                </ol>
              </div>

              <div>
                <p className="flex items-center gap-1.5 font-medium text-ink">
                  <FileJson className="size-4 text-ink-soft" /> Server / Headless Cookie Import
                </p>
                <p className="mt-1 text-xs">
                  Export cookies from your signed-in browser as a JSON file and upload it below:
                </p>
                <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} className="hidden" />
                <Button variant="secondary" size="sm" className="mt-2.5" loading={importing} onClick={() => fileRef.current?.click()}>
                  Import cookies file (.json)
                </Button>
              </div>
            </div>
          </details>
        )}
      </Card>

      {/* Connect Dice Guided Modal */}
      <Modal
        open={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        title={`Connect ${name} Account`}
        description={`Connect your personal ${name} account via the Chrome Extension to enable automated job search and applications.`}
        footer={
          <div className="flex w-full flex-col-reverse justify-between gap-2 sm:flex-row sm:items-center">
            <Button
              variant="ghost"
              size="sm"
              icon={RefreshCw}
              loading={verifying}
              onClick={() => run(verify, boardKey, 'Session verified')}
            >
              Check Status Now
            </Button>
            <Button
              variant={status === 'CONNECTED' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setConnectModalOpen(false)}
            >
              {status === 'CONNECTED' ? 'Done' : 'Close'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Zero-Password Security Callout */}
          <div className="rounded-control border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-900 dark:text-emerald-200">
              <ShieldCheck className="size-4" /> Zero-Password Security Guarantee
            </div>
            <p className="mt-1 leading-relaxed">
              Apply2Hire will <strong>never</strong> ask for your {name} password. You log in securely in your official browser, and the extension safely syncs the session to your backend.
            </p>
          </div>

          {/* Sync Success State */}
          {status === 'CONNECTED' ? (
            <div className="flex items-center gap-3 rounded-control border border-signal/30 bg-signal-soft/40 p-4 text-signal">
              <CheckCircle2 className="size-6 shrink-0" />
              <div>
                <p className="font-medium text-ink">{name} Connected Successfully!</p>
                <p className="text-xs text-ink-soft">
                  Your authenticated session is active and encrypted. You can now search for roles and apply with 1-click.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex items-start gap-3 rounded-control border border-line bg-paper-sunken p-3">
                <div className="grid size-6 shrink-0 place-items-center rounded-full bg-signal text-xs font-bold text-white">1</div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink">Open {name} in Chrome</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={ExternalLink}
                      onClick={() => window.open('https://www.dice.com/dashboard/login', '_blank')}
                    >
                      Open {name} Login
                    </Button>
                  </div>
                  <p className="mt-1 text-xs text-ink-soft">
                    Open Dice in a new tab in your Chrome browser where your Dice Chrome extension is installed.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 rounded-control border border-line bg-paper-sunken p-3">
                <div className="grid size-6 shrink-0 place-items-center rounded-full bg-signal text-xs font-bold text-white">2</div>
                <div>
                  <p className="text-sm font-medium text-ink">Log in normally</p>
                  <p className="mt-1 text-xs text-ink-soft">
                    Sign into your {name} candidate account with your email/password or Google / 2FA as usual.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 rounded-control border border-line bg-paper-sunken p-3">
                <div className="grid size-6 shrink-0 place-items-center rounded-full bg-signal text-xs font-bold text-white">3</div>
                <div>
                  <p className="text-sm font-medium text-ink">Click "Sync Dice Account"</p>
                  <p className="mt-1 text-xs text-ink-soft">
                    Click the <strong>Dice Automation Sync</strong> extension icon in your Chrome extensions toolbar, then click the <strong>&quot;Sync Dice Account&quot;</strong> button.
                  </p>
                </div>
              </div>

              {/* Real-time sync listener */}
              <div className="flex items-center gap-2.5 rounded-control border border-line bg-paper-sunken px-3.5 py-3 text-xs text-ink-soft">
                <span className="relative flex size-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-signal"></span>
                </span>
                <span>Waiting for extension sync... (Auto-detects in real-time)</span>
              </div>
            </div>
          )}

          {/* Manual Cookie JSON upload fallback */}
          <details className="border-t border-line pt-3 text-xs text-ink-soft">
            <summary className="cursor-pointer hover:text-ink">Alternative: Import Cookies (.json) manually</summary>
            <div className="mt-2.5 space-y-2">
              <p>Export cookies from your signed-in browser as a JSON file and upload it below:</p>
              <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} className="hidden" />
              <Button variant="secondary" size="sm" icon={FileJson} loading={importing} onClick={() => fileRef.current?.click()}>
                Import cookies file (.json)
              </Button>
            </div>
          </details>
        </div>
      </Modal>
    </>
  );
}
