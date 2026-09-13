import { Navigate } from 'react-router-dom';
import JourneyView from '../components/JourneyView';
import { useAppData } from '../lib/appContext';

export default function JourneyPage() {
  const { user, levels, tasks, streak, activities, hasPlan, handleLevelComplete, syncUserStateAndSchedule } =
    useAppData();

  // No active plan yet — send them to build one instead of showing an
  // empty trail.
  if (!hasPlan) return <Navigate to="/app/setup" replace />;

  return (
    <JourneyView
      levels={levels}
      tasks={tasks}
      streak={streak}
      activities={activities}
      user={user || undefined}
      onLevelComplete={handleLevelComplete}
      onRefresh={syncUserStateAndSchedule}
    />
  );
}
