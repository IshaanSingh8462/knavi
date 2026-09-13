import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center px-4 text-center">
      <p className="text-4xl mb-3">🥾</p>
      <h1 className="font-serif font-black text-2xl text-ink">This trail doesn't exist</h1>
      <p className="text-sm text-ink-soft mt-2 max-w-sm">
        The page you're looking for isn't here — it may have moved or never existed.
      </p>
      <Link to="/" className="mt-6 py-3 px-6 bg-primary text-white font-sans font-bold rounded-xl shadow-active hover:opacity-90 transition-opacity text-sm">
        Back to Strail
      </Link>
    </div>
  );
}
