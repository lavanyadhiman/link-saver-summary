'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

type Bookmark = {
  id: number;
  userId: number;
  url: string;
  title: string;
  favicon: string | null;
  summary: string;
  createdAt: string;
};

interface BookmarkDashboardProps {
  initialBookmarks: Bookmark[];
}

export default function BookmarkDashboard({ initialBookmarks }: BookmarkDashboardProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [newUrl, setNewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    const res = await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: newUrl }),
    });

    setIsLoading(false);

    if (res.ok) {
      const newBookmark = await res.json();
      setBookmarks([newBookmark, ...bookmarks]);
      setNewUrl('');
    } else {
      const data = await res.json();
      setError(data.message || 'Failed to add bookmark.');
    }
  };

  const handleDelete = async (bookmarkId: number) => {
    if (!confirm('Delete this bookmark?')) return;
    const res = await fetch(`/api/bookmarks/${bookmarkId}`, { method: 'DELETE' });

    if (res.ok) {
      setBookmarks(bookmarks.filter((b) => b.id !== bookmarkId));
    } else {
      alert('Failed to delete.');
    }
  };

  const handleLogout = async () => {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    if (res.ok) {
      router.push('/login');
    } else {
      alert('Logout failed.');
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-green-300 via-blue-300 to-pink-300 dark:from-green-900 dark:via-blue-900 dark:to-pink-900 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto backdrop-blur-sm bg-white/60 dark:bg-slate-900/60 rounded-3xl shadow-xl p-8 sm:p-10">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Save Your Links
            </h1>
            <p className="mt-1 text-slate-700 dark:text-slate-300 text-lg">
              Summarize and organize your favorite links beautifully.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="cursor-pointer px-5 py-2 text-sm font-semibold rounded-lg bg-white/80 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-white hover:shadow-md dark:hover:bg-slate-700 transition"
          >
            Logout
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-4 items-stretch mb-10"
        >
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="Paste a link to summarize..."
            required
            className="flex-grow px-4 py-3 rounded-xl border border-slate-300 bg-white/80 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 shadow-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 font-semibold rounded-xl  cursor-pointer bg-gradient-to-r from-green-500 via-blue-500 to-pink-500 text-white hover:brightness-110 transition-all shadow-lg disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Add Link'}
          </button>
        </form>

        {/* Error Message */}
        {error && <p className="mb-6 text-red-600 text-sm text-center">{error}</p>}

        {/* Bookmark Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="flex flex-col h-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all backdrop-blur-md"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  {bookmark.favicon && (
                    <img
                      src={bookmark.favicon}
                      alt=""
                      className="w-5 h-5 rounded-full flex-shrink-0"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-white truncate">
                    {bookmark.title}
                  </h2>
                </div>
                <button
                  onClick={() => handleDelete(bookmark.id)}
                  className="p-1 text-slate-400 hover:text-red-500 rounded-full transition hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zm-2 6a1 1 0 112 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 112 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 line-clamp-4 flex-grow">
                {bookmark.summary}
              </p>

              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-700 dark:text-blue-400 hover:underline truncate"
              >
                {bookmark.url}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
