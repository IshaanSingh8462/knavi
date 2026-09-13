import { useNavigate } from 'react-router-dom';
import OnboardingFlow from '../components/OnboardingFlow';
import { useAppData } from '../lib/appContext';

export default function OnboardingPage() {
  const { user, markOnboardingComplete } = useAppData();
  const navigate = useNavigate();

  if (!user || user.isGuest) return null; // guarded upstream; render nothing during the redirect frame

  const handleComplete = () => {
    markOnboardingComplete();
    navigate('/app', { replace: true });
  };

  return (
    <div className="min-h-screen bg-void">
      <div className="py-10">
        <OnboardingFlow user={user} onOnboardingComplete={handleComplete} />
      </div>
    </div>
  );
}
