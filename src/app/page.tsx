import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDb } from '@/lib/db';
import jwt from 'jsonwebtoken';
import BookmarkDashboard from '@/components/BookmarkDashboard';

export const dynamic = 'force-dynamic';

function getUserIdFromCookie() {
  const token = cookies().get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export default async function HomePage() {
  const userId = getUserIdFromCookie();

  if (!userId) {
    redirect('/login');
  }

  const db = await getDb();
  const initialBookmarks = await db.all(
    'SELECT * FROM bookmarks WHERE userId = ? ORDER BY createdAt DESC',
    [userId]
  );
  await db.close();

  type Bookmark = {
    id: number;
    userId: number;
    url: string;
    title: string;
    favicon: string | null;
    summary: string;
    createdAt: string;
  };

  return (
    <div className="min-h-screen">
        <main className="container p-4 mx-auto">
            <BookmarkDashboard initialBookmarks={initialBookmarks as Bookmark[]} />
        </main>
    </div>
  );
}