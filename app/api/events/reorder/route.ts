import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { eventId, newPosition } = await request.json();
    
    if (!eventId || newPosition === undefined) {
      return NextResponse.json(
        { error: 'Event ID and new position are required' },
        { status: 400 }
      );
    }

    let position = newPosition;

    // Ensure position is valid (not NaN or negative)
    if (isNaN(position)) {
      // Fallback to end position
      const maxResult = await pool.query(
        'SELECT MAX(position) as max_pos FROM events'
      );
      const maxPos = maxResult.rows[0].max_pos || 0;
      position = maxPos + 1;
    }

    // Update the event position
    const updateResult = await pool.query(
      'UPDATE events SET position = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [position, eventId]
    );

    if (updateResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      event: updateResult.rows[0] 
    });
  } catch (error) {
    console.error('Error reordering event:', error);
    return NextResponse.json(
      { error: 'Failed to reorder event' },
      { status: 500 }
    );
  }
} 