import { URL } from 'node:url';
import { Pool } from 'pg';

let pool: Pool;

if (process.env.DATABASE_URL) {
  const params = new URL(process.env.DATABASE_URL);

const config = {
  user: params.username,
  password: params.password,
  host: params.hostname,
  port: parseInt(params.port),
  database: params.pathname.split('/')[1],
};

  pool = new Pool(config);
} else {
  pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'story_plotter',
    password: process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.DB_PORT || '5432'),
  });
}


export interface Character {
  id: number;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  event_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CharacterEvent {
  id: number;
  character_id: number;
  event_id: number;
  role?: string;
  created_at: Date;
}

export interface EventWithCharacters extends Event {
  characters: (Character & { role?: string })[];
}

export interface CharacterWithEvents extends Character {
  events: (Event & { role?: string })[];
}

export default pool; 