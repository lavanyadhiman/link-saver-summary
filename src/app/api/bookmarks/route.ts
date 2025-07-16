// src/app/api/bookmarks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';
import { JSDOM } from 'jsdom';

// GET all bookmarks for a user
export async function GET(req: NextRequest) {
  const userId = getUserIdFromToken(req);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const db = await getDb();
  const bookmarks = await db.all('SELECT * FROM bookmarks WHERE userId = ? ORDER BY createdAt DESC', [userId]);
  await db.close();

  return NextResponse.json(bookmarks);
}

// POST a new bookmark
export async function POST(req: NextRequest) {
  const userId = getUserIdFromToken(req);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ message: 'URL is required' }, { status: 400 });
    }

    // 1. Fetch metadata (title, favicon)
    const pageResponse = await fetch(url);
    const html = await pageResponse.text();
    const dom = new JSDOM(html, { url });
    const title = dom.window.document.querySelector('title')?.textContent || 'No title found';
    const faviconElement = dom.window.document.querySelector("link[rel~='icon']");
    const favicon = faviconElement ? new URL(faviconElement.getAttribute('href') || '/favicon.ico', url).href : new URL('/favicon.ico', url).href;

    // 2. Fetch summary from Jina AI
    let summary = 'Summary is unavailable.';
    try {
        const summaryResponse = await fetch(`https://r.jina.ai/${url}`);
        if (summaryResponse.ok) {
            summary = await summaryResponse.text();
        }
    } catch (e) {
        console.error("Jina AI fetch failed:", e);
    }
    
    // 3. Save to database
    const db = await getDb();
    const result = await db.run(
      'INSERT INTO bookmarks (userId, url, title, favicon, summary) VALUES (?, ?, ?, ?, ?)',
      [userId, url, title, favicon, summary.trim()]
    );
    
    const newBookmarkId = result.lastID;
    const newBookmark = await db.get('SELECT * FROM bookmarks WHERE id = ?', newBookmarkId);
    await db.close();

    return NextResponse.json(newBookmark, { status: 201 });

  } catch (error) {
    console.error('Bookmark save error:', error);
    return NextResponse.json({ message: 'Failed to save bookmark' }, { status: 500 });
  }
}