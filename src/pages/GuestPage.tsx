import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppData } from '../lib/appContext';

// A dedicated, linkable /guest URL — useful on its own for marketing
// ("try it without an account: getstrail.me/guest") and gives GA4 a real
// page hit distinct from the landing page, instead of guest entry being
// invisible until someone clicks a button on '/'.
export default function GuestPage() {
  const { user, enterAsGuest, authError } = useAppData();
  const [attempted, setAttempted] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (user || startedRef.current) return;
    startedRef.current = true;
    enterAsGuest()
      .catch(() => {})
      .finally(() => setAttempted(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (user) return <Navigate to="/journeys" replace />;

  if (attempted && authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-void px-4 text-center">
        <p className="text-sm text-rose-700 max-w-sm">{authError}</p>
        <a href="/" className="mt-4 text-sm font-bold text-primary hover:underline">
          Back to Strail
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-void">
      <div className="w-12 h-12 border-2 border-primary border-dashed rounded-full animate-spin" />
      <h3 className="font-serif font-black text-xl text-ink mt-4">Setting up your guest session...</h3>
    </div>
  );
}
