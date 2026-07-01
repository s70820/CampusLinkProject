import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Typography,
} from '@mui/material';
import ProgrammeReviewDialog from './review/ProgrammeReviewDialog';
import PortalHero from './Student/ui/PortalHero';
import SectionCard from './Student/ui/SectionCard';
import EmptyState from './Student/ui/EmptyState';
import { useStoredUser } from '../hooks/useStoredUser';
import { formatProgrammeDate, getProgrammeStatusLabel, getProgrammeStatusStyle } from '../utils/organizerProgrammeStatus';

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

const STATUS_FILTERS = [
  { value: 'ALL', label: 'All records' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'PENDING_HEPA', label: 'Forwarded to HEPA' },
];

function WorkflowProgrammeArchive({
  Layout,
  portalRole,
  eyebrow,
  title,
  subtitle,
  fetchProgrammes,
  cancelPublishedProgramme,
}) {
  const { user } = useStoredUser();
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  const loadProgrammes = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await fetchProgrammes(user.id);
      setProgrammes(data);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to load programme records.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [fetchProgrammes, user?.id]);

  useEffect(() => {
    loadProgrammes();
  }, [loadProgrammes]);

  const filteredProgrammes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return programmes.filter((programme) => {
      const matchesStatus = statusFilter === 'ALL' || programme.status === statusFilter;
      const matchesSearch = !query
        || programme.title?.toLowerCase().includes(query)
        || programme.organizerClub?.toLowerCase().includes(query)
        || programme.organizerName?.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [programmes, search, statusFilter]);

  const reviewMode = portalRole === 'HEPA' ? 'hepa' : 'mpp';

  const handleCancelConfirm = async () => {
    if (!user?.id || !cancelTarget || !cancelReason.trim() || !cancelPublishedProgramme) return;
    setCancelLoading(true);
    try {
      await cancelPublishedProgramme(cancelTarget.id, user.id, cancelReason.trim());
      setSnackbar({
        open: true,
        message: `"${cancelTarget.title}" has been withdrawn from the student portal.`,
        severity: 'success',
      });
      setCancelTarget(null);
      setCancelReason('');
      await loadProgrammes();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to cancel programme.',
        severity: 'error',
      });
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <Layout>
      <PortalHero eyebrow={eyebrow} title={title} subtitle={subtitle} />

      <SectionCard
        title={`Programme Records (${filteredProgrammes.length})`}
        action={(
          <Button variant="outlined" size="small" onClick={loadProgrammes} disabled={loading}>
            Refresh
          </Button>
        )}
      >
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <TextField
            size="small"
            label="Search programmes"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 240, flex: 1 }}
          />
          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            {STATUS_FILTERS.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : filteredProgrammes.length === 0 ? (
          <EmptyState message="No programme records match your filters." />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Organizer</TableCell>
                  <TableCell>Club</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  {portalRole === 'HEPA' && <TableCell>MPP</TableCell>}
                  {portalRole === 'MPP' && <TableCell>HEPA</TableCell>}
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProgrammes.map((programme) => (
                  <TableRow key={programme.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{programme.title}</TableCell>
                    <TableCell>{programme.organizerName || '—'}</TableCell>
                    <TableCell>{programme.organizerClub || '—'}</TableCell>
                    <TableCell>{formatProgrammeDate(programme.startDate, programme.endDate)}</TableCell>
                    <TableCell><ProgrammeStatusChip status={programme.status} /></TableCell>
                    {portalRole === 'HEPA' && <TableCell>{programme.mppStatus || '—'}</TableCell>}
                    {portalRole === 'MPP' && <TableCell>{programme.hepaStatus || '—'}</TableCell>}
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setSelectedProgramme(programme)}
                        >
                          View
                        </Button>
                        {programme.status === 'APPROVED' && cancelPublishedProgramme && (
                          <Button
                            variant="contained"
                            color="warning"
                            size="small"
                            onClick={() => {
                              setCancelReason('');
                              setCancelTarget(programme);
                            }}
                          >
                            Unpublish
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SectionCard>

      <ProgrammeReviewDialog
        open={Boolean(selectedProgramme)}
        programme={selectedProgramme}
        reviewMode={reviewMode}
        readOnly
        remarks=""
        onRemarksChange={() => {}}
        onClose={() => setSelectedProgramme(null)}
        onApprove={() => {}}
        onReject={() => {}}
      />

      <Dialog
        open={Boolean(cancelTarget)}
        onClose={() => !cancelLoading && setCancelTarget(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Unpublish Programme</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ mb: 2, color: '#475569' }}>
            This will remove <strong>{cancelTarget?.title}</strong> from the student browse portal,
            cancel active registrations, and notify the organizer and registered students.
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Cancellation Reason"
            placeholder="Required — e.g. venue unavailable, programme postponed"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCancelTarget(null)} disabled={cancelLoading}>Back</Button>
          <Button
            variant="contained"
            color="warning"
            disabled={cancelLoading || !cancelReason.trim()}
            onClick={handleCancelConfirm}
          >
            {cancelLoading ? 'Cancelling…' : 'Confirm Unpublish'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
}

export default WorkflowProgrammeArchive;
