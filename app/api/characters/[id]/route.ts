import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const characterId = parseInt(id);
    
    if (isNaN(characterId)) {
      return NextResponse.json(
        { error: 'Invalid character ID' },
        { status: 400 }
      );
    }

    const { name, description } = await request.json();
    
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Character name is required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE characters 
       SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 
       RETURNING *`,
      [name.trim(), description || null, characterId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating character:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      return NextResponse.json(
        { error: 'Character name already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update character' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const result = await pool.query(
      'DELETE FROM characters WHERE id = $1 RETURNING *',
      [characterId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Character deleted successfully' });
  } catch (error) {
    console.error('Error deleting character:', error);
    return NextResponse.json(
      { error: 'Failed to delete character' },
      { status: 500 }
    );
  }
} 