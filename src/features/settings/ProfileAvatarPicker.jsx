import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Trash2, Upload, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import { cn } from '../../lib/cn';

// ─── Google SVG badge ─────────────────────────────────────────────────────────
function GoogleBadge() {
  return (
    <svg className="size-3.5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

// ─── Canvas-based circular crop ───────────────────────────────────────────────
function cropToCircleDataURL(src, zoom = 1) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const SIZE = 256;
      const canvas = document.createElement('canvas');
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
      ctx.clip();
      const s = Math.min(img.width, img.height) / zoom;
      const sx = (img.width - s) / 2;
      const sy = (img.height - s) / 2;
      ctx.drawImage(img, sx, sy, s, s, 0, 0, SIZE, SIZE);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.src = src;
  });
}

// ─── CropModal (portal) ───────────────────────────────────────────────────────
function CropModal({ src, onConfirm, onCancel }) {
  const [zoom, setZoom] = useState(1);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!src) return;
    cropToCircleDataURL(src, zoom).then(setPreview);
  }, [src, zoom]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const confirm = async () => {
    const dataUrl = await cropToCircleDataURL(src, zoom);
    onConfirm(dataUrl);
  };

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[220] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        className="relative z-10 w-full max-w-sm rounded-2xl border border-line bg-paper-raised p-6 shadow-2xl"
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 8 }}
        transition={{ type: 'spring', damping: 28, stiffness: 360 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-medium leading-tight">Adjust Photo</h3>
            <p className="mt-0.5 text-xs text-ink-soft">Preview circular crop</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1.5 text-ink-soft hover:bg-paper-sunken hover:text-ink transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-2 mb-4">
          <div className="relative size-36 rounded-full p-1 ring-2 ring-signal/30 shadow-lg bg-paper-sunken flex items-center justify-center">
            {preview ? (
              <img src={preview} alt="Preview" className="size-full rounded-full object-cover" />
            ) : (
              <div className="grid size-full place-items-center text-xs text-ink-soft">Loading...</div>
            )}
          </div>
        </div>

        <div className="mb-5 rounded-xl bg-paper-sunken/60 p-3">
          <div className="mb-2 flex items-center justify-between text-xs text-ink-soft font-medium">
            <span>Zoom</span>
            <span className="font-mono">{Math.round(zoom * 100)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))}
              disabled={zoom <= 1}
              className="grid size-8 place-items-center rounded-lg border border-line bg-paper text-ink-soft hover:bg-paper-raised disabled:opacity-40 transition-colors"
            >
              <ZoomOut className="size-3.5" />
            </button>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-1.5 rounded-full accent-signal cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}
              disabled={zoom >= 3}
              className="grid size-8 place-items-center rounded-lg border border-line bg-paper text-ink-soft hover:bg-paper-raised disabled:opacity-40 transition-colors"
            >
              <ZoomIn className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="grid size-8 place-items-center rounded-lg border border-line bg-paper text-ink-soft hover:bg-paper-raised transition-colors"
              title="Reset zoom"
            >
              <RotateCcw className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="flex gap-2.5">
          <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button type="button" onClick={confirm} className="flex-1">
            Use Photo
          </Button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

