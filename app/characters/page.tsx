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
  Menu,
  MenuItem,
  CardActions,
} from '@mui/material';
import { Add, Person, ArrowBack, MoreVert, Edit, Delete } from '@mui/icons-material';
import Link from 'next/link';
import { Character } from '@/lib/db';

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [characterForm, setCharacterForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

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

  const handleOpenCreateDialog = () => {
    setEditingCharacter(null);
    setCharacterForm({ name: '', description: '' });
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (character: Character) => {
    setEditingCharacter(character);
    setCharacterForm({ name: character.name, description: character.description || '' });
    setDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleSaveCharacter = async () => {
    if (!characterForm.name.trim()) {
      setSnackbar({ open: true, message: 'Character name is required', severity: 'error' });
      return;
    }

    try {
      const url = editingCharacter ? `/api/characters/${editingCharacter.id}` : '/api/characters';
      const method = editingCharacter ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(characterForm),
      });

      if (response.ok) {
        const savedCharacter = await response.json();
        
        if (editingCharacter) {
          // Update existing character
          setCharacters(characters.map(c => c.id === editingCharacter.id ? savedCharacter : c));
          setSnackbar({ open: true, message: 'Character updated successfully', severity: 'success' });
        } else {
          // Add new character
          setCharacters([...characters, savedCharacter]);
          setSnackbar({ open: true, message: 'Character created successfully', severity: 'success' });
        }
        
        setDialogOpen(false);
        setCharacterForm({ name: '', description: '' });
        setEditingCharacter(null);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save character');
      }
    } catch (error: any) {
      console.error('Error saving character:', error);
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    }
  };

  const handleDeleteCharacter = async (character: Character) => {
    if (!confirm(`Are you sure you want to delete "${character.name}"? This will also remove them from all events.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/characters/${character.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCharacters(characters.filter(c => c.id !== character.id));
        setSnackbar({ open: true, message: 'Character deleted successfully', severity: 'success' });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete character');
      }
    } catch (error: any) {
      console.error('Error deleting character:', error);
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    }
    
    setMenuAnchor(null);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, character: Character) => {
    setMenuAnchor(event.currentTarget);
    setSelectedCharacter(character);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedCharacter(null);
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
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center">
                    <Person sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="h2">
                      {character.name}
                    </Typography>
                  </Box>
                  <IconButton 
                    onClick={(e) => handleMenuClick(e, character)}
                    size="small"
                  >
                    <MoreVert />
                  </IconButton>
                </Box>
                {character.description && (
                  <Typography variant="body2" color="textSecondary" mb={2}>
                    {character.description}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Link href={`/characters/${character.id}/timeline`} style={{ textDecoration: 'none' }}>
                  <Button variant="outlined" size="small">
                    View Timeline
                  </Button>
                </Link>
              </CardActions>
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
        onClick={handleOpenCreateDialog}
      >
        <Add />
      </Fab>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedCharacter && handleOpenEditDialog(selectedCharacter)}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem 
          onClick={() => selectedCharacter && handleDeleteCharacter(selectedCharacter)}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCharacter ? 'Edit Character' : 'Create New Character'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Character Name"
            fullWidth
            variant="outlined"
            value={characterForm.name}
            onChange={(e) => setCharacterForm({ ...characterForm, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={characterForm.description}
            onChange={(e) => setCharacterForm({ ...characterForm, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveCharacter} variant="contained">
            {editingCharacter ? 'Update' : 'Create'}
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