'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab,
  IconButton,
  Snackbar,
  Alert,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Menu,
  CardActions,
} from '@mui/material';
import { Add, Event, ArrowBack, AccessTime, MoreVert, Edit, Delete } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import Link from 'next/link';
import { EventWithCharacters, Character } from '@/lib/db';

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithCharacters[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventWithCharacters | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_date: dayjs() as Dayjs,
    character_ids: [] as number[],
    roles: [] as string[],
  });
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventWithCharacters | null>(null);

  useEffect(() => {
    fetchEvents();
    fetchCharacters();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        throw new Error('Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setSnackbar({ open: true, message: 'Failed to load events', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

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

  const handleOpenCreateDialog = () => {
    setEditingEvent(null);
    setEventForm({
      title: '',
      description: '',
      event_date: dayjs(),
      character_ids: [],
      roles: [],
    });
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (event: EventWithCharacters) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || '',
      event_date: dayjs(event.event_date),
      character_ids: event.characters ? event.characters.map((c: any) => c.id) : [],
      roles: event.characters ? event.characters.map((c: any) => c.role || '') : [],
    });
    setDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleSaveEvent = async () => {
    if (!eventForm.title.trim()) {
      setSnackbar({ open: true, message: 'Event title is required', severity: 'error' });
      return;
    }

    try {
      const url = editingEvent ? `/api/events/${editingEvent.id}` : '/api/events';
      const method = editingEvent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...eventForm,
          event_date: eventForm.event_date.toISOString(),
        }),
      });

      if (response.ok) {
        await fetchEvents(); // Refresh the list to get updated data
        setDialogOpen(false);
        setEventForm({
          title: '',
          description: '',
          event_date: dayjs(),
          character_ids: [],
          roles: [],
        });
        setEditingEvent(null);
        setSnackbar({ 
          open: true, 
          message: editingEvent ? 'Event updated successfully' : 'Event created successfully', 
          severity: 'success' 
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save event');
      }
    } catch (error: any) {
      console.error('Error saving event:', error);
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    }
  };

  const handleDeleteEvent = async (event: EventWithCharacters) => {
    if (!confirm(`Are you sure you want to delete "${event.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEvents(events.filter(e => e.id !== event.id));
        setSnackbar({ open: true, message: 'Event deleted successfully', severity: 'success' });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete event');
      }
    } catch (error: any) {
      console.error('Error deleting event:', error);
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    }
    
    setMenuAnchor(null);
  };

  const handleCharacterChange = (event: any) => {
    const value = event.target.value;
    setEventForm({
      ...eventForm,
      character_ids: typeof value === 'string' ? value.split(',').map(Number) : value,
    });
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, eventItem: EventWithCharacters) => {
    setMenuAnchor(event.currentTarget);
    setSelectedEvent(eventItem);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedEvent(null);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading events...</Typography>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" alignItems="center" mb={4}>
          <Link href="/" style={{ textDecoration: 'none', marginRight: 16 }}>
            <IconButton>
              <ArrowBack />
            </IconButton>
          </Link>
          <Typography variant="h4" component="h1" color="primary">
            Events Timeline
          </Typography>
        </Box>

        <Stack spacing={3}>
          {events.map((event) => (
            <Card key={event.id} sx={{ position: 'relative' }}>
              <CardContent>
                <Box display="flex" alignItems="flex-start" gap={2}>
                  <AccessTime sx={{ color: 'primary.main', mt: 0.5 }} />
                  <Box flexGrow={1}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Typography variant="h6" component="h2">
                        {event.title}
                      </Typography>
                      <IconButton 
                        onClick={(e) => handleMenuClick(e, event)}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" color="textSecondary" mb={1}>
                      {dayjs(event.event_date).format('MMMM D, YYYY [at] h:mm A')}
                    </Typography>
                    {event.description && (
                      <Typography variant="body1" mb={2}>
                        {event.description}
                      </Typography>
                    )}
                    {event.characters && event.characters.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" mb={1}>
                          Characters involved:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {event.characters.map((character: any) => (
                            <Chip
                              key={character.id}
                              label={character.role ? `${character.name} (${character.role})` : character.name}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {events.length === 0 && (
          <Box textAlign="center" mt={4}>
            <Typography variant="h6" color="textSecondary">
              No events yet. Create your first event!
            </Typography>
          </Box>
        )}

                <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleOpenCreateDialog}
        >
          <Add />
        </Fab>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => selectedEvent && handleOpenEditDialog(selectedEvent)}>
            <Edit sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <MenuItem 
            onClick={() => selectedEvent && handleDeleteEvent(selectedEvent)}
            sx={{ color: 'error.main' }}
          >
            <Delete sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
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
                        const character = characters.find((c) => c.id === value);
                        return <Chip key={value} label={character?.name} size="small" />;
                      })}
                    </Box>
                  )}
                >
                  {characters.map((character) => (
                    <MenuItem key={character.id} value={character.id}>
                      {character.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEvent} variant="contained">
              {editingEvent ? 'Update Event' : 'Create Event'}
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