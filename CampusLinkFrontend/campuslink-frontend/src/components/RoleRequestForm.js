import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Snackbar,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Stack,
} from '@mui/material';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import StudentLayout from './Student/layout/StudentLayout';
import PageHeader from './Student/ui/PageHeader';
import {
  portalBodyTextSx,
  portalInfoBoxSx,
  portalStepTitleSx,
} from './Student/ui/portalFilterStyles';
import SectionCard from './Student/ui/SectionCard';
import StatusBadge from './Student/ui/StatusBadge';
import EmptyState from './Student/ui/EmptyState';
import { useStoredUser } from '../hooks/useStoredUser';
import {
  downloadClubOrganizerFormPdf,
  fetchMyRoleRequests,
  fileUrl,
  isPersonalizedOrganizerFormUrl,
  openClubOrganizerFormPdf,
  submitRoleRequest,
} from '../services/roleRequestApi';
import { syncStoredUserFromServer } from '../utils/syncStoredUserFromServer';
import { getDefaultPortal, getPortalDashboardPath } from '../utils/portalContext';
import { useNavigate } from 'react-router-dom';

const WORKFLOW_STEPS = ['Submit Request', 'HEPA Review', 'Approval / Rejection', 'Role Activated'];
const MPP_MAX_DOCUMENTS = 3;

const MPP_DOCUMENT_EXAMPLES = [
  'MPP Endorsement Letter',
  'MPP Appointment Letter',
  'MPP Appointment Certificate',
];

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getActiveStep(status, userRole, requestedRole) {
  if (status === 'PENDING_HEPA_APPROVAL') return 1;
  if (status === 'REJECTED') return 2;
  if (status === 'APPROVED') {
    const granted = (userRole || '').toUpperCase();
    const wanted = (requestedRole || '').toUpperCase();
    if (granted === wanted) return WORKFLOW_STEPS.length;
    return 3;
  }
  return 0;
}

function hasActivatedRole(userRole, requestedRole) {
  return (userRole || '').toUpperCase() === (requestedRole || '').toUpperCase();
}

