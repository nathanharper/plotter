import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const character1Id = searchParams.get('character1');
    const character2Id = searchParams.get('character2');

    if (!character1Id || !character2Id) {
      return NextResponse.json(
        { error: 'Both character IDs are required' },
        { status: 400 }
      );
    }

    const id1 = parseInt(character1Id);
    const id2 = parseInt(character2Id);

    if (isNaN(id1) || isNaN(id2)) {
      return NextResponse.json(
        { error: 'Invalid character IDs' },
        { status: 400 }
      );
    }

    const result = await pool.query(`
      SELECT e.*, 
             c1.name as character1_name,
             c2.name as character2_name,
             ce1.role as character1_role,
             ce2.role as character2_role
      FROM events e
      JOIN character_events ce1 ON e.id = ce1.event_id AND ce1.character_id = $1
      JOIN character_events ce2 ON e.id = ce2.event_id AND ce2.character_id = $2
      JOIN characters c1 ON ce1.character_id = c1.id
      JOIN characters c2 ON ce2.character_id = c2.id
      ORDER BY e.event_date ASC
    `, [id1, id2]);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching relationship timeline:', error);
    return NextResponse.json(
      { error: 'Failed to fetch relationship timeline' },
      { status: 500 }
    );
  }
} 