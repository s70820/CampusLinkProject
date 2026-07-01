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
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import UndoIcon from '@mui/icons-material/Undo';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import MppLayout from './MppLayout';
import HepaLayout from './HepaLayout';
import PortalHero from './Student/ui/PortalHero';
import DashboardCard from './Student/ui/DashboardCard';
import SectionCard from './Student/ui/SectionCard';
import { useStoredUser } from '../hooks/useStoredUser';
import { fetchUserOverview, fetchUsers, revokeUserRole, removeUserAccount } from '../services/adminApi';

const ROLE_TABS = ['ALL', 'STUDENT', 'ORGANIZER', 'MPP', 'HEPA'];

const ROLE_COLORS = {
  STUDENT: '#2563eb',
  ORGANIZER: '#7c3aed',
  MPP: '#0891b2',
  HEPA: '#b45309',
};

function RoleBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{label}</Typography>
        <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>{count} ({pct}%)</Typography>
      </Box>
      <Box sx={{ height: 10, bgcolor: '#e2e8f0', borderRadius: 999 }}>
        <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: color, borderRadius: 999 }} />
      </Box>
    </Box>
  );
}

function UserManagement({ portalRole = 'MPP' }) {
  const { user } = useStoredUser();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removeReason, setRemoveReason] = useState('');
  const [removeLoading, setRemoveLoading] = useState(false);

  const Layout = portalRole === 'HEPA' ? HepaLayout : MppLayout;
  const isHepaPortal = portalRole === 'HEPA';

  const loadData = useCallback(async () => {
    if (!user.id) return;
    setLoading(true);
    setError('');
    try {
      const [overviewData, usersData] = await Promise.all([
        fetchUserOverview(user.id),
        fetchUsers(user.id, filter),
      ]);
      setOverview(overviewData);
      setUsers(usersData);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load user management data.');
    } finally {
      setLoading(false);
    }
  }, [user.id, filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const portalLabel = useMemo(() => (portalRole === 'HEPA' ? 'HEPA' : 'MPP'), [portalRole]);

  const handleRevokeConfirm = async () => {
    if (!user?.id || !revokeTarget || !revokeReason.trim()) return;
    setRevokeLoading(true);
    setError('');
    setMessage('');
    try {
      await revokeUserRole(revokeTarget.id, user.id, revokeReason.trim());
      setMessage(`${revokeTarget.fullName} has been demoted to Student.`);
      setRevokeTarget(null);
      setRevokeReason('');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to revoke role.');
    } finally {
      setRevokeLoading(false);
    }
  };

  const handleRemoveConfirm = async () => {
    if (!user?.id || !removeTarget || !removeReason.trim()) return;
    setRemoveLoading(true);
    setError('');
    setMessage('');
    try {
      await removeUserAccount(removeTarget.id, user.id, removeReason.trim());
      setMessage(`${removeTarget.fullName}'s account has been removed.`);
      setRemoveTarget(null);
      setRemoveReason('');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to remove user account.');
    } finally {
      setRemoveLoading(false);
    }
  };

  return (
    <Layout>
      <PortalHero
        eyebrow={`${portalLabel} Portal`}
        title="User Management"
        subtitle={isHepaPortal
          ? 'System overview of registered users. HEPA can revoke mistaken MPP/organizer roles or remove student/organizer accounts that should not access CampusLink+.'
          : 'System overview of registered users by role — students, organizers, MPP reviewers, and HEPA administrators.'}
      />

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setMessage('')}>{message}</Alert>}

      {loading && !overview ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : overview && (
        <>
          <Box className="portal-grid portal-grid--stats" sx={{ mb: 3 }}>
            <DashboardCard label="Total Users" value={overview.totalUsers} subtitle="All registered accounts" icon={GroupsOutlinedIcon} variant="blue" />
            <DashboardCard label="Students" value={overview.students} subtitle="Active student accounts" icon={SchoolOutlinedIcon} variant="green" />
            <DashboardCard label="Organizers" value={overview.organizers} subtitle="Club programme managers" icon={GroupsOutlinedIcon} variant="purple" />
            <DashboardCard label="MPP + HEPA" value={overview.mpp + overview.hepa} subtitle="Campus admin roles" icon={GroupsOutlinedIcon} variant="amber" />
          </Box>

          <SectionCard title="Users by Role">
            <RoleBar label="Students" count={overview.students} total={overview.totalUsers} color={ROLE_COLORS.STUDENT} />
            <RoleBar label="Organizers" count={overview.organizers} total={overview.totalUsers} color={ROLE_COLORS.ORGANIZER} />
            <RoleBar label="MPP" count={overview.mpp} total={overview.totalUsers} color={ROLE_COLORS.MPP} />
            <RoleBar label="HEPA" count={overview.hepa} total={overview.totalUsers} color={ROLE_COLORS.HEPA} />
          </SectionCard>
        </>
      )}

      <Box sx={{ mt: 3 }}>
      <SectionCard title="User Directory">
        <Tabs value={filter} onChange={(e, value) => setFilter(value)} sx={{ mb: 2 }}>
          {ROLE_TABS.map((tab) => (
            <Tab key={tab} value={tab} label={tab === 'ALL' ? 'All Users' : tab.charAt(0) + tab.slice(1).toLowerCase()} />
          ))}
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Matric</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>{filter === 'ORGANIZER' ? 'Club' : 'Faculty'}</TableCell>
                  <TableCell>Status</TableCell>
                  {isHepaPortal && <TableCell>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{row.fullName}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.matricNumber || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.role}
                        size="small"
                        sx={{
                          bgcolor: `${ROLE_COLORS[row.role] || '#64748b'}22`,
                          color: ROLE_COLORS[row.role] || '#64748b',
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 220 }}>
                      {row.role === 'ORGANIZER' ? (row.clubName || '—') : (row.faculty || '—')}
                    </TableCell>
                    <TableCell>{row.role === 'HEPA' ? '—' : (row.approvalStatus || '—')}</TableCell>
                    {isHepaPortal && (
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {(row.role === 'MPP' || row.role === 'ORGANIZER') && row.approvalStatus !== 'REMOVED' && (
                            <Button
                              size="small"
                              color="warning"
                              variant="outlined"
                              startIcon={<UndoIcon />}
                              onClick={() => {
                                setRevokeReason('');
                                setRevokeTarget(row);
                              }}
                            >
                              Revoke Role
                            </Button>
                          )}
                          {(row.role === 'STUDENT' || row.role === 'ORGANIZER') && row.approvalStatus !== 'REMOVED' && (
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              startIcon={<PersonOffOutlinedIcon />}
                              onClick={() => {
                                setRemoveReason('');
                                setRemoveTarget(row);
                              }}
                            >
                              Remove
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isHepaPortal ? 7 : 6}>
                      <Typography sx={{ py: 2, color: '#64748b' }}>No users found for this filter.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </SectionCard>
      </Box>

      <Dialog
        open={Boolean(revokeTarget)}
        onClose={() => !revokeLoading && setRevokeTarget(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Revoke {revokeTarget?.role} Role</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ mb: 2, color: '#475569' }}>
            This will demote <strong>{revokeTarget?.fullName}</strong> back to <strong>Student</strong>.
            {revokeTarget?.role === 'ORGANIZER' && ' The club secretary slot will be freed for a new appointment.'}
            {' '}Organizers with existing programmes cannot be revoked until those programmes are handled.
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Revocation Reason"
            placeholder="Required — e.g. approved by mistake"
            value={revokeReason}
            onChange={(e) => setRevokeReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRevokeTarget(null)} disabled={revokeLoading}>Cancel</Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={<UndoIcon />}
            disabled={revokeLoading || !revokeReason.trim()}
            onClick={handleRevokeConfirm}
          >
            {revokeLoading ? 'Revoking…' : 'Confirm Revoke'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(removeTarget)}
        onClose={() => !removeLoading && setRemoveTarget(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Remove User Account</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ mb: 2, color: '#475569' }}>
            This will disable <strong>{removeTarget?.fullName}</strong>&apos;s CampusLink+ account.
            The user will no longer be able to sign in or register for programmes.
            {removeTarget?.role === 'ORGANIZER' && ' Any published programmes must be cancelled first.'}
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Removal Reason"
            placeholder="Required — e.g. invalid registration, duplicate account"
            value={removeReason}
            onChange={(e) => setRemoveReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRemoveTarget(null)} disabled={removeLoading}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<PersonOffOutlinedIcon />}
            disabled={removeLoading || !removeReason.trim()}
            onClick={handleRemoveConfirm}
          >
            {removeLoading ? 'Removing…' : 'Confirm Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}

export default UserManagement;
