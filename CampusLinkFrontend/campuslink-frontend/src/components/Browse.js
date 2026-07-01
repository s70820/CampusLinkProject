import React, { useState } from 'react';
import { Alert, Box, CircularProgress, Grid, Typography } from '@mui/material';
import StudentLayout from './Student/layout/StudentLayout';
import PageHeader from './Student/ui/PageHeader';
import PortalSearchField from './Student/ui/PortalSearchField';
import PortalFilterSelect from './Student/ui/PortalFilterSelect';
import ProgrammeCard from './Student/ui/ProgrammeCard';
import EmptyState from './Student/ui/EmptyState';
import RegistrationForm from './RegistrationForm';
import ProgrammeDetailsDialog from './ProgrammeDetailsDialog';
import useApprovedProgrammes from '../hooks/useApprovedProgrammes';
import { BROWSE_CATEGORY_OPTIONS } from '../constants/programmeCategories';
import { portalStatusBarSx } from './Student/ui/portalFilterStyles';

const LEVEL_OPTIONS = ['All', 'University', 'National', 'International', 'Faculty/Club'];

const Browse = () => {
  const { programmes, loading, error, reloadProgrammes } = useApprovedProgrammes();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [selectedProgramme, setSelectedProgramme] = useState(null);

  const programmeCategories = BROWSE_CATEGORY_OPTIONS;

  const filteredProgrammes = programmes.filter((programme) => {
    const searchTerm = search.toLowerCase();
    const matchesCategory = selectedCategory === 'All' || programme.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || programme.programmeLevel === selectedLevel;
    const matchesSearch =
      programme.title.toLowerCase().includes(searchTerm) ||
      programme.description.toLowerCase().includes(searchTerm) ||
      (programme.organizerClub || '').toLowerCase().includes(searchTerm) ||
      (programme.location || '').toLowerCase().includes(searchTerm);
    return matchesCategory && matchesLevel && matchesSearch;
  });

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedLevel('All');
  };

  return (
    <StudentLayout>
      <PageHeader
        title="Browse Programmes"
        subtitle="Discover co-curricular programmes, filter by category, and register for activities."
      />

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box className="portal-card" sx={{ mb: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: 2,
            bgcolor: 'rgba(239, 246, 255, 0.55)',
            borderBottom: '1px solid rgba(37, 99, 235, 0.1)',
          }}
        >
          <Grid container spacing={1.5} alignItems="flex-end">
            <Grid size={{ xs: 12, md: 5 }}>
              <PortalSearchField
                label="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Title, description, organiser..."
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
              <PortalFilterSelect
                label="Category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                options={programmeCategories}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
              <PortalFilterSelect
                label="Programme Level"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                options={LEVEL_OPTIONS}
              />
            </Grid>
          </Grid>
        </Box>

        <Box className="portal-status-bar" sx={portalStatusBarSx}>
          <Typography sx={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>
            Showing{' '}
            <Box component="span" sx={{ color: '#1d4ed8', fontWeight: 800 }}>
              {filteredProgrammes.length}
            </Box>{' '}
            of{' '}
            <Box component="span" sx={{ color: '#0f172a', fontWeight: 800 }}>
              {programmes.length}
            </Box>{' '}
            programmes
          </Typography>
          {(search || selectedCategory !== 'All' || selectedLevel !== 'All') && (
            <Typography
              component="button"
              onClick={clearFilters}
              sx={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#2563eb',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Clear filters
            </Typography>
          )}
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : filteredProgrammes.length === 0 ? (
        <EmptyState
          title={programmes.length === 0 ? 'No programmes available' : 'No programmes found'}
          description={
            programmes.length === 0
              ? 'Approved programmes will appear here once they are published by organisers.'
              : 'Try adjusting your search or filters to find available programmes.'
          }
          actionLabel={programmes.length === 0 ? undefined : 'Clear filters'}
          onAction={programmes.length === 0 ? undefined : clearFilters}
        />
      ) : (
        <Grid container spacing={2}>
          {filteredProgrammes.map((programme) => (
            <Grid key={programme.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <ProgrammeCard
                programme={programme}
                onViewDetails={(p) => { setSelectedProgramme(p); setDetailsOpen(true); }}
                onRegister={(p) => { if (p.canRegister !== false) { setSelectedProgramme(p); setRegistrationOpen(true); } }}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <ProgrammeDetailsDialog
        open={detailsOpen}
        onClose={() => { setDetailsOpen(false); setSelectedProgramme(null); }}
        programme={selectedProgramme}
        onRegister={(p) => { if (p.canRegister !== false) { setSelectedProgramme(p); setRegistrationOpen(true); } }}
      />
      <RegistrationForm
        open={registrationOpen}
        onClose={() => { setRegistrationOpen(false); setSelectedProgramme(null); }}
        programme={selectedProgramme}
        onRegistered={reloadProgrammes}
      />
    </StudentLayout>
  );
};

export default Browse;
