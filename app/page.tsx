'use client';

import { Container, Typography, Box, Card, CardContent, Button, Grid } from '@mui/material';
import { Timeline, People, Hub } from '@mui/icons-material';
import Link from 'next/link';

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" component="h1" gutterBottom color="primary">
          Story Plotter
        </Typography>
        <Typography variant="h6" color="textSecondary" mb={4}>
          Track plot events and characters in your ongoing story
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <People sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Characters
              </Typography>
              <Typography variant="body2" color="textSecondary" mb={3}>
                Create and manage your story characters. Add descriptions and track their involvement in events.
              </Typography>
              <Link href="/characters" style={{ textDecoration: 'none' }}>
                <Button variant="contained" size="large" fullWidth>
                  Manage Characters
                </Button>
              </Link>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <Timeline sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Events
              </Typography>
              <Typography variant="body2" color="textSecondary" mb={3}>
                Create chronological plot events and assign characters to them with specific roles.
              </Typography>
              <Link href="/events" style={{ textDecoration: 'none' }}>
                <Button variant="contained" size="large" fullWidth>
                  Manage Events
                </Button>
              </Link>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <Hub sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Relationships
              </Typography>
              <Typography variant="body2" color="textSecondary" mb={3}>
                Explore character timelines and relationships by viewing shared events between characters.
              </Typography>
              <Link href="/timelines" style={{ textDecoration: 'none' }}>
                <Button variant="contained" size="large" fullWidth>
                  View Timelines
                </Button>
              </Link>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
} 