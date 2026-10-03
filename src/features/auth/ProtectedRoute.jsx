import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Logo, Spinner } from '../../components/ui/Misc';

export const Splash = () => (
  <div className="grid min-h-dvh place-items-center bg-paper"><div className="flex flex-col items-center gap-4"><Logo /><Spinner /></div></div>
);

export default function ProtectedRoute() {
  const { status } = useSelector((s) => s.auth);
  const location = useLocation();
  if (status === 'checking') return <Splash />;
  if (status !== 'authenticated') return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
