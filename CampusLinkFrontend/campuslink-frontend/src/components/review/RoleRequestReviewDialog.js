import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import UndoIcon from '@mui/icons-material/Undo';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { prepareRoleRequestDocuments } from '../../utils/roleRequestDocuments';
import { openClubOrganizerFormPdf, downloadClubOrganizerFormPdf } from '../../services/roleRequestApi';
import { ReviewField, ReviewSection } from './ReviewField';
import DocumentCard from './DocumentCard';
import StatusBadge from '../Student/ui/StatusBadge';

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

function RoleRequestReviewDialog({
  open,
  request,
  viewerUserId,
  onClose,
  onApprove,
  onReject,
  onRevoke,
  actionLoading = false,
}) {
  const [reviewNotes, setReviewNotes] = useState('');
  const [localError, setLocalError] = useState('');
  const [docActionId, setDocActionId] = useState(null);

  const documents = useMemo(
    () => prepareRoleRequestDocuments(
      getRequestDocuments(request),
      request?.requestedRole,
      { id: request?.id, userId: viewerUserId || request?.userId }
    ),
    [request, viewerUserId]
  );
  const isPending = request?.status === 'PENDING_HEPA_APPROVAL';
  const isApproved = request?.status === 'APPROVED';
  const isOrganizer = request?.requestedRole === 'ORGANIZER';

  const handleReject = () => {
    if (!reviewNotes.trim()) {
      setLocalError('Review notes are required when rejecting a request.');
      return;
    }
    setLocalError('');
    onReject(reviewNotes.trim());
  };

  const handleApprove = () => {
    setLocalError('');
    onApprove(reviewNotes.trim() || 'Approved by HEPA.');
  };

  const handleOrganizerDocAction = async (doc, mode) => {
    const actorId = viewerUserId || request?.userId;
    if (!actorId || !request?.id) return;
    setDocActionId(`${doc.key}-${mode}`);
    setLocalError('');
    try {
      const payload = {
        requestId: request.id,
        userId: actorId,
        filename: doc.name || 'Club_Organizer_Approval_Form.pdf',
      };
      if (mode === 'download') {
        await downloadClubOrganizerFormPdf(payload);
      } else {
        await openClubOrganizerFormPdf(payload);
      }
    } catch {
      setLocalError('Unable to open this document.');
    } finally {
      setDocActionId(null);
    }
  };

  const handleRevoke = () => {
    if (!reviewNotes.trim()) {
      setLocalError('Revocation reason is required when removing an approved role.');
      return;
    }
    setLocalError('');
    onRevoke(reviewNotes.trim());
  };

  const handleClose = () => {
    setReviewNotes('');
    setLocalError('');
    onClose();
  };

  if (!request) return null;

  return (
    <Dialog
      open={open}
      onClose={() => !actionLoading && handleClose()}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{ sx: { borderRadius: 3 } }}
      onTransitionExited={() => {
        setReviewNotes('');
        setLocalError('');
      }}
    >
      <DialogTitle sx={{ fontWeight: 800 }}>
        Role Request Review — {formatRoleLabel(request.requestedRole)} Role
      </DialogTitle>
      <DialogContent dividers sx={{ bgcolor: '#f8fafc' }}>
        <Stack spacing={1}>
          {localError && <Alert severity="error">{localError}</Alert>}

          {isPending && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              Approving this request will upgrade <strong>{request.requesterName}</strong> to{' '}
              <strong>{formatRoleLabel(request.requestedRole)}</strong>. Reject if the requested role does not match your decision.
            </Alert>
          )}

          {isApproved && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              This request was approved and <strong>{request.requesterName}</strong> currently holds the{' '}
              <strong>{formatRoleLabel(request.requestedRole)}</strong> role. Revoking will demote them back to{' '}
              <strong>Student</strong> and free the club secretary slot if applicable.
            </Alert>
          )}

          <ReviewSection title="Applicant Information">
            <Grid container spacing={2}>
              <ReviewField label="Full Name" value={request.requesterName} />
              <ReviewField label="Matric Number" value={request.requesterMatric} />
              <ReviewField label="Current Role" value={formatRoleLabel(request.currentRole)} />
              <ReviewField label="Requested Role" value={formatRoleLabel(request.requestedRole)} />
              {isOrganizer && (
                <ReviewField label="Club" value={request.clubName || '—'} />
              )}
              <ReviewField label="Submitted On" value={formatDate(request.submittedAt)} />
              <ReviewField label="Status" value={<StatusBadge status={request.status} variant="roleRequest" />} />
            </Grid>
          </ReviewSection>

          <ReviewSection title="Application Details">
            <Typography sx={{ color: '#64748b', fontSize: '0.8rem', mb: 0.5, fontWeight: 600 }}>
              Reason for Request
            </Typography>
            <Typography sx={{ fontWeight: 600, whiteSpace: 'pre-wrap', mb: 2 }}>
              {request.reason || '—'}
            </Typography>
            <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{ mb: 1 }}>
              {isOrganizer
                ? 'Review the advisor-signed form from the student. Approve or reject directly in CampusLink+ — no HEPA signature on the form is required.'
                : 'MPP applications may include up to 3 supporting documents (endorsement letter, appointment letter, certificate).'}
            </Alert>
          </ReviewSection>

          <ReviewSection title="Student Submitted Documents">
            {documents.length ? (
              <Stack spacing={1.5}>
                {documents.map((doc, index) => (
                  <DocumentCard
                    key={doc.key}
                    index={index + 1}
                    displayLabel={doc.displayLabel}
                    fileName={doc.name}
                    description={doc.description}
                    viewUrl={doc.viewUrl}
                    onView={doc.isPersonalizedOrganizerForm
                      ? () => handleOrganizerDocAction(doc, 'view')
                      : undefined}
                    onDownload={doc.isPersonalizedOrganizerForm
                      ? () => handleOrganizerDocAction(doc, 'download')
                      : undefined}
                    viewLoading={docActionId === `${doc.key}-view`}
                    downloadLoading={docActionId === `${doc.key}-download`}
                  />
                ))}
              </Stack>
            ) : (
              <Typography sx={{ color: '#64748b' }}>No supporting documents attached.</Typography>
            )}
          </ReviewSection>

          {request.reviewNotes && !isPending && (
            <ReviewSection title="Previous Review Notes">
              <Typography sx={{ fontWeight: 600, whiteSpace: 'pre-wrap' }}>{request.reviewNotes}</Typography>
              {request.reviewedByName && (
                <Typography sx={{ color: '#64748b', fontSize: '0.85rem', mt: 1 }}>
                  Reviewed by {request.reviewedByName} on {formatDate(request.reviewedAt)}
                </Typography>
              )}
            </ReviewSection>
          )}

          {(isPending || isApproved) && (
            <ReviewSection title={isApproved ? 'Revoke Approved Role' : 'HEPA Review Decision'}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label={isApproved ? 'Revocation Reason' : 'Review Notes'}
                placeholder={isApproved
                  ? 'Required — explain why this role is being removed (e.g. approved by mistake).'
                  : (isOrganizer
                    ? 'Required for rejection. Optional for approval.'
                    : 'Required for rejection. Optional for approval.')}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />
            </ReviewSection>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} disabled={actionLoading}>Close</Button>
        {isPending && (
          <>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={handleReject}
              disabled={actionLoading}
            >
              Reject
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={handleApprove}
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : 'Approve'}
            </Button>
          </>
        )}
        {isApproved && onRevoke && (
          <Button
            variant="contained"
            color="warning"
            startIcon={<UndoIcon />}
            onClick={handleRevoke}
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : 'Revoke Role'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default RoleRequestReviewDialog;
