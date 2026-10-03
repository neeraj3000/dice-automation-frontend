import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, PlugZap, RefreshCw, Unplug } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { errorMessage, timeAgo } from '../../lib/format';
import {
  useConnectBoardMutation, useDisconnectBoardMutation, useGetBoardsQuery, useImportCookiesMutation, useVerifyBoardMutation,
} from './boardsApi';

export default function ConnectionCard({ boardKey, name }) {
  const [poll, setPoll] = useState(0);
  const { data: boards } = useGetBoardsQuery(undefined, { pollingInterval: poll });
  const board = boards?.find((b) => b.key === boardKey);
  const status = board?.status ?? 'DISCONNECTED';
  const [connect, { isLoading: connecting }] = useConnectBoardMutation();
  const [verify, { isLoading: verifying }] = useVerifyBoardMutation();
  const [disconnect, { isLoading: disconnecting }] = useDisconnectBoardMutation();
  const [importCookies, { isLoading: importing }] = useImportCookiesMutation();
  const fileRef = useRef(null);

  useEffect(() => { setPoll(status === 'CONNECTING' ? 2000 : 0); }, [status]);

  const run = async (fn, arg, okMsg) => {
    try { await fn(arg).unwrap(); if (okMsg) toast.success(okMsg); } catch (e) { toast.error(errorMessage(e)); }
  };
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const cookies = JSON.parse(await file.text());
      if (!Array.isArray(cookies)) throw new Error('not an array');
      await run(importCookies, { key: boardKey, cookies }, 'Session imported');
    } catch { toast.error('That file should be a JSON list of cookies.'); }
  };

  const tone = status === 'CONNECTED' ? 'signal' : status === 'CONNECTING' ? 'amber' : status === 'ERROR' ? 'rust' : 'neutral';
  const label = { CONNECTED: 'Connected', CONNECTING: 'Auto-connecting…', ERROR: 'Connection failed', DISCONNECTED: 'Not connected' }[status];

  return (
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
              {status === 'CONNECTED' ? `Signed in ${timeAgo(board?.connected_at)}. Applications run in this same browser profile.`
                : status === 'CONNECTING' ? `Signing in to ${name} automatically. If a CAPTCHA appears, solve it in the browser window.`
                : `Sign in once in a browser window. We keep that session and reuse it to apply.`}
            </p>
            {board?.error && status !== 'CONNECTED' && <p className="mt-1.5 text-sm text-rust" role="alert">{board.error}</p>}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {status === 'CONNECTED' ? (
            <>
              <Button variant="secondary" size="sm" icon={RefreshCw} loading={verifying} onClick={() => run(verify, boardKey, 'Session is active')}>Check session</Button>
              <Button variant="ghost" size="sm" icon={Unplug} loading={disconnecting} onClick={() => run(disconnect, boardKey)}>Disconnect</Button>
            </>
          ) : (
            <Button loading={connecting || status === 'CONNECTING'} onClick={() => run(connect, boardKey)}>{status === 'CONNECTING' ? 'Waiting…' : `Connect ${name}`}</Button>
          )}
        </div>
      </CardBody>
      {status !== 'CONNECTED' && (
        <details className="border-t border-line px-5 py-3 text-sm sm:px-6">
          <summary className="cursor-pointer text-ink-soft">Running on a server without a screen?</summary>
          <p className="mt-2 text-ink-soft">Export your {name} cookies from a browser where you're signed in (as JSON) and import them here.</p>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} className="hidden" />
          <Button variant="secondary" size="sm" className="mt-3" loading={importing} onClick={() => fileRef.current?.click()}>Import cookies file</Button>
        </details>
      )}
    </Card>
  );
}
