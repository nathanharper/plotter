'use client';

import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Add, ArrowBack, DragIndicator, MoreVert, Edit, Delete } from '@mui/icons-material';
import { draggable, dropTargetForElements, monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
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
  const [draggedEventId, setDraggedEventId] = useState<number | null>(null);

  useEffect(() => {
    fetchEvents();
    fetchCharacters();
  }, []);

  useEffect(() => {
    return monitorForElements({
      onDragStart({ source }: { source: any }) {
        if (source.data.type === 'event') {
          setDraggedEventId(source.data.eventId);
        }
      },
      onDrop({ source, location }: { source: any; location: any }) {
        const destination = location.current.dropTargets[0];
        if (!destination) return;

        const sourceData = source.data;
        const destinationData = destination.data;

        if (sourceData.type === 'event' && destinationData.type === 'drop-zone') {
          const eventId = sourceData.eventId;
          const dropZoneIndex = destinationData.index;
          const currentIndex = events.findIndex(e => e.id === eventId);
          
          if (currentIndex !== -1) {
            handleReorder(eventId, dropZoneIndex);
          }
        }
        
        setDraggedEventId(null);
      },
    });
  }, [events]);

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
        body: JSON.stringify(eventForm),
      });

      if (response.ok) {
        await fetchEvents(); // Refresh the list to get updated data
        setDialogOpen(false);
        setEventForm({
          title: '',
          description: '',
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

  const handleReorder = async (eventId: number, dropZoneIndex: number) => {
    // Find the event being moved
    const eventToMove = events.find(e => e.id === eventId);
    if (!eventToMove) return;

    // Calculate the new fractional position based on drop zone index
    let newPosition: number;
    
    if (dropZoneIndex === 0) {
      // Moving to the beginning (before first event)
      const firstEvent = events[0];
      newPosition = firstEvent ? parseFloat(firstEvent.position.toString()) - 1 : 1;
    } else if (dropZoneIndex >= events.length) {
      // Moving to the end (after last event)
      const lastEvent = events[events.length - 1];
      newPosition = lastEvent ? parseFloat(lastEvent.position.toString()) + 1 : 1;
    } else {
      // Moving between events
      // dropZoneIndex represents the position after the (dropZoneIndex-1)th event
      const prevEvent = events[dropZoneIndex - 1];
      const nextEvent = events[dropZoneIndex];
      
      if (prevEvent && nextEvent) {
        // Position between two events
        const prevPos = parseFloat(prevEvent.position.toString());
        const nextPos = parseFloat(nextEvent.position.toString());
        newPosition = (prevPos + nextPos) / 2;
      } else if (prevEvent) {
        // After the previous event
        newPosition = parseFloat(prevEvent.position.toString()) + 1;
      } else if (nextEvent) {
        // Before the next event
        newPosition = parseFloat(nextEvent.position.toString()) - 1;
      } else {
        // Fallback
        newPosition = 1;
      }
    }

    // Ensure we have a valid position
    if (isNaN(newPosition) || newPosition === null || newPosition === undefined) {
      console.error('Invalid newPosition calculated:', newPosition);
      return;
    }

    // Optimistically update the UI
    const currentIndex = events.findIndex(e => e.id === eventId);
    if (currentIndex !== -1) {
      const newEvents = [...events];
      const [removed] = newEvents.splice(currentIndex, 1);
      
      // Insert at the correct position
      let insertIndex = dropZoneIndex;
      if (currentIndex < dropZoneIndex) {
        insertIndex = dropZoneIndex - 1;
      }
      
      newEvents.splice(insertIndex, 0, { ...removed, position: newPosition });
      setEvents(newEvents);
    }

    try {
      const response = await fetch('/api/events/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          newPosition,
        }),
      });

      if (!response.ok) {
        console.error('Failed to reorder event:', response);
        throw new Error('Failed to reorder event');
      }

      // Refresh events from server to ensure consistency
      await fetchEvents();
    } catch (error) {
      console.error('Error reordering event:', error);
      setSnackbar({
        open: true,
        message: 'Failed to reorder event',
        severity: 'error',
      });
      // Revert on error
      await fetchEvents();
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading events...</Typography>
      </Container>
    );
  }

  return (
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

      <Box>
        {/* Drop zone before first event */}
        <DropZone index={0} isDraggedOver={false} />
        
        {events.map((event, index) => (
          <React.Fragment key={event.id}>
            <EventCard
              event={event}
              index={index}
              onMenuClick={handleMenuClick}
              isDraggedItem={draggedEventId === event.id}
            />
            {/* Drop zone after each event */}
            <DropZone index={index + 1} isDraggedOver={false} />
          </React.Fragment>
        ))}
      </Box>

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
  );
}

interface EventCardProps {
  event: EventWithCharacters;
  index: number;
  onMenuClick: (event: React.MouseEvent<HTMLElement>, eventItem: EventWithCharacters) => void;
  isDraggedItem: boolean;
}

function EventCard({ event, index, onMenuClick, isDraggedItem }: EventCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const eventElement = document.querySelector(`[data-event-id="${event.id}"]`) as HTMLElement;
    if (!eventElement) return;

    return draggable({
      element: eventElement,
      getInitialData: () => ({ type: 'event', eventId: event.id, index }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [event.id, index]);

  return (
    <Card 
      data-event-id={event.id}
      sx={{ 
        position: 'relative',
        transform: isDragging ? 'rotate(2deg)' : 'none',
        opacity: isDraggedItem ? 0.5 : 1,
        transition: 'transform 0.2s ease, opacity 0.2s ease',
        cursor: 'grab',
        mb: 2,
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: 'text.secondary',
            mt: 0.5 
          }}>
            <DragIndicator />
          </Box>
          <Box flexGrow={1}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="h6" component="h2">
                {event.title}
              </Typography>
              <IconButton 
                onClick={(e) => onMenuClick(e, event)}
                size="small"
              >
                <MoreVert />
              </IconButton>
            </Box>
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
  );
}

interface DropZoneProps {
  index: number;
  isDraggedOver: boolean;
}

function DropZone({ index }: DropZoneProps) {
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  useEffect(() => {
    const dropZoneElement = document.querySelector(`[data-drop-zone="${index}"]`) as HTMLElement;
    if (!dropZoneElement) return;

    return dropTargetForElements({
      element: dropZoneElement,
      getData: () => ({ type: 'drop-zone', index }),
      canDrop: ({ source }: { source: any }) => source.data.type === 'event',
      onDragEnter: () => setIsDraggedOver(true),
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: () => setIsDraggedOver(false),
    });
  }, [index]);

  return (
    <Box
      data-drop-zone={index}
      sx={{
        height: isDraggedOver ? '4px' : '16px',
        position: 'relative',
        transition: 'height 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isDraggedOver && (
        <Box
          sx={{
            width: '100%',
            height: '3px',
            backgroundColor: 'primary.main',
            borderRadius: '2px',
            boxShadow: '0 0 4px rgba(25, 118, 210, 0.5)',
          }}
        />
      )}
    </Box>
  );
} 