import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDark } from '../app/uiSlice';

export function useTheme() {
  const dark = useSelector((s) => s.ui.dark);
  const dispatch = useDispatch();
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);
  const toggle = useCallback(() => {
    const next = !dark;
    try { localStorage.setItem('a2h-theme', next ? 'dark' : 'light'); } catch { /* private mode */ }
    dispatch(setDark(next));
  }, [dark, dispatch]);
  return { dark, toggle };
}
