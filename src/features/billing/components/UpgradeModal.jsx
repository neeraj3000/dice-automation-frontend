import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { selectUpgradePrompt, upgradePromptClosed } from '../billingSlice';

// Mounted once in AppShell; opened by any API response with status 402.
export default function UpgradeModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { open, message } = useSelector(selectUpgradePrompt);
  const close = useCallback(() => dispatch(upgradePromptClosed()), [dispatch]);

  const viewPlans = () => {
    close();
    navigate('/billing');
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Plan limit reached"
      footer={
        <>
          <Button variant="ghost" onClick={close}>Not now</Button>
          <Button icon={Sparkles} onClick={viewPlans}>View plans</Button>
        </>
      }
    >
      <p className="text-sm text-ink-soft">{message || 'Upgrade your plan to continue.'}</p>
    </Modal>
  );
}
