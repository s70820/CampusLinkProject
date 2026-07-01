import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import PortalHero from './Student/ui/PortalHero';
import SectionCard from './Student/ui/SectionCard';
import DashboardCard from './Student/ui/DashboardCard';
import EmptyState from './Student/ui/EmptyState';
import OrganizerLayout from './OrganizerLayout';
import useOrganizerProgrammes from '../hooks/useOrganizerProgrammes';
import { useStoredUser } from '../hooks/useStoredUser';
import {
  approvePayment,
  fetchProgrammeRegistrations,
  fileUrl,
  rejectPayment,
} from '../services/registrationApi';

const statusPalette = {
  ACTIVE: 'success',
  PENDING_PAYMENT_VERIFICATION: 'warning',
  PENDING_TEAM: 'warning',
  PAYMENT_REJECTED: 'error',
  PAYMENT_APPROVED: 'success',
};

const statusLabel = (status) => {
  const map = {
    ACTIVE: 'Active',
    PENDING_PAYMENT_VERIFICATION: 'Pending Approval',
    PENDING_TEAM: 'Pending Team',
    PAYMENT_REJECTED: 'Payment Rejected',
    PAYMENT_APPROVED: 'Payment Approved',
  };
  return map[status] || status;
};

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
};

const OrganizerRegistrations = () => {
  const { user } = useStoredUser();
  const { programmes, loading: loadingProgrammes, error: programmesError } = useOrganizerProgrammes({ operationalOnly: true });
  const [selectedProgrammeId, setSelectedProgrammeId] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [detailSearch, setDetailSearch] = useState('');
  const [detailStatus, setDetailStatus] = useState('All');
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedProgrammeId && programmes.length > 0) {
      setSelectedProgrammeId(String(programmes[0].id));
    }
  }, [programmes, selectedProgrammeId]);

  const loadRegistrations = useCallback(async (programmeId) => {
    if (!programmeId) {
      setRegistrations([]);
      return;
    }
    setLoadingRegistrations(true);
    try {
      const data = await fetchProgrammeRegistrations(programmeId);
      setRegistrations(data);
    } catch {
      setRegistrations([]);
    } finally {
      setLoadingRegistrations(false);
    }
  }, []);

  useEffect(() => {
    if (selectedProgrammeId) {
      loadRegistrations(selectedProgrammeId);
      setDetailSearch('');
      setDetailStatus('All');
    }
  }, [selectedProgrammeId, loadRegistrations]);

  const selectedProgramme = useMemo(
    () => programmes.find((p) => String(p.id) === String(selectedProgrammeId)) || null,
    [programmes, selectedProgrammeId]
  );

  const filteredRegistrations = useMemo(() => {
    const search = detailSearch.toLowerCase();
    return registrations.filter((item) => {
      const matchesSearch =
        (item.studentFullName || '').toLowerCase().includes(search) ||
        (item.matricNumber || '').toLowerCase().includes(search) ||
        (item.faculty || '').toLowerCase().includes(search);
      const matchesStatus = detailStatus === 'All' || item.status === detailStatus;
      return matchesSearch && matchesStatus;
    });
  }, [detailSearch, detailStatus, registrations]);

  const counts = useMemo(() => ({
    total: registrations.length,
    pending: registrations.filter((r) =>
      ['PENDING_PAYMENT_VERIFICATION', 'PENDING_TEAM'].includes(r.status)
    ).length,
    active: registrations.filter((r) => r.status === 'ACTIVE').length,
  }), [registrations]);

  const handlePaymentAction = async (registrationId, action) => {
    setActionId(registrationId);
    setError('');
    try {
      if (action === 'approve') {
        await approvePayment(registrationId, user.id);
      } else {
        await rejectPayment(registrationId, user.id);
      }
      await loadRegistrations(selectedProgrammeId);
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed. Please try again.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <OrganizerLayout>
      <Box sx={{ maxWidth: 1400, mx: 'auto', pb: 4 }}>
        <PortalHero
          eyebrow="Organizer Portal"
          title="Programme Registrations"
          subtitle={
            user.clubName
              ? `Review sign-ups and payment verification for ${user.clubName} programmes.`
              : 'Review sign-ups, verify payment receipts, and monitor team registration progress.'
          }
        />

        {(error || programmesError) && (
          <Alert severity="error" sx={{ mb: 2 }}>{error || programmesError}</Alert>
        )}

        {loadingProgrammes ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : programmes.length === 0 ? (
          <EmptyState
            title="No approved programmes yet"
            description="Only HEPA-approved programmes appear here. Submit your draft for MPP and HEPA approval first."
          />
        ) : (
          <>
            <SectionCard title="Select Programme" sx={{ mb: 3 }}>
              <FormControl fullWidth size="small" sx={{ maxWidth: 560 }}>
                <InputLabel id="organizer-registrations-programme-label">Programme</InputLabel>
                <Select
                  labelId="organizer-registrations-programme-label"
                  value={selectedProgrammeId}
                  label="Programme"
                  onChange={(e) => setSelectedProgrammeId(e.target.value)}
                >
                  {programmes.map((programme) => (
                    <MenuItem key={programme.id} value={String(programme.id)}>
                      {programme.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedProgramme && (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                  <Typography sx={{ color: '#64748b', fontSize: '0.9rem', alignSelf: 'center' }}>
                    {formatDate(selectedProgramme.startDate)}
                  </Typography>
                  {selectedProgramme.isPaid && <Chip label="Paid" color="info" size="small" />}
                  {selectedProgramme.isTeamProgramme && <Chip label="Team" color="secondary" size="small" />}
                </Stack>
              )}
            </SectionCard>

            <Box className="portal-grid portal-grid--stats" sx={{ mb: 3 }}>
              <DashboardCard
                label="Total Registrations"
                value={counts.total}
                subtitle="For selected programme"
                icon={GroupsOutlinedIcon}
                variant="blue"
              />
              <DashboardCard
                label="Pending"
                value={counts.pending}
                subtitle="Awaiting approval or team"
                icon={PendingActionsOutlinedIcon}
                variant="amber"
              />
              <DashboardCard
                label="Active"
                value={counts.active}
                subtitle="Confirmed participants"
                icon={CheckCircleOutlinedIcon}
                variant="green"
              />
            </Box>

            <SectionCard
              title="Registrations"
              subtitle={selectedProgramme ? selectedProgramme.title : 'Select a programme above'}
              noPadding
            >
              <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2, pb: 1 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search student, matric or faculty"
                    value={detailSearch}
                    onChange={(event) => setDetailSearch(event.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    select
                    size="small"
                    label="Status"
                    value={detailStatus}
                    onChange={(event) => setDetailStatus(event.target.value)}
                    sx={{ minWidth: 200 }}
                  >
                    {['All', 'ACTIVE', 'PENDING_PAYMENT_VERIFICATION', 'PENDING_TEAM', 'PAYMENT_REJECTED'].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option === 'All' ? 'All statuses' : statusLabel(option)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              </Box>

              {loadingRegistrations ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <TableContainer className="portal-table">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Student Name</TableCell>
                        <TableCell sx={{ width: 100 }}>Matric</TableCell>
                        <TableCell sx={{ minWidth: 180, maxWidth: 240 }}>Faculty</TableCell>
                        <TableCell sx={{ width: 110 }}>Type</TableCell>
                        <TableCell sx={{ width: 120 }}>Registered</TableCell>
                        <TableCell sx={{ width: 150 }}>Status</TableCell>
                        <TableCell sx={{ width: 240 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredRegistrations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 5, color: '#64748b' }}>
                            No registrations match the current filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRegistrations.map((registration) => (
                          <TableRow key={registration.id} hover>
                            <TableCell sx={{ fontWeight: 600 }}>{registration.studentFullName || '—'}</TableCell>
                            <TableCell>{registration.matricNumber || '—'}</TableCell>
                            <TableCell>{registration.faculty || '—'}</TableCell>
                            <TableCell>{registration.registrationType}</TableCell>
                            <TableCell>{formatDate(registration.registeredAt)}</TableCell>
                            <TableCell>
                              <Chip
                                label={statusLabel(registration.status)}
                                color={statusPalette[registration.status] || 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                {registration.paymentReceiptUrl && (
                                  <Link href={fileUrl(registration.paymentReceiptUrl)} target="_blank" rel="noopener noreferrer">
                                    Receipt
                                  </Link>
                                )}
                                {registration.status === 'PENDING_PAYMENT_VERIFICATION' && (
                                  <>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="success"
                                      disabled={actionId === registration.id}
                                      onClick={() => handlePaymentAction(registration.id, 'approve')}
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                      disabled={actionId === registration.id}
                                      onClick={() => handlePaymentAction(registration.id, 'reject')}
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </SectionCard>
          </>
        )}
      </Box>
    </OrganizerLayout>
  );
};

export default OrganizerRegistrations;
