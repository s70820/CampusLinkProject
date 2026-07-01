import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Link,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import HepaLayout from './HepaLayout';
import PortalHero from './Student/ui/PortalHero';
import DashboardCard from './Student/ui/DashboardCard';
import SectionCard from './Student/ui/SectionCard';
import RoleRequestReviewDialog from './review/RoleRequestReviewDialog';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import StatusBadge from './Student/ui/StatusBadge';
import { useStoredUser } from '../hooks/useStoredUser';
import {
  approveRoleRequest,
  fetchRoleRequests,
  rejectRoleRequest,
  revokeRoleRequest,
} from '../services/roleRequestApi';
import { prepareRoleRequestDocuments } from '../utils/roleRequestDocuments';

const STATUS_TABS = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REVOKED', label: 'Revoked' },
  { value: 'REJECTED', label: 'Rejected' },
];

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatRoleLabel(role) {
  if (!role) return '—';
  const upper = role.toUpperCase();
  if (upper === 'ORGANIZER') return 'Club Secretary (Organizer)';
  if (upper === 'MPP') return 'MPP Reviewer';
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function getRequestDocuments(request) {
  if (!request) return [];
  if (request.documents?.length) return request.documents;
  if (request.documentUrl) {
    return [{ name: request.documentName || 'Supporting Document', url: request.documentUrl }];
  }
  return [];
}

function RoleRequestManagement() {
  const { user } = useStoredUser();
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchRoleRequests('ALL');
      setRequests(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load role requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const counts = useMemo(() => {
    const pending = requests.filter((r) => r.status === 'PENDING_HEPA_APPROVAL').length;
    const approved = requests.filter((r) => r.status === 'APPROVED').length;
    const revoked = requests.filter((r) => r.status === 'REVOKED').length;
    const rejected = requests.filter((r) => r.status === 'REJECTED').length;
    return { pending, approved, revoked, rejected, total: requests.length };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    if (filter === 'ALL') return requests;
    if (filter === 'PENDING') {
      return requests.filter((r) => r.status === 'PENDING_HEPA_APPROVAL');
    }
    return requests.filter((r) => r.status === filter);
  }, [filter, requests]);

  const handleApprove = async (reviewNotes) => {
    if (!user.id || !selectedRequest) return;
    setActionLoading(true);
    setMessage('');
    setError('');
    try {
      const result = await approveRoleRequest(selectedRequest.id, user.id, reviewNotes);
      const grantedRole = result?.assignedRole || selectedRequest.requestedRole;
      setMessage(`Approved ${selectedRequest.requesterName} as ${formatRoleLabel(grantedRole)}. Their account role has been updated.`);
      setSelectedRequest(null);
      await loadRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reviewNotes) => {
    if (!user.id || !selectedRequest) return;
    setActionLoading(true);
    setMessage('');
    setError('');
    try {
      await rejectRoleRequest(selectedRequest.id, user.id, reviewNotes);
      setMessage(`Rejected role request from ${selectedRequest.requesterName}.`);
      setSelectedRequest(null);
      await loadRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async (reviewNotes) => {
    if (!user.id || !selectedRequest) return;
    setActionLoading(true);
    setMessage('');
    setError('');
    try {
      const result = await revokeRoleRequest(selectedRequest.id, user.id, reviewNotes);
      const removedRole = result?.assignedRole || selectedRequest.requestedRole;
      setMessage(`Revoked ${formatRoleLabel(removedRole)} role for ${selectedRequest.requesterName}. Account restored to Student.`);
      setSelectedRequest(null);
      await loadRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to revoke role.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <HepaLayout>
      <PortalHero
        eyebrow="HEPA Portal"
        title="Role Request Management"
        subtitle="Review student applications for club secretary (Organizer) and MPP roles. Approvals update accounts automatically; approved roles can be revoked if granted by mistake."
      />

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {message && (
        <Alert severity="success" sx={{ mt: 2 }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}

      <Box className="portal-grid portal-grid--stats" sx={{ mb: 3 }}>
        <DashboardCard label="Pending" value={counts.pending} subtitle="Awaiting HEPA review" icon={HowToRegOutlinedIcon} variant="amber" />
        <DashboardCard label="Approved" value={counts.approved} subtitle="Role upgraded" icon={TaskAltOutlinedIcon} variant="green" />
        <DashboardCard label="Rejected" value={counts.rejected} subtitle="Returned to student" icon={CancelOutlinedIcon} variant="blue" />
        <DashboardCard label="Total Requests" value={counts.total} subtitle="All time" icon={ListAltOutlinedIcon} variant="purple" />
      </Box>

      <SectionCard title="Role Requests">
        <Tabs value={filter} onChange={(event, value) => setFilter(value)} sx={{ mb: 2 }}>
          {STATUS_TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>

        <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Requester</TableCell>
              <TableCell>Requested Role</TableCell>
              <TableCell>Club</TableCell>
              <TableCell>Submitted</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Document</TableCell>
              <TableCell>Review Notes</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <Typography sx={{ py: 2 }}>Loading requests…</Typography>
                </TableCell>
              </TableRow>
            ) : filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <Typography sx={{ py: 2 }}>No requests found for this status.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => {
                const docs = prepareRoleRequestDocuments(
                  getRequestDocuments(request),
                  request.requestedRole
                );
                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{request.requesterName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {request.requesterMatric} · {formatRoleLabel(request.currentRole)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: request.requestedRole === 'ORGANIZER' ? '#1d4ed8' : '#7c3aed' }}>
                      {formatRoleLabel(request.requestedRole)}
                    </TableCell>
                    <TableCell>{request.requestedRole === 'ORGANIZER' ? (request.clubName || '—') : '—'}</TableCell>
                    <TableCell>{formatDate(request.submittedAt)}</TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} variant="roleRequest" />
                    </TableCell>
                    <TableCell>
                      {docs.length ? (
                        docs.map((doc) => (
                          <Box key={doc.key} sx={{ mb: 0.5 }}>
                            <Link href={doc.viewUrl} target="_blank" rel="noopener noreferrer">
                              {doc.displayLabel}
                            </Link>
                          </Box>
                        ))
                      ) : '—'}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography variant="body2" color="text.secondary">
                        {request.reviewNotes || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<VisibilityOutlinedIcon />}
                        onClick={() => setSelectedRequest(request)}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        </Box>
      </SectionCard>

      <RoleRequestReviewDialog
        open={Boolean(selectedRequest)}
        request={selectedRequest}
        viewerUserId={user?.id}
        onClose={() => {
          if (!actionLoading) setSelectedRequest(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
        onRevoke={selectedRequest?.status === 'APPROVED' ? handleRevoke : undefined}
        actionLoading={actionLoading}
      />
    </HepaLayout>
  );
}

export default RoleRequestManagement;
