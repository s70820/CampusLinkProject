import React, { useEffect, useMemo, useState } from 'react';
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
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DocumentCard from './DocumentCard';
import ProgrammeFormPreviewDialog from './ProgrammeFormPreviewDialog';
import { getProgrammeFull } from '../../services/programmeWorkflowApi';
import { ReviewField, ReviewSection } from './ReviewField';
import {
  SDG_LABELS,
  formatDateTimeRange,
  formatMeritBreakdown,
  getProgrammeReviewDocumentGroups,
  groupCommitteeMembers,
} from '../../utils/programmeReviewDisplay';
import { formatMeritRoleType, getMeritLevelLabel } from '../../utils/meritRulesDisplay';
import { downloadProgrammeFormPreview } from '../../utils/programmeFormPreview';

function CommitteeTable({ title, members, extraColumn }) {
  if (!members?.length) return null;
  return (
    <Box sx={{ mb: 2 }}>
      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', mb: 1 }}>{title}</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Matric</TableCell>
            <TableCell>Faculty</TableCell>
            {extraColumn && <TableCell>{extraColumn}</TableCell>}
            <TableCell align="right">Merit Pts</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {members.map((m) => (
            <TableRow key={m.id || `${m.matricNumber}-${m.committeeRole}`}>
              <TableCell sx={{ fontWeight: 600 }}>{m.fullName}</TableCell>
              <TableCell>{m.matricNumber}</TableCell>
              <TableCell>{m.faculty}</TableCell>
              {extraColumn && (
                <TableCell>{m.positionLabel || m.contributionDescription || m.role || '—'}</TableCell>
              )}
              <TableCell align="right">{m.meritPoints ?? '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

function ProgrammeReviewDialog({
  open,
  programme,
  reviewMode = 'mpp',
  readOnly = false,
  remarks,
  onRemarksChange,
  onClose,
  onApprove,
  onReject,
  actionLoading = false,
}) {
  const [fullDetails, setFullDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formAction, setFormAction] = useState('');
  const [formError, setFormError] = useState('');
  const [formPreviewOpen, setFormPreviewOpen] = useState(false);

  useEffect(() => {
    if (!open || !programme?.id) {
      setFullDetails(null);
      setError('');
      setFormError('');
      setFormAction('');
      setFormPreviewOpen(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    getProgrammeFull(programme.id)
      .then((response) => {
        if (!cancelled) setFullDetails(response.data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Unable to load full programme details.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [open, programme?.id]);

  const prog = fullDetails?.programme || programme;
  const committee = useMemo(() => groupCommitteeMembers(fullDetails?.committee || []), [fullDetails]);
  const sdgs = useMemo(
    () => (fullDetails?.sdgs || []).map((s) => SDG_LABELS[s.sdgNumber] || `SDG ${s.sdgNumber}`),
    [fullDetails]
  );
  const documentGroups = useMemo(
    () => getProgrammeReviewDocumentGroups(fullDetails, prog),
    [fullDetails, prog]
  );
  const meritBreakdown = useMemo(() => formatMeritBreakdown(fullDetails?.meritPreview), [fullDetails]);
  const advisor = fullDetails?.advisorApproval;

  const remarksLabel = reviewMode === 'hepa' ? 'HEPA Remarks' : 'MPP Remarks';
  const approveLabel = reviewMode === 'hepa' ? 'Approve & Publish' : 'Approve';
  const organizerName = programme?.organizerName || prog?.organizer?.fullName || '';

  const handleOpenGeneratedForm = () => {
    setFormError('');
    setFormPreviewOpen(true);
  };

  const handleDownloadGeneratedForm = async () => {
    if (!fullDetails) return;
    setFormError('');
    setFormAction('download');
    try {
      await downloadProgrammeFormPreview(fullDetails, organizerName);
    } catch (err) {
      setFormError(err.message || 'Unable to download the programme form. Please try again.');
    } finally {
      setFormAction('');
    }
  };

  return (
    <>
    <Dialog
      open={open}
      onClose={() => !actionLoading && onClose()}
      maxWidth="lg"
      fullWidth
      scroll="paper"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
        {readOnly
          ? `Programme Record: ${prog?.title || 'Programme'}`
          : `${reviewMode === 'hepa' ? 'HEPA Review' : 'MPP Review'}: ${prog?.title || 'Programme'}`}
      </DialogTitle>
      <DialogContent dividers sx={{ bgcolor: '#f8fafc' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={1}>
            {error && <Alert severity="warning">{error}</Alert>}

            <ReviewSection title="Programme Information">
              <Grid container spacing={2}>
                <ReviewField label="Programme / Activity Name" value={prog?.title} xs={12} />
                <ReviewField label="Club / Association" value={prog?.organizerClub} />
                <ReviewField label="Organizer" value={prog?.organizer?.fullName || programme?.organizerName} />
                <ReviewField label="Category" value={prog?.category} />
                <ReviewField label="Programme Level" value={getMeritLevelLabel(prog?.programmeLevel) || prog?.programmeLevel} />
                <ReviewField label="Programme Type" value={prog?.programmeType} />
                <ReviewField label="Venue" value={prog?.venue} />
                <ReviewField label="Programme Date / Time" value={formatDateTimeRange(prog)} />
                <ReviewField label="Registration Opens" value={prog?.registrationOpenDate} />
                <ReviewField label="Registration Closes" value={prog?.registrationCloseDate} />
                <ReviewField label="Expected Participants" value={prog?.expectedParticipants} />
                <ReviewField label="Collaborating Organization" value={prog?.collaboratingOrganization} />
                <ReviewField label="Sponsorship Info" value={prog?.sponsorshipInfo} xs={12} />
              </Grid>
            </ReviewSection>

            <ReviewSection title="Programme Description">
              <Grid container spacing={2}>
                <ReviewField label="Description" value={prog?.description} xs={12} />
                <ReviewField label="Objectives" value={prog?.objectives} xs={12} />
                <ReviewField label="Expected Outcomes" value={prog?.expectedOutcomes} xs={12} />
              </Grid>
            </ReviewSection>

            <ReviewSection title="Registration Settings">
              <Grid container spacing={2}>
                <ReviewField label="Paid Programme" value={prog?.isPaid ? 'Yes' : 'No'} />
                <ReviewField label="Registration Fee (RM)" value={prog?.isPaid ? prog?.registrationFee : '—'} />
                <ReviewField label="Team Programme" value={prog?.isTeamProgramme ? 'Yes' : 'No'} />
                <ReviewField
                  label="Team Size"
                  value={prog?.isTeamProgramme ? `${prog?.minTeamSize || '—'} – ${prog?.maxTeamSize || '—'}` : '—'}
                />
                <ReviewField label="Payment Instructions" value={prog?.paymentInstructions} xs={12} />
                <ReviewField label="Payment Reference Format" value={prog?.paymentReferenceFormat} xs={12} />
                <ReviewField label="Google Maps Link" value={prog?.googleMapsLink} xs={12} />
                <ReviewField label="Communication Link" value={prog?.communicationLink} xs={12} />
              </Grid>
            </ReviewSection>

            <ReviewSection title="Committee & Merit (MyStar)">
              <CommitteeTable title="Programme Director" members={committee.director} />
              <CommitteeTable title="Program Management Team (MT)" members={committee.mt} extraColumn="Position" />
              <CommitteeTable title="Program Committee Members (AJK)" members={committee.ajk} extraColumn="Role" />
              <CommitteeTable title="Special Contribution" members={committee.special} extraColumn="Contribution" />
              {!committee.director.length && !committee.mt.length && !committee.ajk.length && !committee.special.length && (
                <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>No committee data submitted.</Typography>
              )}
              {meritBreakdown.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', mb: 1 }}>Merit Point Preview</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Role / Position</TableCell>
                        <TableCell>Matric</TableCell>
                        <TableCell align="right">Points</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {meritBreakdown.map((row, i) => (
                        <TableRow key={`${row.matric}-${i}`}>
                          <TableCell>{row.label}</TableCell>
                          <TableCell>{row.matric}</TableCell>
                          <TableCell align="right">{row.points}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={2} sx={{ fontWeight: 800 }}>Total Committee Merit</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800 }}>
                          {fullDetails?.meritPreview?.totalMerit ?? '—'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>
              )}
              {fullDetails?.meritPreview?.rules && (
                <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {Object.entries(fullDetails.meritPreview.rules).map(([role, pts]) => (
                    <Chip
                      key={role}
                      size="small"
                      label={`${formatMeritRoleType(role)}: ${pts} pts`}
                      sx={{ fontWeight: 600 }}
                    />
                  ))}
                </Box>
              )}
            </ReviewSection>

            <ReviewSection title="Sustainable Development Goals (SDG)">
              {sdgs.length ? (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {sdgs.map((label) => (
                    <Chip key={label} label={label} size="small" color="primary" variant="outlined" />
                  ))}
                </Box>
              ) : (
                <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>No SDGs selected.</Typography>
              )}
            </ReviewSection>

            <ReviewSection title="Club Advisor Verification">
              <Grid container spacing={2}>
                <ReviewField label="Advisor Name" value={advisor?.advisorName} />
                <ReviewField label="Advisor Email" value={advisor?.advisorEmail} />
                <ReviewField label="Approval Method" value={advisor?.approvalMethod} />
                <ReviewField label="Approval Status" value={advisor?.status} />
                <ReviewField label="Advisor Remarks" value={advisor?.remarks} xs={12} />
              </Grid>
            </ReviewSection>

            {(readOnly || reviewMode === 'hepa') && prog?.mppRemarks && (
              <ReviewSection title="MPP Review Notes">
                <Typography sx={{ fontWeight: 600, whiteSpace: 'pre-wrap' }}>{prog.mppRemarks}</Typography>
              </ReviewSection>
            )}

            {readOnly && prog?.hepaRemarks && (
              <ReviewSection title="HEPA Review Notes">
                <Typography sx={{ fontWeight: 600, whiteSpace: 'pre-wrap' }}>{prog.hepaRemarks}</Typography>
              </ReviewSection>
            )}

            <ReviewSection title="Advisor-Signed Programme Form">
              {documentGroups.advisorSigned.length ? (
                <Stack spacing={1.5}>
                  {documentGroups.advisorSigned.map((doc) => (
                    <DocumentCard
                      key={`${doc.type}-${doc.name}-${doc.url || 'generated'}`}
                      displayLabel={doc.label}
                      fileName={doc.name}
                      description={doc.description}
                      viewUrl={doc.url}
                      accent="success"
                      onView={doc.isGenerated ? handleOpenGeneratedForm : undefined}
                      onDownload={doc.isGenerated ? handleDownloadGeneratedForm : undefined}
                      downloadLoading={doc.isGenerated && formAction === 'download'}
                    />
                  ))}
                  {formError && (
                    <Alert severity="error">{formError}</Alert>
                  )}
                </Stack>
              ) : (
                <Alert severity="warning">
                  No advisor-signed programme form is available for this programme yet.
                </Alert>
              )}
            </ReviewSection>

            <ReviewSection title="Additional Supporting Documents">
              {documentGroups.additionalSupporting.length ? (
                <Stack spacing={1.5}>
                  {documentGroups.additionalSupporting.map((doc, index) => (
                    <DocumentCard
                      key={doc.id || `${doc.type}-${doc.url}`}
                      index={index + 1}
                      displayLabel={doc.label}
                      fileName={doc.name}
                      description={doc.description}
                      viewUrl={doc.url}
                    />
                  ))}
                </Stack>
              ) : (
                <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>
                  No optional supporting documents were attached.
                </Typography>
              )}
            </ReviewSection>

            {documentGroups.referenceMaterials.length > 0 && (
              <ReviewSection title="Reference Materials">
                <Stack spacing={1.5}>
                  {documentGroups.referenceMaterials.map((doc, index) => (
                    <DocumentCard
                      key={`${doc.type}-${doc.url}`}
                      index={index + 1}
                      displayLabel={doc.label}
                      fileName={doc.name}
                      description={doc.description}
                      viewUrl={doc.url}
                    />
                  ))}
                </Stack>
              </ReviewSection>
            )}

            {!readOnly && (
              <ReviewSection title={reviewMode === 'hepa' ? 'HEPA Office Review' : 'MPP Review Decision'}>
                <TextField
                  label={remarksLabel}
                  placeholder="Add review comments (recommended for rejection)"
                  value={remarks}
                  onChange={(e) => onRemarksChange(e.target.value)}
                  multiline
                  minRows={3}
                  fullWidth
                />
              </ReviewSection>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={actionLoading && !readOnly}>
          {readOnly ? 'Close' : 'Cancel'}
        </Button>
        {!readOnly && (
          <>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={onReject}
              disabled={actionLoading || loading}
            >
              Reject
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={onApprove}
              disabled={actionLoading || loading}
            >
              {actionLoading ? 'Processing...' : approveLabel}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>

    <ProgrammeFormPreviewDialog
      open={formPreviewOpen}
      onClose={() => setFormPreviewOpen(false)}
      fullDetails={fullDetails}
      organizerName={organizerName}
      programmeTitle={prog?.title}
    />
    </>
  );
}

export default ProgrammeReviewDialog;
