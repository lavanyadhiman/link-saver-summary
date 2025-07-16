import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';

// The type for the second argument must be defined inline like this.
// A separate type alias like 'RouteContext' will cause a build error.
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params; // Destructure id from params

  const userId = getUserIdFromToken(req);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const bookmarkId = parseInt(id, 10);
  if (isNaN(bookmarkId)) {
    return NextResponse.json({ message: 'Invalid bookmark ID' }, { status: 400 });
  }

  try {
    const db = await getDb();
    const result = await db.run(
      'DELETE FROM bookmarks WHERE id = ? AND userId = ?',
      [bookmarkId, userId]
    );
    await db.close();

    if (result.changes === 0) {
      return NextResponse.json({ message: 'Bookmark not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Bookmark deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete bookmark error:', error);
    return NextResponse.json({ message: 'Failed to delete bookmark' }, { status: 500 });
  }
}