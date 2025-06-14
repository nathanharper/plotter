import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const eventId = parseInt(id);
    
    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const { title, description, character_ids, roles, position } = await request.json();
    
    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'Event title is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Update the event
      const eventResult = await client.query(
        `UPDATE events 
         SET title = $1, description = $2, position = $3, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4 
         RETURNING *`,
        [title.trim(), description || null, position || 0, eventId]
      );

      if (eventResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }

      const event = eventResult.rows[0];

      // Only update character relationships if provided
      if (character_ids !== undefined) {
        // Delete existing character-event relationships
        await client.query(
          'DELETE FROM character_events WHERE event_id = $1',
          [eventId]
        );

        // Insert new character-event relationships
        if (character_ids && character_ids.length > 0) {
          for (let i = 0; i < character_ids.length; i++) {
            const characterId = character_ids[i];
            const role = roles && roles[i] ? roles[i] : null;
            
            await client.query(
              `INSERT INTO character_events (character_id, event_id, role) 
               VALUES ($1, $2, $3)`,
              [characterId, eventId, role]
            );
          }
        }
      }

      await client.query('COMMIT');
      return NextResponse.json(event);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const eventId = parseInt(id);
    
    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'DELETE FROM events WHERE id = $1 RETURNING *',
      [eventId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
} 