// ─── AvatarMenu (portal-based, clamped to viewport) ───────────────────────────
function AvatarMenu({ hasAvatar, isGoogleAvatar, onUpload, onDelete, anchorRect, onClose }) {
  const MENU_WIDTH = 230;

  // Compute clamped position so the menu never extends off the left or right of the screen
  const getCoords = () => {
    if (!anchorRect) return { top: 0, left: 16 };
    const idealLeft = anchorRect.left;
    const maxLeft = Math.max(16, window.innerWidth - MENU_WIDTH - 16);
    const clampedLeft = Math.max(16, Math.min(maxLeft, idealLeft));
    const top = anchorRect.bottom + 8;
    return { top, left: clampedLeft };
  };

  const coords = getCoords();

  useEffect(() => {
    const handleClose = () => onClose();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('resize', handleClose);
    window.addEventListener('scroll', handleClose, true);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('resize', handleClose);
      window.removeEventListener('scroll', handleClose, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[210]" onClick={onClose} />

      {/* Floating menu card */}
      <motion.div
        style={{
          position: 'fixed',
          top: coords.top,
          left: coords.left,
          width: MENU_WIDTH,
          zIndex: 211,
        }}
        className="overflow-hidden rounded-2xl border border-line bg-paper-raised p-1.5 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10"
        initial={{ opacity: 0, y: -6, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.96 }}
        transition={{ duration: 0.14, ease: 'easeOut' }}
      >
        {isGoogleAvatar && (
          <div className="mb-1 flex items-center gap-2 rounded-xl bg-paper-sunken/80 px-3 py-2 text-[11px] text-ink-soft">
            <GoogleBadge />
            <span className="leading-tight">Google Account photo</span>
          </div>
        )}

        <button
          type="button"
          onClick={onUpload}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-paper-sunken text-left"
        >
          <Upload className="size-4 shrink-0 text-signal" />
          <span>{hasAvatar ? 'Change photo' : 'Upload photo'}</span>
        </button>

        {hasAvatar && !isGoogleAvatar && (
          <button
            type="button"
            onClick={onDelete}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10 text-left"
          >
            <Trash2 className="size-4 shrink-0" />
            <span>Remove photo</span>
          </button>
        )}
      </motion.div>
    </>,
    document.body
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
/**
 * ProfileAvatarPicker
 *
 * Props:
 *   avatarUrl  – current URL (null if none)
 *   initials   – fallback text
 *   size       – 'sm' | 'md' | 'lg'
 *   loading    – show spinner overlay while saving
 *   readonly   – hide edit controls (view only)
 *   onUpload   – (dataUrl: string) => void
 *   onDelete   – () => void
 */
export default function ProfileAvatarPicker({
  avatarUrl,
  initials = '?',
  size = 'lg',
  loading = false,
  readonly = false,
  onUpload,
  onDelete,
}) {
  const fileRef = useRef(null);
  const avatarRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);
  const [cropSrc, setCropSrc] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  const isGoogleAvatar = Boolean(
    avatarUrl && (avatarUrl.includes('googleusercontent') || avatarUrl.includes('ggpht'))
  );

  const SIZE_CLS = {
    sm: 'size-10 text-sm',
    md: 'size-14 text-lg',
    lg: 'size-20 text-2xl',
  };

  const handleAvatarClick = () => {
    if (readonly || loading) return;
    if (avatarRef.current) {
      setAnchorRect(avatarRef.current.getBoundingClientRect());
    }
    setMenuOpen((v) => !v);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Image must be under 8 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCropSrc(ev.target.result);
      setMenuOpen(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropConfirm = useCallback(
    (dataUrl) => {
      setCropSrc(null);
      onUpload?.(dataUrl);
    },
    [onUpload]
  );

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      <div className="relative inline-block shrink-0">
        {/* Avatar circle */}
        <motion.div
          ref={avatarRef}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 340, damping: 22 }}
          onClick={handleAvatarClick}
          className={cn(
            'relative overflow-hidden rounded-full bg-signal font-semibold text-on-signal shadow-card ring-2 ring-line transition-transform',
            SIZE_CLS[size],
            !readonly && !loading && 'cursor-pointer group hover:scale-[1.02] active:scale-[0.98]'
          )}
        >
          {avatarUrl && !imgError ? (
            <img
              src={avatarUrl}
              alt="Profile"
              referrerPolicy="no-referrer"
              className="size-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="grid size-full place-items-center select-none font-sans font-semibold">
              {initials}
            </div>
          )}

          {/* Hover overlay with camera icon */}
          {!readonly && !loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className={cn('text-white drop-shadow', size === 'sm' ? 'size-3.5' : 'size-5')} />
            </div>
          )}

          {/* Loading spinner */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/55">
              <svg className="size-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            </div>
          )}
        </motion.div>

        {/* Google badge */}
        {isGoogleAvatar && !imgError && (
          <span
            title="Google Account photo"
            className="absolute -bottom-0.5 -right-0.5 grid size-5 place-items-center rounded-full border border-line bg-paper shadow-sm"
          >
            <GoogleBadge />
          </span>
        )}

        {/* Non-Google avatar edit indicator badge if not readonly */}
        {!readonly && !isGoogleAvatar && (
          <span
            title="Click to change photo"
            className="absolute -bottom-0.5 -right-0.5 grid size-5 place-items-center rounded-full border border-line bg-paper shadow-sm text-ink-soft pointer-events-none"
          >
            <Camera className="size-3" />
          </span>
        )}
      </div>

      {/* Dropdown menu — rendered in portal with coordinate clamping */}
      <AnimatePresence>
        {menuOpen && !readonly && (
          <AvatarMenu
            hasAvatar={Boolean(avatarUrl && !imgError)}
            isGoogleAvatar={isGoogleAvatar}
            anchorRect={anchorRect}
            onUpload={() => {
              setMenuOpen(false);
              fileRef.current?.click();
            }}
            onDelete={() => {
              setMenuOpen(false);
              setConfirmDelete(true);
            }}
            onClose={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Crop modal — portal */}
      <AnimatePresence>
        {cropSrc && (
          <CropModal src={cropSrc} onConfirm={handleCropConfirm} onCancel={() => setCropSrc(null)} />
        )}
      </AnimatePresence>

      {/* Delete confirmation dialog — portal */}
      <AnimatePresence>
        {confirmDelete &&
          createPortal(
            <motion.div
              className="fixed inset-0 z-[220] flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
                onClick={() => setConfirmDelete(false)}
              />
              <motion.div
                className="relative z-10 w-full max-w-xs rounded-2xl border border-line bg-paper-raised p-5 shadow-2xl"
                initial={{ scale: 0.94, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.94, opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 360 }}
              >
                <div className="mb-2 flex items-center gap-2.5">
                  <div className="grid size-8 place-items-center rounded-full bg-red-500/10 text-red-500">
                    <Trash2 className="size-4" />
                  </div>
                  <h3 className="font-medium text-sm">Remove profile photo?</h3>
                </div>
                <p className="text-xs text-ink-soft mb-4 leading-relaxed">
                  Your custom photo will be permanently deleted from Cloudinary.
                </p>
                <div className="flex gap-2.5">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setConfirmDelete(false);
                      onDelete?.();
                    }}
                    className="flex-1 !bg-red-500 hover:!bg-red-600 !text-white"
                  >
                    Delete
                  </Button>
                </div>
              </motion.div>
            </motion.div>,
            document.body
          )}
      </AnimatePresence>
    </>
  );
}
