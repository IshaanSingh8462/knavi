import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import { useAppData } from '../lib/appContext';

export default function DashboardPage() {
  const { streak, levels, activities, hasPlan } = useAppData();
  const navigate = useNavigate();

  return (
    <Dashboard
      streak={streak}
      levels={levels}
      activities={activities}
      onNavigateToJourney={() => navigate('/app')}
      onNavigateToSetup={() => navigate('/app/setup')}
      hasActivePlan={hasPlan}
    />
  );
}
