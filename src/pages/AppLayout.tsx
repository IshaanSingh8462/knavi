import { useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { Flame, LogOut, Compass, Globe2, Smile, KeyRound } from 'lucide-react';
import SoundToggle from '../components/SoundToggle';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { useAppData } from '../lib/appContext';

export default function AppLayout() {
  const { user, streak, logout } = useAppData();
  const navigate = useNavigate();
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const desktopTabClass = (isActive: boolean) =>
    `px-4 py-1.5 rounded-lg font-extrabold text-xs cursor-pointer transition-colors ${
      isActive ? 'bg-primary text-white' : 'text-ink-soft hover:text-ink'
    }`;

  const mobileTabClass = (isActive: boolean) =>
    `font-bold text-xs flex flex-col items-center gap-1 cursor-pointer ${
      isActive ? 'text-primary' : 'text-ink-soft'
    }`;

  return (
    <div className="min-h-screen bg-void text-ink overflow-hidden relative flex flex-col">
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-moss/10 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="relative z-10 flex-1 flex flex-col">
        <header className="border-b border-line bg-surface backdrop-blur-md py-3 sm:py-4 px-4 sm:px-6 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
            <NavLink to="/app" className="flex items-center gap-2 cursor-pointer min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-serif font-black text-sm select-none shrink-0">
                {user?.name ? user.name.trim()[0].toUpperCase() : 'U'}
              </div>
              <strong className="font-serif font-black text-lg sm:text-xl tracking-tight text-ink truncate max-w-[110px] sm:max-w-none">
                {user?.name || 'User'}
              </strong>
            </NavLink>

            <nav className="hidden sm:flex items-center gap-1">
              <NavLink to="/app" end className={({ isActive }) => desktopTabClass(isActive)}>
                Daily Trail
              </NavLink>
              <NavLink to="/app/dashboard" className={({ isActive }) => desktopTabClass(isActive)}>
                Standings
              </NavLink>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <NavLink
                to="/journeys"
                className={({ isActive }) =>
                  `hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-extrabold text-xs cursor-pointer transition-colors border ${
                    isActive ? 'bg-primary text-white border-primary' : 'text-ink-soft hover:text-ink border-line'
                  }`
                }
                title="Browse journeys other students have shared"
              >
                <Globe2 className="w-3.5 h-3.5" /> <span className="hidden md:inline">Public Journeys</span>
              </NavLink>

              <div className="flex items-center gap-1 bg-black/5 border border-line px-2.5 py-1 rounded-full text-xs select-none">
                <Flame className="w-4 h-4 text-primary fill-primary" />
                <strong className="font-mono text-ink">{streak.streak_count}d</strong>
              </div>
              <SoundToggle />
              <button
                onClick={() => setShowChangePassword(true)}
                className="flex items-center justify-center text-ink-soft hover:text-ink transition-colors cursor-pointer"
                title="Change password"
              >
                <KeyRound className="w-4 h-4" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-ink-soft hover:text-primary font-bold cursor-pointer transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" /> <span className="hidden md:inline">Exit</span>
              </button>
            </div>
          </div>
        </header>

        {showChangePassword && user?.email && (
          <ChangePasswordModal email={user.email} onClose={() => setShowChangePassword(false)} />
        )}

        <div className="block sm:hidden fixed bottom-0 left-0 right-0 border-t border-line bg-surface backdrop-blur-md py-3 px-4 z-40">
          <div className="flex items-center justify-around">
            <NavLink to="/app" end className={({ isActive }) => mobileTabClass(isActive)}>
              <Compass className="w-4 h-4" /> Daily Trail
            </NavLink>
            <NavLink to="/app/dashboard" className={({ isActive }) => mobileTabClass(isActive)}>
              <Smile className="w-4 h-4" /> Standings
            </NavLink>
            <NavLink to="/journeys" className={({ isActive }) => mobileTabClass(isActive)}>
              <Globe2 className="w-4 h-4" /> Public
            </NavLink>
          </div>
        </div>

        <main className="flex-1 pb-16 sm:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