function formatRoleLabel(role) {
  if (!role) return '—';
  const upper = role.toUpperCase();
  if (upper === 'ORGANIZER') return 'Club Secretary (Organizer)';
  if (upper === 'MPP') return 'MPP Reviewer';
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function DocumentLinks({ request, userId, onError }) {
  const docs = request.documents?.length
    ? request.documents
    : request.documentUrl
      ? [{ name: request.documentName, url: request.documentUrl }]
      : [];

  const allDocs = docs;

  if (allDocs.length === 0) return '—';

  const handleOpen = async (doc) => {
    try {
      if (isPersonalizedOrganizerFormUrl(doc.url)) {
        await openClubOrganizerFormPdf({
          requestId: request.id,
          userId,
          filename: doc.name || 'Club_Organizer_Approval_Form.pdf',
        });
        return;
      }
      window.open(fileUrl(doc.url), '_blank', 'noopener,noreferrer');
    } catch {
      onError?.('Unable to open this document.');
    }
  };

  return (
    <Stack spacing={0.5}>
      {allDocs.map((doc, index) => (
        <Link
          key={`${doc.url || doc.name}-${index}`}
          component="button"
          type="button"
          onClick={() => handleOpen(doc)}
          sx={{ fontSize: '0.85rem', textAlign: 'left' }}
        >
          {doc.name || `Document ${index + 1}`}
        </Link>
      ))}
    </Stack>
  );
}

const RoleRequestForm = () => {
  const { user, refresh } = useStoredUser();
  const navigate = useNavigate();
  const [requestedRole, setRequestedRole] = useState('ORGANIZER');
  const [clubName, setClubName] = useState('');
  const [reason, setReason] = useState('');
  const [documentFiles, setDocumentFiles] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const isStudent = (user.role || 'STUDENT').toUpperCase() === 'STUDENT';
  const pendingRequest = useMemo(
    () => requests.find((r) => r.status === 'PENDING_HEPA_APPROVAL') || null,
    [requests]
  );
  const hasPendingRequest = Boolean(pendingRequest);

  const latestRequest = requests[0] || null;
  const maxDocuments = requestedRole === 'MPP' ? MPP_MAX_DOCUMENTS : 1;

  const showSnackbar = useCallback((message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleDownloadOrganizerForm = useCallback(async () => {
    if (!user?.id) {
      showSnackbar('Please log in to download the approval form.', 'error');
      return;
    }
    if (!clubName.trim()) {
      showSnackbar('Enter your club name first so it appears on the form.', 'warning');
      return;
    }
    try {
      await downloadClubOrganizerFormPdf({
        userId: user.id,
        clubName: clubName.trim(),
      });
    } catch {
      showSnackbar('Unable to download the approval form.', 'error');
    }
  }, [clubName, showSnackbar, user?.id]);

  const loadRequests = useCallback(async () => {
    if (!user.id) {
      setLoading(false);
      setRequests([]);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchMyRoleRequests(user.id);
      setRequests(data);
    } catch {
      // History is optional on first visit — show empty state without alarming the user.
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    if (!user?.id) return undefined;
    let cancelled = false;

    syncStoredUserFromServer(user.id)
      .then(({ roleChanged, user: synced }) => {
        if (cancelled) return;
        refresh();
        if (roleChanged) {
          navigate(getPortalDashboardPath(getDefaultPortal(synced.role)), { replace: true });
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [user?.id, navigate, refresh]);

  const handleFileChange = (event) => {
    const selected = Array.from(event.target.files || []);
    event.target.value = '';
    if (selected.length === 0) return;

    setDocumentFiles((prev) => {
      const merged = [...prev, ...selected];
      if (merged.length > maxDocuments) {
        showSnackbar(
          requestedRole === 'MPP'
            ? `You can upload up to ${MPP_MAX_DOCUMENTS} supporting documents for MPP requests.`
            : 'Organizer requests require one signed approval form only.',
          'warning'
        );
        return merged.slice(0, maxDocuments);
      }
      return merged;
    });
  };

  const removeDocument = (index) => {
    setDocumentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user.id) {
      showSnackbar('Please log in to submit a role request.', 'error');
      return;
    }
    if (!isStudent) {
      showSnackbar('Only students can submit role upgrade requests.', 'error');
      return;
    }
    if (documentFiles.length === 0) {
      showSnackbar(
        requestedRole === 'ORGANIZER'
          ? 'Please upload your signed UMT Club Organizer Approval Form.'
          : 'Please upload at least one supporting document for your MPP request.',
        'warning'
      );
      return;
    }

    if (requestedRole === 'ORGANIZER' && !clubName.trim()) {
      showSnackbar('Please enter the official club name you are applying to represent.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await submitRoleRequest({
        userId: user.id,
        requestedRole,
        reason,
        clubName: requestedRole === 'ORGANIZER' ? clubName.trim() : undefined,
        documents: documentFiles,
      });
      setReason('');
      setClubName('');
      setDocumentFiles([]);
      showSnackbar('Your role request has been submitted. HEPA will review it within 5–7 working days.', 'success');
      await loadRequests();
    } catch (err) {
      const message = err.response?.data?.message
        || (err.response?.status === 404
          ? 'Role request service is unavailable. Please ensure the backend server has been restarted.'
          : 'Failed to submit role request. Please try again.');
      showSnackbar(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const organizerInstructions = (
    <Stack spacing={1.5}>
      <Box className="portal-info-panel" sx={portalInfoBoxSx}>
        <Typography className="portal-step-title" sx={{ ...portalStepTitleSx, mb: 1 }}>Step 1 — Download approval form</Typography>
        <Typography className="portal-step-body" sx={{ ...portalBodyTextSx, fontSize: '0.85rem', mb: 1.5 }}>
          Download the official UMT Club Organizer Approval Form and complete all applicant and club sections.
        </Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadOutlinedIcon />}
          onClick={handleDownloadOrganizerForm}
          sx={{ borderRadius: '10px' }}
        >
          Download Approval Form
        </Button>
      </Box>
      <Box className="portal-info-panel" sx={portalInfoBoxSx}>
        <Typography className="portal-step-title" sx={{ ...portalStepTitleSx, mb: 1 }}>Step 2 — Complete & obtain signature</Typography>
        <Typography className="portal-step-body" sx={portalBodyTextSx}>
          Complete applicant details and club information, then obtain your Club Advisor&apos;s signature before uploading.
        </Typography>
      </Box>
      <Box className="portal-info-panel" sx={portalInfoBoxSx}>
        <Typography className="portal-step-title" sx={{ ...portalStepTitleSx, mb: 1 }}>Step 3 — Upload signed form</Typography>
        <Typography className="portal-step-body" sx={portalBodyTextSx}>
          Upload the completed and signed form (PDF). Status will be set to Pending HEPA Approval upon submission.
        </Typography>
      </Box>
      <Box className="portal-info-panel" sx={portalInfoBoxSx}>
        <Typography className="portal-step-title" sx={{ ...portalStepTitleSx, mb: 1 }}>Step 4 — HEPA decision</Typography>
        <Typography className="portal-step-body" sx={portalBodyTextSx}>
          HEPA reviews your advisor-signed form in CampusLink+ and approves or rejects directly in the system. You will be notified once a decision is made.
        </Typography>
      </Box>
    </Stack>
  );

  const mppInstructions = (
    <Stack spacing={1.5}>
      <Box className="portal-info-panel" sx={portalInfoBoxSx}>
        <Typography className="portal-step-title" sx={{ ...portalStepTitleSx, mb: 1 }}>Supporting document examples</Typography>
        <Typography className="portal-step-body" sx={{ ...portalBodyTextSx, mb: 1 }}>
          Upload any relevant MPP supporting documents (not limited to the examples below). You may attach up to {MPP_MAX_DOCUMENTS} files.
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2.5, color: '#334155', fontSize: '0.85rem' }}>
          {MPP_DOCUMENT_EXAMPLES.map((item) => (
            <li key={item}>{item} (example)</li>
          ))}
        </Box>
      </Box>
      <Box className="portal-info-panel" sx={portalInfoBoxSx}>
        <Typography className="portal-step-title" sx={{ ...portalStepTitleSx, mb: 1 }}>Review timeline</Typography>
        <Typography className="portal-step-body" sx={portalBodyTextSx}>
          HEPA will review your MPP role request within 5–7 working days. You will be notified once a decision is made.
        </Typography>
      </Box>
    </Stack>
  );

  return (
    <StudentLayout>
      <PageHeader
        title="Request Role"
        subtitle="Apply to become a club secretary (Organizer) or MPP reviewer through the official UMT approval process."
      />

      <SectionCard title="Application Process" subtitle="Estimated review time: 5–7 working days" sx={{ mb: 3 }}>
        <Stepper
          activeStep={latestRequest ? getActiveStep(latestRequest.status, user.role, latestRequest.requestedRole) : 0}
          alternativeLabel
          sx={{ mb: 1 }}
        >
          {WORKFLOW_STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {latestRequest && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <StatusBadge status={latestRequest.status} variant="roleRequest" />
          </Box>
        )}
        {latestRequest?.status === 'APPROVED' && !hasActivatedRole(user.role, latestRequest.requestedRole) && (
          <Alert severity="info" sx={{ mt: 2, borderRadius: '10px' }}>
            Your {formatRoleLabel(latestRequest.requestedRole)} request was approved.
            Your account is being updated — you will be redirected to your new portal shortly.
            If nothing happens, sign out and sign in again.
          </Alert>
        )}
        {latestRequest?.status === 'APPROVED' && hasActivatedRole(user.role, latestRequest.requestedRole) && (
          <Alert severity="success" sx={{ mt: 2, borderRadius: '10px' }}>
            Your {formatRoleLabel(latestRequest.requestedRole)} role is active.
            Use the portal switcher in the header to open your {formatRoleLabel(latestRequest.requestedRole)} dashboard,
            or visit it directly after signing in.
          </Alert>
        )}
      </SectionCard>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <SectionCard
            title={requestedRole === 'ORGANIZER' ? 'Club Secretary Application' : 'MPP Role Request'}
            subtitle={isStudent ? 'Enter your club name as shown on the approval form. Each club may only have one approved secretary.' : 'Role requests are for student accounts only'}
          >
            {!isStudent ? (
              <Alert severity="info" sx={{ borderRadius: '10px' }}>
                Your current role is {formatRoleLabel(user.role)}. Only students may apply for Organizer or MPP access.
              </Alert>
            ) : hasPendingRequest ? (
              <Alert severity="warning" sx={{ borderRadius: '10px' }}>
                You have a pending <strong>{formatRoleLabel(pendingRequest.requestedRole)}</strong> request under HEPA review
                {pendingRequest.clubName ? ` for ${pendingRequest.clubName}` : ''}.
                Please wait for a decision before submitting another application.
              </Alert>
            ) : (
              <Box component="form" onSubmit={handleSubmit}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="requested-role-label">Requested Role</InputLabel>
                  <Select
                    labelId="requested-role-label"
                    value={requestedRole}
                    label="Requested Role"
                    onChange={(e) => {
                      setRequestedRole(e.target.value);
                      setDocumentFiles([]);
                      setClubName('');
                    }}
                  >
                    <MenuItem value="ORGANIZER">Club Secretary (Organizer)</MenuItem>
                    <MenuItem value="MPP">MPP</MenuItem>
                  </Select>
                </FormControl>

                {requestedRole === 'ORGANIZER' && (
                  <TextField
                    fullWidth
                    label="Club Name"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    sx={{ mb: 2 }}
                    placeholder="e.g. Persatuan Mahasiswa FSKM"
                    helperText="Use the exact official club name from your signed approval form. Only one secretary is allowed per club."
                  />
                )}

                {requestedRole === 'ORGANIZER' && (
                  <Box sx={{ mb: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadOutlinedIcon />}
                      onClick={handleDownloadOrganizerForm}
                      sx={{ mb: 2, borderRadius: '10px' }}
                    >
                      Download Approval Form
                    </Button>
                  </Box>
                )}

                <TextField
                  fullWidth
                  label="Additional notes (optional)"
                  multiline
                  minRows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  sx={{ mb: 2 }}
                  placeholder={requestedRole === 'ORGANIZER'
                    ? 'e.g. Robotics Club President, Faculty of Computer Science'
                    : 'e.g. Faculty MPP representative for FSKM'}
                />

                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<UploadFileOutlinedIcon />}
                  sx={{ mb: 1, borderRadius: '10px' }}
                >
                  {requestedRole === 'ORGANIZER' ? 'Upload Signed Form' : 'Upload Supporting Documents'}
                  <input
                    hidden
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    type="file"
                    multiple={requestedRole === 'MPP'}
                    onChange={handleFileChange}
                  />
                </Button>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 1, fontSize: '0.8rem' }}>
                  {requestedRole === 'MPP'
                    ? `${documentFiles.length} of ${MPP_MAX_DOCUMENTS} documents selected.`
                    : documentFiles.length > 0
                      ? documentFiles[0].name
                      : 'No document selected yet.'}
                </Typography>

                {documentFiles.length > 0 && (
                  <Stack spacing={0.75} sx={{ mb: 2 }}>
                    {documentFiles.map((file, index) => (
                      <Box
                        key={`${file.name}-${index}`}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          px: 1.5,
                          py: 1,
                          borderRadius: '8px',
                          bgcolor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <Typography sx={{ fontSize: '0.8rem', color: '#475569', pr: 1 }}>{file.name}</Typography>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<CloseIcon />}
                          onClick={() => removeDocument(index)}
                        >
                          Remove
                        </Button>
                      </Box>
                    ))}
                  </Stack>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<HowToRegOutlinedIcon />}
                  disabled={submitting}
                  sx={{ borderRadius: '10px' }}
                >
                  {submitting ? 'Submitting…' : 'Submit Request'}
                </Button>
              </Box>
            )}
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <SectionCard title="Instructions" subtitle="What you need to prepare">
            {requestedRole === 'ORGANIZER' ? organizerInstructions : mppInstructions}
            <Box className="portal-info-panel" sx={{ ...portalInfoBoxSx, mt: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <InfoOutlinedIcon sx={{ fontSize: 18, color: '#2563eb' }} />
                <Typography className="portal-step-title" sx={portalStepTitleSx}>After approval</Typography>
              </Box>
              <Typography className="portal-step-body" sx={{ ...portalBodyTextSx, pl: 3.25 }}>
                Once HEPA approves your request, your account role will be updated automatically.
              </Typography>
            </Box>
          </SectionCard>
        </Grid>
      </Grid>

      <SectionCard title="Request History" subtitle="Track submitted applications and HEPA decisions" noPadding>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : requests.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <EmptyState
              title="No requests yet"
              description="Submit a role request above to apply for Organizer or MPP access."
              icon={HowToRegOutlinedIcon}
            />
          </Box>
        ) : (
          <TableContainer className="portal-table">
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Requested Role</TableCell>
                  <TableCell>Submitted Date</TableCell>
                  <TableCell>Current Status</TableCell>
                  <TableCell>Review Notes</TableCell>
                  <TableCell>Documents</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{formatRoleLabel(request.requestedRole)}</TableCell>
                    <TableCell sx={{ color: '#64748b', fontSize: '0.85rem' }}>{formatDate(request.submittedAt)}</TableCell>
                    <TableCell><StatusBadge status={request.status} variant="roleRequest" /></TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: '#64748b', maxWidth: 220 }}>
                      {request.reviewNotes || '—'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>
                      <DocumentLinks request={request} userId={user.id} onError={(message) => showSnackbar(message, 'error')} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SectionCard>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </StudentLayout>
  );
};

export default RoleRequestForm;
