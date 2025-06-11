import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT e.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', c.id,
                   'name', c.name,
                   'role', ce.role
                 )
               ) FILTER (WHERE c.id IS NOT NULL),
               '[]'
             ) as characters
      FROM events e
      LEFT JOIN character_events ce ON e.id = ce.event_id
      LEFT JOIN characters c ON ce.character_id = c.id
      GROUP BY e.id
      ORDER BY e.position ASC
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, character_ids, roles } = await request.json();
    
    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'Event title is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get the next position (add to end)
      const positionResult = await client.query(
        'SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM events'
      );
      const nextPosition = positionResult.rows[0].next_position;

      // Insert the event
      const eventResult = await client.query(
        `INSERT INTO events (title, description, position) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [title.trim(), description || null, nextPosition]
      );

      const event = eventResult.rows[0];

      // Insert character-event relationships
      if (character_ids && character_ids.length > 0) {
        for (let i = 0; i < character_ids.length; i++) {
          const characterId = character_ids[i];
          const role = roles && roles[i] ? roles[i] : null;
          
          await client.query(
            `INSERT INTO character_events (character_id, event_id, role) 
             VALUES ($1, $2, $3)`,
            [characterId, event.id, role]
          );
        }
      }

      await client.query('COMMIT');
      return NextResponse.json(event, { status: 201 });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
} 