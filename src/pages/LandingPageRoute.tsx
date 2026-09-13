import { useNavigate } from 'react-router-dom';
import LandingPage from '../components/LandingPage';
import { useAppData } from '../lib/appContext';

export default function LandingPageRoute() {
  const navigate = useNavigate();
  const { enterAsGuest, isGuestSubmitting } = useAppData();

  const handleGuest = async () => {
    try {
      await enterAsGuest();
      navigate('/journeys');
    } catch {
      // enterAsGuest already recorded the error in context; nothing else
      // to do here — the person stays on the landing page and can retry.
    }
  };

  return (
    <LandingPage
      onSignIn={() => navigate('/login')}
      onSignUp={() => navigate('/signup')}
      onGuest={handleGuest}
      isGuestSubmitting={isGuestSubmitting}
    />
  );
}
