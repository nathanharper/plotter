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
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Snackbar,
  Alert,
} from '@mui/material';
import { ArrowBack, Timeline as TimelineIcon, Add } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import Link from 'next/link';
import { Character, Event } from '@/lib/db';

interface TimelineEvent extends Event {
  role?: string;
}

export default function CharacterTimelinePage() {
  const params = useParams();
  const characterId = params.id as string;
  const [character, setCharacter] = useState<Character | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_date: dayjs() as Dayjs,
    character_ids: [] as number[],
    roles: [] as string[],
  });
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

  useEffect(() => {
    if (characterId) {
      fetchCharacterAndTimeline();
    }
  }, [characterId]);

  const fetchCharacterAndTimeline = async () => {
    try {
      setLoading(true);
      
      // Fetch all characters
      const characterResponse = await fetch('/api/characters');
      if (characterResponse.ok) {
        const allCharacters = await characterResponse.json();
        setCharacters(allCharacters);
        const foundCharacter = allCharacters.find((c: Character) => c.id === parseInt(characterId));
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

  const handleOpenCreateDialog = () => {
    setEventForm({
      title: '',
      description: '',
      event_date: dayjs(),
      character_ids: [parseInt(characterId)], // Pre-select current character
      roles: [''],
    });
    setDialogOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!eventForm.title.trim()) {
      setSnackbar({ open: true, message: 'Event title is required', severity: 'error' });
      return;
    }

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...eventForm,
          event_date: eventForm.event_date.toISOString(),
        }),
      });

      if (response.ok) {
        // Refresh the timeline
        const timelineResponse = await fetch(`/api/characters/${characterId}/timeline`);
        if (timelineResponse.ok) {
          const data = await timelineResponse.json();
          setTimeline(data);
        }
        
        setDialogOpen(false);
        setEventForm({
          title: '',
          description: '',
          event_date: dayjs(),
          character_ids: [],
          roles: [],
        });
        setSnackbar({ open: true, message: 'Event created successfully', severity: 'success' });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create event');
      }
    } catch (error: any) {
      console.error('Error creating event:', error);
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    }
  };

  const handleCharacterChange = (event: any) => {
    const value = event.target.value;
    setEventForm({
      ...eventForm,
      character_ids: typeof value === 'string' ? value.split(',').map(Number) : value,
    });
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
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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

        <Fab
          color="primary"
          aria-label="add event"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleOpenCreateDialog}
        >
          <Add />
        </Fab>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create New Event for {character.name}</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                autoFocus
                label="Event Title"
                fullWidth
                variant="outlined"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              />
              
              <DateTimePicker
                label="Event Date & Time"
                value={eventForm.event_date}
                onChange={(newValue) => setEventForm({ ...eventForm, event_date: newValue || dayjs() })}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />

              <TextField
                label="Description (optional)"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              />

              <FormControl fullWidth>
                <InputLabel>Characters Involved</InputLabel>
                <Select
                  multiple
                  value={eventForm.character_ids}
                  onChange={handleCharacterChange}
                  input={<OutlinedInput label="Characters Involved" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as number[]).map((value) => {
                        const char = characters.find((c) => c.id === value);
                        return <Chip key={value} label={char?.name} size="small" />;
                      })}
                    </Box>
                  )}
                >
                  {characters.map((char) => (
                    <MenuItem key={char.id} value={char.id}>
                      {char.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEvent} variant="contained">
              Create Event
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
} 