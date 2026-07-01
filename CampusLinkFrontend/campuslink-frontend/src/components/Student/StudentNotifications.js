import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  acceptTeamInvite,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  rejectTeamInvite,
} from '../../services/registrationApi';
import { readStoredUser } from '../../hooks/useStoredUser';
import { getAccountRole } from '../../utils/portalContext';

const StudentNotifications = ({ open, onClose, onUpdated }) => {
  const navigate = useNavigate();
  const user = readStoredUser();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState('');

  const loadNotifications = useCallback(() => {
    if (!user?.id) return;
    setLoading(true);
    fetchNotifications(user.id)
      .then(setNotifications)
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => {
    if (open) loadNotifications();
  }, [open, loadNotifications]);

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);
  const teamInvites = unreadNotifications.filter((n) => n.type === 'TEAM_INVITE');
  const teamRejections = unreadNotifications.filter((n) => n.type === 'TEAM_INVITE_REJECTED');
  const draftWarnings = unreadNotifications.filter((n) => n.type === 'DRAFT_EXPIRY_WARNING');
  const actionableUnread = unreadNotifications.filter(
    (n) => n.type !== 'TEAM_INVITE'
      && n.type !== 'TEAM_INVITE_REJECTED'
      && n.type !== 'DRAFT_EXPIRY_WARNING'
  );

  const handleAccept = async (notification) => {
    if (!user?.id) return;
    setActionId(notification.referenceId);
    setError('');
    try {
      await acceptTeamInvite(notification.referenceId, user.id);
      loadNotifications();
      onUpdated?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept invitation.');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (notification) => {
    if (!user?.id) return;
    setActionId(notification.referenceId);
    setError('');
    try {
      await rejectTeamInvite(notification.referenceId, user.id);
      loadNotifications();
      onUpdated?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject invitation.');
    } finally {
      setActionId(null);
    }
  };

  const handleDraftWarning = async (notification) => {
    if (!user?.id) return;
    setActionId(notification.id);
    setError('');
    try {
      await markNotificationRead(notification.id, user.id);
      onClose();
      onUpdated?.();
      const role = (getAccountRole() || user.role || '').toUpperCase();
      if (role === 'ORGANIZER' && notification.referenceId) {
        navigate(`/organizer/create-programme/${notification.referenceId}`);
      } else {
        navigate('/organizer/programmes');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to open this draft.');
    } finally {
      setActionId(null);
    }
  };

  const handleDismiss = async (notification) => {
    if (!user?.id) return;
    setActionId(notification.id);
    setError('');
    try {
      await markNotificationRead(notification.id, user.id);
      loadNotifications();
      onUpdated?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update notification.');
    } finally {
      setActionId(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user?.id || unreadNotifications.length === 0) return;
    setActionId('all');
    setError('');
    try {
      await markAllNotificationsRead(user.id);
      loadNotifications();
      onUpdated?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to mark notifications as read.');
    } finally {
      setActionId(null);
    }
  };

  const renderNotificationCard = (notification, { showDismiss = false, children } = {}) => (
    <Box
      key={notification.id}
      sx={{
        p: 2,
        borderRadius: '12px',
        border: notification.isRead
          ? '1px solid rgba(148, 163, 184, 0.25)'
          : '1px solid rgba(37,99,235,0.15)',
        bgcolor: notification.isRead ? '#fff' : '#f8fafc',
        opacity: notification.isRead ? 0.85 : 1,
      }}
    >
      <Typography sx={{ fontWeight: 800, mb: 0.5 }}>{notification.title}</Typography>
      <Typography sx={{ color: '#475569', fontSize: '0.85rem', mb: children || showDismiss ? 1.5 : 0, whiteSpace: 'pre-line' }}>
        {notification.message}
      </Typography>
      {children}
      {showDismiss && (
        <Button
          size="small"
          variant="text"
          disabled={actionId === notification.id}
          onClick={() => handleDismiss(notification)}
        >
          Dismiss
        </Button>
      )}
    </Box>
  );

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}>
      <Box sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>Notifications</Typography>
          <IconButton onClick={onClose} aria-label="Close notifications">
            <CloseIcon />
          </IconButton>
        </Stack>

        {unreadNotifications.length > 0 && (
          <Button
            size="small"
            variant="outlined"
            sx={{ alignSelf: 'flex-start', mb: 2 }}
            disabled={actionId === 'all'}
            onClick={handleMarkAllRead}
          >
            Mark all as read
          </Button>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : notifications.length === 0 ? (
          <Typography sx={{ color: '#64748b', py: 4, textAlign: 'center' }}>
            No notifications yet.
          </Typography>
        ) : (
          <Stack spacing={2} sx={{ overflowY: 'auto' }}>
            {draftWarnings.map((notification) => renderNotificationCard(notification, {
              children: (
                <Button
                  size="small"
                  variant="contained"
                  color="warning"
                  disabled={actionId === notification.id}
                  onClick={() => handleDraftWarning(notification)}
                >
                  Continue draft
                </Button>
              ),
            }))}

            {teamInvites.map((notification) => renderNotificationCard(notification, {
              children: (
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={actionId === notification.referenceId}
                    onClick={() => handleAccept(notification)}
                  >
                    Accept
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    disabled={actionId === notification.referenceId}
                    onClick={() => handleReject(notification)}
                  >
                    Reject
                  </Button>
                </Stack>
              ),
            }))}

            {teamRejections.map((notification) => renderNotificationCard(notification, {
              showDismiss: true,
            }))}

            {actionableUnread.map((notification) => renderNotificationCard(notification, {
              showDismiss: true,
            }))}

            {readNotifications.length > 0 && (
              <>
                <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#94a3b8', pt: 1 }}>
                  Earlier
                </Typography>
                {readNotifications.map((notification) => renderNotificationCard(notification))}
              </>
            )}
          </Stack>
        )}
      </Box>
    </Drawer>
  );
};

export default StudentNotifications;
