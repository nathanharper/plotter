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
  Grid,
  Fab,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add, Person, ArrowBack } from '@mui/icons-material';
import Link from 'next/link';
import { Character } from '@/lib/db';

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCharacter, setNewCharacter] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await fetch('/api/characters');
      if (response.ok) {
        const data = await response.json();
        setCharacters(data);
      } else {
        throw new Error('Failed to fetch characters');
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
      setSnackbar({ open: true, message: 'Failed to load characters', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCharacter = async () => {
    if (!newCharacter.name.trim()) {
      setSnackbar({ open: true, message: 'Character name is required', severity: 'error' });
      return;
    }

    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCharacter),
      });

      if (response.ok) {
        const character = await response.json();
        setCharacters([...characters, character]);
        setDialogOpen(false);
        setNewCharacter({ name: '', description: '' });
        setSnackbar({ open: true, message: 'Character created successfully', severity: 'success' });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create character');
      }
    } catch (error: any) {
      console.error('Error creating character:', error);
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading characters...</Typography>
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
          Characters
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {characters.map((character) => (
          <Grid item xs={12} sm={6} md={4} key={character.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Person sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" component="h2">
                    {character.name}
                  </Typography>
                </Box>
                {character.description && (
                  <Typography variant="body2" color="textSecondary" mb={2}>
                    {character.description}
                  </Typography>
                )}
                <Link href={`/characters/${character.id}/timeline`} style={{ textDecoration: 'none' }}>
                  <Button variant="outlined" size="small">
                    View Timeline
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {characters.length === 0 && (
        <Box textAlign="center" mt={4}>
          <Typography variant="h6" color="textSecondary">
            No characters yet. Create your first character!
          </Typography>
        </Box>
      )}

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setDialogOpen(true)}
      >
        <Add />
      </Fab>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Character</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Character Name"
            fullWidth
            variant="outlined"
            value={newCharacter.name}
            onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newCharacter.description}
            onChange={(e) => setNewCharacter({ ...newCharacter, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateCharacter} variant="contained">
            Create
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