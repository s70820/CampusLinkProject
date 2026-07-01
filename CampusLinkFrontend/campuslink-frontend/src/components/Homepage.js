import React from 'react';
import { Button, Container, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { primeAuthRouteBackground } from '../utils/authRoute';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AppShellBackground from './Design/AppShellBackground';

const Homepage = () => {
  const cards = [
    {
      icon: <SchoolIcon sx={{ fontSize: 56, color: '#60a5fa' }} />,
      title: 'For Students',
      text: 'Track merit points and participate in university programmes.',
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 56, color: '#fbbf24' }} />,
      title: 'For Organizers',
      text: 'Create and manage university programmes.',
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 56, color: '#34d399' }} />,
      title: 'For Admin',
      text: 'Oversee and approve all activities including MPP approval.',
    },
  ];

  return (
    <AppShellBackground className="homepage-shell">
      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 8, md: 10 },
          textAlign: 'center',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontWeight: 900,
            mb: 2,
            color: '#f8fafc',
            letterSpacing: '-0.05em',
            fontSize: { xs: '2.75rem', md: '4rem' },
            lineHeight: 1.02,
            animation: 'fadeInUp 0.9s ease-out',
          }}
        >
          CampusLink+
        </Typography>
        <Typography
          variant="h6"
          sx={{
            mb: 6,
            color: '#cbd5e1',
            fontWeight: 500,
            fontSize: '1.05rem',
            lineHeight: 1.75,
            maxWidth: 760,
            mx: 'auto',
            animation: 'fadeInUp 1.05s ease-out',
          }}
        >
          Merit Portal & Programme Discovery — Track your achievements, manage programmes, and earn merit points in one vibrant platform.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            justifyContent: 'center',
            gap: 3,
            maxWidth: 1120,
            mx: 'auto',
            mb: 6,
          }}
        >
          {cards.map((card, index) => (
            <Box
              key={card.title}
              className="homepage-glass-card"
              sx={{
                flex: '1 1 280px',
                maxWidth: 300,
                p: 3.5,
                textAlign: 'center',
                minHeight: 240,
                opacity: 0,
                animation: `fadeInUp 0.8s ease-out ${index * 0.12 + 0.2}s forwards`,
              }}
            >
              <Box sx={{ mb: 2 }}>{card.icon}</Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: '#f8fafc' }}>
                {card.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.8 }}>
                {card.text}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/login"
            onClick={primeAuthRouteBackground}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
              color: '#fff',
              fontSize: '1.05rem',
              fontWeight: 700,
              px: 6,
              py: 1.8,
              borderRadius: '999px',
              boxShadow: '0 12px 40px rgba(59, 130, 246, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                boxShadow: '0 16px 48px rgba(59, 130, 246, 0.5)',
              },
            }}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            size="large"
            component={Link}
            to="/register"
            onClick={primeAuthRouteBackground}
            sx={{
              color: '#f8fafc',
              borderColor: 'rgba(148, 163, 184, 0.5)',
              fontSize: '1.05rem',
              fontWeight: 700,
              px: 6,
              py: 1.8,
              borderRadius: '999px',
              '&:hover': {
                borderColor: '#93c5fd',
                bgcolor: 'rgba(59, 130, 246, 0.12)',
              },
            }}
          >
            Register
          </Button>
        </Box>
      </Container>
    </AppShellBackground>
  );
};

export default Homepage;
