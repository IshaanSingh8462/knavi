import { useNavigate } from 'react-router-dom';
import WeeklySetup from '../components/WeeklySetup';
import { useAppData } from '../lib/appContext';

export default function SetupPage() {
  const { user, syncUserStateAndSchedule } = useAppData();
  const navigate = useNavigate();

  const handlePlanGenerated = async () => {
    await syncUserStateAndSchedule();
    navigate('/app', { replace: true });
  };

  return <WeeklySetup user={user || undefined} onPlanGenerated={handlePlanGenerated} />;
}
