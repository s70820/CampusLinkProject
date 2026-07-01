import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
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
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import OrganizerLayout from './OrganizerLayout';
import PortalHero from './Student/ui/PortalHero';
import SectionCard from './Student/ui/SectionCard';
import EmptyState from './Student/ui/EmptyState';
import useOrganizerProgrammes from '../hooks/useOrganizerProgrammes';
import { deleteOrganizerDraft } from '../services/organizerApi';
import { formatProgrammeDate, getProgrammeStatusLabel, getProgrammeStatusStyle, isEditableOrganizerDraft } from '../utils/organizerProgrammeStatus';
import { DRAFT_RETENTION_DAYS, DRAFT_WARNING_DAYS, getDraftExpiryLabel, isDraftExpiringSoon } from '../utils/draftExpiry';

const ProgrammeStatusChip = ({ status }) => {
  const style = getProgrammeStatusStyle(status);
  return (
    <Chip
      label={getProgrammeStatusLabel(status)}
      size="small"
      sx={{ bgcolor: style.bg, color: style.color, border: `1px solid ${style.border}`, fontWeight: 700 }}
    />
  );
};

const MyProgrammes = () => {
  const navigate = useNavigate();
  const { programmes, loading, error, user, refetch } = useOrganizerProgrammes();
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return programmes.filter((p) => {
      const matchesSearch = !query
        || p.title?.toLowerCase().includes(query)
        || p.category?.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [programmes, search, statusFilter]);

  const statusOptions = useMemo(() => {
    const statuses = [...new Set(programmes.map((p) => p.status).filter(Boolean))];
    return ['All', ...statuses];
  }, [programmes]);

  const draftCount = programmes.filter((p) => isEditableOrganizerDraft(p)).length;
  const expiringDraftCount = programmes.filter((p) => isDraftExpiringSoon(p)).length;

  const handleDeleteDraft = async () => {
    if (!deleteTarget || !user?.id) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteOrganizerDraft(Number(user.id), deleteTarget.id);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      const status = err.response?.status;
      const serverMessage = err.response?.data?.message || err.response?.data?.error;
      if (status === 404) {
        setDeleteError(
          serverMessage
            || 'Delete draft API was not found. Please Clean & Build the backend in NetBeans, then restart the server.'
        );
      } else {
        setDeleteError(serverMessage || 'Unable to delete this draft.');
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <OrganizerLayout>
      <PortalHero
        eyebrow="Organizer Portal"
        title="My Programmes"
        subtitle={
          user.clubName
            ? `All programmes managed by ${user.clubName}.`
            : 'Review programme status, dates, and participant counts.'
        }
      />

      {error && <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>}

      {draftCount > 0 && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: '10px' }}>
          You have {draftCount} draft programme{draftCount === 1 ? '' : 's'}. Drafts are kept for{' '}
          <strong>{DRAFT_RETENTION_DAYS} days</strong> after your last save. You will be notified{' '}
          <strong>{DRAFT_WARNING_DAYS} days before</strong> automatic deletion. Use{' '}
          <strong>Continue Draft</strong> to resume editing.
        </Alert>
      )}

      {expiringDraftCount > 0 && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: '10px' }}>
          {expiringDraftCount} draft programme{expiringDraftCount === 1 ? '' : 's'}{' '}
          will be deleted soon unless you continue editing or save again.
        </Alert>
      )}

      <SectionCard
        title="Programme Portfolio"
        subtitle={`${filtered.length} programme${filtered.length === 1 ? '' : 's'} shown`}
        noPadding
      >
        <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2, pb: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search programmes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status === 'All' ? 'All statuses' : getProgrammeStatusLabel(status)}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <EmptyState
              title="No programmes found"
              description={user.clubName
                ? `${user.clubName} has no programmes matching your filters yet.`
                : 'Create a programme to see it listed here.'}
            />
          </Box>
        ) : (
          <TableContainer className="portal-table">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Programme</TableCell>
                  <TableCell sx={{ width: 140 }}>Category</TableCell>
                  <TableCell sx={{ width: 120 }}>Date</TableCell>
                  <TableCell sx={{ width: 130 }}>Participants</TableCell>
                  <TableCell sx={{ width: 150 }}>Status</TableCell>
                  <TableCell sx={{ width: 220 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((programme) => {
                  const expiryLabel = getDraftExpiryLabel(programme);
                  return (
                    <TableRow key={programme.id} hover>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 0.25 }}>
                          {programme.title || 'Untitled draft'}
                        </Typography>
                        <Typography sx={{ color: '#475569', fontSize: '0.8rem', fontWeight: 500 }}>
                          {programme.organizerClub || user.clubName || 'Club programme'}
                        </Typography>
                        {expiryLabel && (
                          <Chip
                            label={expiryLabel}
                            size="small"
                            color={isDraftExpiringSoon(programme) ? 'warning' : 'default'}
                            sx={{ mt: 0.75, fontWeight: 600 }}
                          />
                        )}
                      </TableCell>
                      <TableCell sx={{ color: '#334155', fontSize: '0.9rem' }}>
                        {programme.category || 'General'}
                      </TableCell>
                      <TableCell sx={{ color: '#334155', fontSize: '0.9rem' }}>
                        {formatProgrammeDate(programme.startDate)}
                      </TableCell>
                      <TableCell sx={{ color: '#334155', fontSize: '0.9rem' }}>
                        {programme.participantCount ?? 0} / {programme.expectedParticipants ?? '—'}
                      </TableCell>
                      <TableCell>
                        <ProgrammeStatusChip status={programme.status} />
                      </TableCell>
                      <TableCell>
                        {isEditableOrganizerDraft(programme) ? (
                          <Stack direction="row" spacing={0.75} alignItems="center">
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<EditOutlinedIcon />}
                              onClick={() => navigate(`/organizer/create-programme/${programme.id}`)}
                            >
                              Continue
                            </Button>
                            <IconButton
                              size="small"
                              color="error"
                              aria-label="Delete draft"
                              onClick={() => {
                                setDeleteError('');
                                setDeleteTarget(programme);
                              }}
                            >
                              <DeleteOutlineOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        ) : (
                          <Typography sx={{ color: '#64748b', fontSize: '0.8rem' }}>—</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SectionCard>

      <Dialog open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Delete draft?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#475569' }}>
            This will permanently delete{' '}
            <strong>{deleteTarget?.title || 'this draft'}</strong>. This action cannot be undone.
          </Typography>
          {deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteDraft} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete draft'}
          </Button>
        </DialogActions>
      </Dialog>
    </OrganizerLayout>
  );
};

export default MyProgrammes;
