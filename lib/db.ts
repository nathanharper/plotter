import { URL } from 'node:url';
import { Pool } from 'pg';

  const params = new URL(process.env.DATABASE_URL as string);

const config = {
  user: params.username,
  password: params.password,
  host: params.hostname,
  port: parseInt(params.port),
  database: params.pathname.split('/')[1],
  ssl: {
    rejectUnauthorized: false,
  },
};

  const pool = new Pool(config);


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
  position: number;
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