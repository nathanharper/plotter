import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const characterId = parseInt(params.id);
    
    if (isNaN(characterId)) {
      return NextResponse.json(
        { error: 'Invalid character ID' },
        { status: 400 }
      );
    }

    const result = await pool.query(`
      SELECT e.*, ce.role
      FROM events e
      JOIN character_events ce ON e.id = ce.event_id
      WHERE ce.character_id = $1
      ORDER BY e.event_date ASC
    `, [characterId]);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching character timeline:', error);
    return NextResponse.json(
      { error: 'Failed to fetch character timeline' },
      { status: 500 }
    );
  }
} 