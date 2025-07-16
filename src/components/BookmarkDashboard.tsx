'use client';
import { useState, FormEvent } from 'react';
import { useTheme } from 'next-themes';

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

export default function BookmarkDashboard({
  initialBookmarks,
}: BookmarkDashboardProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [newUrl, setNewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
    if (!confirm('Are you sure you want to delete this bookmark?')) return;

    const res = await fetch(`/api/bookmarks/${bookmarkId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setBookmarks(bookmarks.filter((bookmark) => bookmark.id !== bookmarkId));
    } else {
      alert('Failed to delete bookmark.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Bookmarks
        </h1>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="px-3 py-2 border rounded-md text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
        >
          {theme === 'dark' ? 'Light' : 'Dark'} Mode
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://example.com"
            required
            className="flex-grow w-full px-3 py-2 placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {isLoading ? 'Saving...' : 'Add Link'}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </form>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm flex flex-col border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center min-w-0">
                {bookmark.favicon && (
                  <img
                    src={bookmark.favicon}
                    alt=""
                    className="w-4 h-4 mr-2 flex-shrink-0"
                  />
                )}
                <h2 className="font-bold text-lg truncate text-gray-900 dark:text-white">
                  {bookmark.title}
                </h2>
              </div>
              <button
                onClick={() => handleDelete(bookmark.id)}
                className="ml-2 text-gray-400 hover:text-red-500 flex-shrink-0"
                aria-label="Delete bookmark"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm flex-grow line-clamp-3">
              {bookmark.summary}
            </p>
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 hover:underline text-xs mt-3 self-start truncate"
            >
              {bookmark.url}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
