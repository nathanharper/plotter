'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  Chip,
  Divider,
} from '@mui/material';
import { ArrowBack, Timeline as TimelineIcon, People } from '@mui/icons-material';
import dayjs from 'dayjs';
import Link from 'next/link';
import { Character, Event } from '@/lib/db';

interface TimelineEvent extends Event {
  role?: string;
  character1_name?: string;
  character2_name?: string;
  character1_role?: string;
  character2_role?: string;
}

export default function TimelinesPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter1, setSelectedCharacter1] = useState<number | ''>('');
  const [selectedCharacter2, setSelectedCharacter2] = useState<number | ''>('');
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [viewMode, setViewMode] = useState<'single' | 'relationship'>('single');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await fetch('/api/characters');
      if (response.ok) {
        const data = await response.json();
        setCharacters(data);
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
    }
  };

  const fetchSingleCharacterTimeline = async (characterId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/characters/${characterId}/timeline`);
      if (response.ok) {
        const data = await response.json();
        setTimeline(data);
      }
    } catch (error) {
      console.error('Error fetching character timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelationshipTimeline = async (char1Id: number, char2Id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/relationships?character1=${char1Id}&character2=${char2Id}`);
      if (response.ok) {
        const data = await response.json();
        setTimeline(data);
      }
    } catch (error) {
      console.error('Error fetching relationship timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSingleTimeline = () => {
    if (selectedCharacter1) {
      fetchSingleCharacterTimeline(selectedCharacter1 as number);
    }
  };

  const handleViewRelationship = () => {
    if (selectedCharacter1 && selectedCharacter2) {
      fetchRelationshipTimeline(selectedCharacter1 as number, selectedCharacter2 as number);
    }
  };

  const getCharacterName = (id: number) => {
    return characters.find(c => c.id === id)?.name || 'Unknown';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <Link href="/" style={{ textDecoration: 'none', marginRight: 16 }}>
          <IconButton>
            <ArrowBack />
          </IconButton>
        </Link>
        <Typography variant="h4" component="h1" color="primary">
          Character Timelines
        </Typography>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stack spacing={3}>
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
              <Button
                variant={viewMode === 'single' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('single')}
                startIcon={<TimelineIcon />}
              >
                Single Character
              </Button>
              <Button
                variant={viewMode === 'relationship' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('relationship')}
                startIcon={<People />}
              >
                Relationship
              </Button>
            </Box>

            <Divider />

            {viewMode === 'single' ? (
              <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Select Character</InputLabel>
                  <Select
                    value={selectedCharacter1}
                    onChange={(e) => setSelectedCharacter1(e.target.value as number)}
                    label="Select Character"
                  >
                    {characters.map((character) => (
                      <MenuItem key={character.id} value={character.id}>
                        {character.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  onClick={handleViewSingleTimeline}
                  disabled={!selectedCharacter1 || loading}
                >
                  View Timeline
                </Button>
              </Box>
            ) : (
              <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>First Character</InputLabel>
                  <Select
                    value={selectedCharacter1}
                    onChange={(e) => setSelectedCharacter1(e.target.value as number)}
                    label="First Character"
                  >
                    {characters.map((character) => (
                      <MenuItem key={character.id} value={character.id}>
                        {character.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Second Character</InputLabel>
                  <Select
                    value={selectedCharacter2}
                    onChange={(e) => setSelectedCharacter2(e.target.value as number)}
                    label="Second Character"
                  >
                    {characters
                      .filter(c => c.id !== selectedCharacter1)
                      .map((character) => (
                        <MenuItem key={character.id} value={character.id}>
                          {character.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  onClick={handleViewRelationship}
                  disabled={!selectedCharacter1 || !selectedCharacter2 || loading}
                >
                  View Relationship
                </Button>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      {timeline.length > 0 && (
        <Box>
          <Typography variant="h5" mb={3}>
            {viewMode === 'single' 
              ? `Timeline for ${getCharacterName(selectedCharacter1 as number)}`
              : `Shared Timeline: ${getCharacterName(selectedCharacter1 as number)} & ${getCharacterName(selectedCharacter2 as number)}`
            }
          </Typography>

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
                      
                      {viewMode === 'single' && event.role && (
                        <Chip
                          label={`Role: ${event.role}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                      
                      {viewMode === 'relationship' && (
                        <Stack direction="row" spacing={1}>
                          {event.character1_role && (
                            <Chip
                              label={`${event.character1_name}: ${event.character1_role}`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                          {event.character2_role && (
                            <Chip
                              label={`${event.character2_name}: ${event.character2_role}`}
                              size="small"
                              color="secondary"
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      )}

      {timeline.length === 0 && !loading && (selectedCharacter1 || (selectedCharacter1 && selectedCharacter2)) && (
        <Box textAlign="center" mt={4}>
          <Typography variant="h6" color="textSecondary">
            No events found for the selected {viewMode === 'single' ? 'character' : 'characters'}.
          </Typography>
        </Box>
      )}

      {loading && (
        <Box textAlign="center" mt={4}>
          <Typography>Loading timeline...</Typography>
        </Box>
      )}
    </Container>
  );
} 