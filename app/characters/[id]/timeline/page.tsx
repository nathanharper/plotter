'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  Chip,
} from '@mui/material';
import { ArrowBack, Timeline as TimelineIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import Link from 'next/link';
import { Character, Event } from '@/lib/db';

interface TimelineEvent extends Event {
  role?: string;
}

export default function CharacterTimelinePage() {
  const params = useParams();
  const characterId = params.id as string;
  const [character, setCharacter] = useState<Character | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (characterId) {
      fetchCharacterAndTimeline();
    }
  }, [characterId]);

  const fetchCharacterAndTimeline = async () => {
    try {
      setLoading(true);
      
      // Fetch character details
      const characterResponse = await fetch('/api/characters');
      if (characterResponse.ok) {
        const characters = await characterResponse.json();
        const foundCharacter = characters.find((c: Character) => c.id === parseInt(characterId));
        setCharacter(foundCharacter);
      }

      // Fetch timeline
      const timelineResponse = await fetch(`/api/characters/${characterId}/timeline`);
      if (timelineResponse.ok) {
        const data = await timelineResponse.json();
        setTimeline(data);
      }
    } catch (error) {
      console.error('Error fetching character timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading character timeline...</Typography>
      </Container>
    );
  }

  if (!character) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Character not found.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <Link href="/characters" style={{ textDecoration: 'none', marginRight: 16 }}>
          <IconButton>
            <ArrowBack />
          </IconButton>
        </Link>
        <Box>
          <Typography variant="h4" component="h1" color="primary">
            {character.name}'s Timeline
          </Typography>
          {character.description && (
            <Typography variant="body1" color="textSecondary" mt={1}>
              {character.description}
            </Typography>
          )}
        </Box>
      </Box>

      {timeline.length > 0 ? (
        <Stack spacing={3}>
          {timeline.map((event) => (
            <Card key={event.id}>
              <CardContent>
                <Box display="flex" alignItems="flex-start" gap={2}>
                  <TimelineIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                  <Box flexGrow={1}>
                    <Typography variant="h6" component="h3" mb={1}>
                      {event.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" mb={1}>
                      {dayjs(event.event_date).format('MMMM D, YYYY [at] h:mm A')}
                    </Typography>
                    {event.description && (
                      <Typography variant="body1" mb={2}>
                        {event.description}
                      </Typography>
                    )}
                    {event.role && (
                      <Chip
                        label={`Role: ${event.role}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <Box textAlign="center" mt={4}>
          <Typography variant="h6" color="textSecondary">
            No events found for {character.name}.
          </Typography>
          <Typography variant="body2" color="textSecondary" mt={1}>
            Events involving this character will appear here.
          </Typography>
        </Box>
      )}
    </Container>
  );
} 