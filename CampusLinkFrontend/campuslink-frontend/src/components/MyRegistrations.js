import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  Grid,
  Link,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import { useNavigate } from 'react-router-dom';
import StudentLayout from './Student/layout/StudentLayout';
import PageHeader from './Student/ui/PageHeader';
import SectionCard from './Student/ui/SectionCard';
import StatusBadge from './Student/ui/StatusBadge';
import EmptyState from './Student/ui/EmptyState';
import { fetchMyRegistrations } from '../services/registrationApi';
import { readStoredUser } from '../hooks/useStoredUser';
import { PENDING_REGISTRATION_STATUSES, registrationStatusLabel } from '../utils/registrationStatus';

const MyRegistrations = () => {
  const navigate = useNavigate();
  const user = readStoredUser();
  const [tabValue, setTabValue] = useState(0);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRegistrations = useCallback(() => {
    if (!user?.id) {
      setRegistrations([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchMyRegistrations(user.id)
      .then(setRegistrations)
      .catch(() => setRegistrations([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => { loadRegistrations(); }, [loadRegistrations]);

  const filtered = registrations.filter((reg) => {
    if (tabValue === 0) return true;
    if (tabValue === 1) return PENDING_REGISTRATION_STATUSES.includes(reg.status);
    if (tabValue === 2) return reg.status === 'ACTIVE';
    if (tabValue === 3) return reg.status === 'PAYMENT_REJECTED';
    return true;
  });

  const pendingCount = registrations.filter((r) => PENDING_REGISTRATION_STATUSES.includes(r.status)).length;
  const activeCount = registrations.filter((r) => r.status === 'ACTIVE').length;

  return (
    <StudentLayout>
      <PageHeader
        title="My Registrations"
        subtitle="Track registration status, attendance, and merit for your programmes."
      />

      <SectionCard noPadding>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          sx={{
            px: 2,
            borderBottom: '1px solid rgba(37, 99, 235, 0.12)',
            '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', color: '#475569' },
            '& .Mui-selected': { color: '#1d4ed8 !important' },
          }}
        >
          <Tab label={`All (${registrations.length})`} />
          <Tab label={`Pending (${pendingCount})`} />
          <Tab label={`Registered (${activeCount})`} />
          <Tab label={`Rejected (${registrations.filter((r) => r.status === 'PAYMENT_REJECTED').length})`} />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <EmptyState
              title="No programmes registered yet"
              description="Browse available programmes and register to see your registration status here."
              icon={HowToRegOutlinedIcon}
              actionLabel="Browse Programmes"
              onAction={() => navigate('/browse')}
            />
          </Box>
        ) : (
          <>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <TableContainer className="portal-table">
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Programme</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Team</TableCell>
                      <TableCell>Registered</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Group Link</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.map((reg) => (
                      <TableRow key={reg.id} hover>
                        <TableCell>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>{reg.programmeTitle}</Typography>
                          <Typography sx={{ color: '#475569', fontSize: '0.75rem' }}>{reg.programmeCategory}</Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', color: '#334155' }}>{reg.registrationType}</TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', color: '#334155' }}>{reg.teamName || '—'}</TableCell>
                        <TableCell sx={{ color: '#475569', fontSize: '0.85rem' }}>
                          {reg.registeredAt ? new Date(reg.registeredAt).toLocaleDateString() : '—'}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={registrationStatusLabel(reg.status)} />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem' }}>
                          {reg.status === 'ACTIVE' && reg.communicationLink ? (
                            <Link href={reg.communicationLink} target="_blank" rel="noopener noreferrer">
                              Join group
                            </Link>
                          ) : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box sx={{ display: { xs: 'block', md: 'none' }, p: 2 }}>
              <Grid container spacing={2}>
                {filtered.map((reg) => (
                  <Grid key={reg.id} size={{ xs: 12 }}>
                    <Box className="portal-card" sx={{ p: 2 }}>
                      <Typography sx={{ fontWeight: 800, mb: 0.5 }}>{reg.programmeTitle}</Typography>
                      <Typography sx={{ color: '#64748b', fontSize: '0.8rem', mb: 1 }}>
                        {reg.registeredAt ? new Date(reg.registeredAt).toLocaleDateString() : '—'}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <StatusBadge status={registrationStatusLabel(reg.status)} />
                        {reg.teamName && <Chip label={reg.teamName} size="small" />}
                      </Stack>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </>
        )}
      </SectionCard>
    </StudentLayout>
  );
};

export default MyRegistrations;
