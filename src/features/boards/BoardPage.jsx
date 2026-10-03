import { Navigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/ui/Misc';
import ConnectionCard from './ConnectionCard';
import SearchPanel from './SearchPanel';
import JobsList from '../jobs/JobsList';
import { getBoardMeta } from './boardRegistry';
import { useGetBoardsQuery } from './boardsApi';

export default function BoardPage() {
  const { boardKey } = useParams();
  const meta = getBoardMeta(boardKey);
  const { data: boards } = useGetBoardsQuery();
  if (!meta?.enabled) return <Navigate to="/" replace />;
  const connected = boards?.find((b) => b.key === boardKey)?.status === 'CONNECTED';

  return (
    <div className="space-y-6">
      <PageHeader title={meta.name} description="Connect your account, search for roles, and let Apply2Hire handle the forms." />
      <ConnectionCard boardKey={boardKey} name={meta.name} />
      <SearchPanel boardKey={boardKey} connected={connected} />
      <JobsList boardKey={boardKey} connected={connected} />
    </div>
  );
}
