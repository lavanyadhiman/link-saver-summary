'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Bookmark = {
  id: number;
  userId: number;
  url: string;
  title: string;
  favicon: string | null;
  summary: string;
  createdAt: string;
};

function SortableBookmarkItem({
  bookmark,
  handleDelete,
}: {
  bookmark: Bookmark;
  handleDelete: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: bookmark.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex flex-col h-full bg-white/80 border border-slate-200 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all backdrop-blur-md"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div {...listeners} className="text-slate-400 cursor-grab touch-none p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 8a1 1 0 11-2 0 1 1 0 012 0zM5 12a1 1 0 11-2 0 1 1 0 012 0zM9 8a1 1 0 11-2 0 1 1 0 012 0zM9 12a1 1 0 11-2 0 1 1 0 012 0zM13 8a1 1 0 11-2 0 1 1 0 012 0zM13 12a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          </div>
          {bookmark.favicon && (
            <img
              src={bookmark.favicon}
              alt=""
              className="w-5 h-5 rounded-full flex-shrink-0"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          )}
          <h2 className="text-lg font-semibold text-slate-800 truncate">
            {bookmark.title}
          </h2>
        </div>
        <button
          onClick={() => handleDelete(bookmark.id)}
          className="p-1 text-slate-400 cursor-pointer hover:text-red-500 rounded-full transition hover:bg-slate-100"
          aria-label="Delete"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zm-2 6a1 1 0 112 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 112 0v6a1 1 0 11-2 0V8z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <p className="text-sm text-slate-700 mb-4 line-clamp-4 flex-grow whitespace-pre-line">
        {bookmark.summary
          .replace(/^(Title|URL Source|Markdown Content):/gim, '')
          .replace(/https?:\/\/[^\s)]+/g, '')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
          .replace(/#+\s?/g, '')
          .replace(/={3,}/g, '')
          .trim()
          .slice(0, 400)}
      </p>
    </div>
  );
}

interface BookmarkDashboardProps {
  initialBookmarks: Bookmark[];
}

export default function BookmarkDashboard({ initialBookmarks }: BookmarkDashboardProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [newUrl, setNewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      router.refresh();
      router.push('/login');
    } else {
      alert('Logout failed.');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setBookmarks((currentBookmarks) => {
      const oldIndex = currentBookmarks.findIndex((b) => b.id === active.id);
      const newIndex = currentBookmarks.findIndex((b) => b.id === over.id);
      return arrayMove(currentBookmarks, oldIndex, newIndex);
    });
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-green-300 via-blue-300 to-pink-300 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto backdrop-blur-sm bg-white/60 rounded-3xl shadow-xl p-8 sm:p-10">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Save Your Links
            </h1>
            <p className="mt-1 text-slate-700 text-lg">
              Summarize and organize your favorite links with ease.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="cursor-pointer px-5 py-2 text-sm font-semibold rounded-lg bg-white/80 border border-slate-300 text-slate-800 hover:bg-white hover:shadow-md transition"
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
            className="flex-grow px-4 py-3 rounded-xl border border-slate-300 bg-white/80 text-slate-900 placeholder:text-slate-500 shadow-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 font-semibold rounded-xl  cursor-pointer bg-gradient-to-r from-green-500 via-blue-500 to-pink-500 text-white hover:brightness-110 transition-all shadow-lg disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Add Link'}
          </button>
        </form>

        {/* Error */}
        {error && <p className="mb-6 text-red-600 text-sm text-center">{error}</p>}

        {/* Bookmarks Grid */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={bookmarks} strategy={rectSortingStrategy}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {bookmarks.map((bookmark) => (
                <SortableBookmarkItem
                  key={bookmark.id}
                  bookmark={bookmark}
                  handleDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </section>
  );
}
