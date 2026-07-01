import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import OrganizerLayout from './OrganizerLayout';
import PortalHero from './Student/ui/PortalHero';
import SectionCard from './Student/ui/SectionCard';
import EmptyState from './Student/ui/EmptyState';
import { useStoredUser } from '../hooks/useStoredUser';
import useOrganizerProgrammes from '../hooks/useOrganizerProgrammes';
import { fetchProgrammeRegistrations } from '../services/registrationApi';
import {
  fetchProgrammeAttendance,
  issueAllOrganizerCertificates,
  issueOrganizerCertificate,
} from '../services/organizerApi';
import generateParticipationCertificatePdf from '../utils/generateParticipationCertificatePdf';
import {
  formatCertificateDeadline,
  getCertificateWindowStatus,
  getDaysRemainingInCertificateWindow,
  isProgrammeEnded,
} from '../utils/certificateWindow';
import { getCertificateTemplateLabel } from '../constants/certificateTemplates';
import { isOperationalOrganizerProgramme } from '../utils/organizerProgrammeStatus';

const dedupePresentAttendees = (attendanceRows) => {
  const byUserId = new Map();
  attendanceRows
    .filter((row) => (row.attendanceStatus || '').toUpperCase() === 'PRESENT')
    .forEach((row) => {
      if (!byUserId.has(row.userId)) {
        byUserId.set(row.userId, row);
      }
    });
  return Array.from(byUserId.values());
};

const Certificates = () => {
  const { user } = useStoredUser();
  const { programmes, loading, error: programmesError } = useOrganizerProgrammes();
  const [programmeId, setProgrammeId] = useState('');
  const [participants, setParticipants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const [issuingAll, setIssuingAll] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const systemProgrammes = useMemo(
    () => programmes.filter((p) =>
      (p.certificateMode || 'SYSTEM').toUpperCase() !== 'MANUAL'
      && isOperationalOrganizerProgramme(p)),
    [programmes]
  );

  const endedProgrammes = useMemo(
    () => systemProgrammes.filter((p) => isProgrammeEnded(p)),
    [systemProgrammes]
  );

  useEffect(() => {
    if (!programmeId && endedProgrammes.length > 0) {
      setProgrammeId(String(endedProgrammes[0].id));
    }
  }, [endedProgrammes, programmeId]);

  useEffect(() => {
    if (!programmeId || !user?.id) return undefined;
    let cancelled = false;
    setLoadingAttendees(true);

    Promise.all([
      fetchProgrammeAttendance(user.id, programmeId),
      fetchProgrammeRegistrations(programmeId),
    ])
      .then(([attendance, registrations]) => {
        if (cancelled) return;
        const registrationByMatric = new Map(
          (registrations || []).map((reg) => [reg.matricNumber, reg])
        );
        const presentAttendees = dedupePresentAttendees(attendance || []).map((row) => {
          const registration = registrationByMatric.get(row.matricNumber);
          return {
            id: registration?.id || row.userId,
            registrationId: registration?.id,
            userId: row.userId,
            studentFullName: row.studentFullName,
            matricNumber: row.matricNumber,
            faculty: row.faculty,
          };
        });
        setParticipants(presentAttendees);
      })
      .catch(() => {
        if (!cancelled) setParticipants([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingAttendees(false);
      });

    return () => { cancelled = true; };
  }, [programmeId, user?.id]);

  const selectedProgramme = programmes.find((p) => String(p.id) === String(programmeId));
  const isManualCertificate = (selectedProgramme?.certificateMode || 'SYSTEM').toUpperCase() === 'MANUAL';
  const windowStatus = getCertificateWindowStatus(selectedProgramme);
  const canIssue = windowStatus === 'open' && !isManualCertificate;
  const daysRemaining = getDaysRemainingInCertificateWindow(selectedProgramme);

  const filtered = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return participants.filter((p) =>
      (p.studentFullName || '').toLowerCase().includes(query)
      || (p.matricNumber || '').toLowerCase().includes(query)
    );
  }, [participants, searchQuery]);

  const showMessage = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const issueAndDownload = async (participant, { quiet = false } = {}) => {
    if (!user?.id || !selectedProgramme || !canIssue || !participant.registrationId) return;
    setDownloadingId(participant.id);
    try {
      const renderData = await issueOrganizerCertificate(
        user.id,
        selectedProgramme.id,
        participant.registrationId
      );
      await generateParticipationCertificatePdf({
        ...renderData,
        fileName: `Certificate_Participation_${participant.matricNumber || participant.id}.pdf`,
      });
      if (!quiet) {
        showMessage(`Certificate issued to ${participant.studentFullName}'s portal and downloaded.`);
      }
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to generate certificate.', 'error');
      throw err;
    } finally {
      setDownloadingId(null);
    }
  };

  const downloadCertificate = (participant) => issueAndDownload(participant);

  const downloadAll = async () => {
    if (!filtered.length || !canIssue) return;
    const eligible = filtered.filter((p) => p.registrationId);
    if (!eligible.length) {
      showMessage('No attendees with registrations found for certificate issuance.', 'error');
      return;
    }
    setBulkDownloading(true);
    try {
      for (const participant of eligible) {
        // eslint-disable-next-line no-await-in-loop
        await issueAndDownload(participant, { quiet: true });
      }
      showMessage(`Issued and downloaded ${eligible.length} certificate${eligible.length === 1 ? '' : 's'}.`);
    } catch {
      // Individual error already surfaced.
    } finally {
      setBulkDownloading(false);
    }
  };

  const issueAllToPortals = async () => {
    if (!user?.id || !selectedProgramme || !canIssue) return;
    setIssuingAll(true);
    try {
      const result = await issueAllOrganizerCertificates(user.id, selectedProgramme.id);
      const issued = result?.issuedCount ?? 0;
      const skipped = result?.skippedCount ?? 0;
      showMessage(
        `Issued ${issued} certificate${issued === 1 ? '' : 's'} to student portals`
        + (skipped ? ` (${skipped} already issued).` : '.')
      );
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to issue certificates.', 'error');
    } finally {
      setIssuingAll(false);
    }
  };

  const windowAlert = () => {
    if (!selectedProgramme || isManualCertificate) return null;
    if (windowStatus === 'not_ended') {
      return (
        <Alert severity="info" sx={{ mt: 2, borderRadius: '10px' }}>
          Certificates can be issued after the programme ends, within 3 weeks of the end date.
        </Alert>
      );
    }
    if (windowStatus === 'expired') {
      return (
        <Alert severity="warning" sx={{ mt: 2, borderRadius: '10px' }}>
          The certificate issuance window closed on {formatCertificateDeadline(selectedProgramme)}.
          Contact HEPA if late issuance is required.
        </Alert>
      );
    }
    return (
      <Alert severity="success" sx={{ mt: 2, borderRadius: '10px' }}>
        Issue certificates by {formatCertificateDeadline(selectedProgramme)}
        {daysRemaining != null ? ` (${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining).` : '.'}
        {' '}Only students marked <strong>present</strong> in attendance are eligible.
      </Alert>
    );
  };

  return (
    <OrganizerLayout>
      <PortalHero
        eyebrow="Organizer Portal"
        title="Certificates"
        subtitle={user.clubName
          ? `Issue participation certificates for ${user.clubName} programmes to students who attended.`
          : 'Issue participation certificates to students who attended your programmes.'}
      />

      {programmesError && (
        <Alert severity="warning" sx={{ mb: 3 }}>{programmesError}</Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : programmes.length === 0 ? (
        <EmptyState title="No programmes available" description="Certificates can be issued once programmes have ended and attendance is recorded." />
      ) : endedProgrammes.length === 0 && systemProgrammes.length > 0 ? (
        <EmptyState
          title="No ended programmes yet"
          description="Certificates become available after a programme ends. You have 3 weeks from the end date to issue them."
        />
      ) : (
        <>
          <SectionCard title="Certificate Settings" sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                select
                label="Programme"
                size="small"
                value={programmeId}
                onChange={(e) => setProgrammeId(e.target.value)}
                sx={{ minWidth: 300 }}
              >
                {endedProgrammes.map((p) => (
                  <MenuItem key={p.id} value={String(p.id)}>{p.title}</MenuItem>
                ))}
                {systemProgrammes.filter((p) => !isProgrammeEnded(p)).map((p) => (
                  <MenuItem key={p.id} value={String(p.id)} disabled>
                    {p.title} (not ended)
                  </MenuItem>
                ))}
              </TextField>
              <TextField size="small" placeholder="Search attendee" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <Button
                variant="contained"
                startIcon={<CloudUploadOutlinedIcon />}
                onClick={issueAllToPortals}
                disabled={filtered.length === 0 || !canIssue || issuingAll || bulkDownloading}
              >
                {issuingAll ? 'Issuing...' : `Issue All to Portals (${filtered.length})`}
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={downloadAll}
                disabled={filtered.length === 0 || !canIssue || bulkDownloading || issuingAll}
              >
                {bulkDownloading ? 'Downloading...' : `Download All PDFs (${filtered.length})`}
              </Button>
            </Box>

            {selectedProgramme && (
              <Alert
                severity={isManualCertificate ? 'info' : 'success'}
                icon={<WorkspacePremiumOutlinedIcon />}
                sx={{ mt: 2, borderRadius: '10px' }}
              >
                {isManualCertificate ? (
                  <>
                    This programme uses <strong>manual certificates</strong> prepared outside CampusLink+.
                    Certificate generation is disabled here. Please distribute certificates through your club&apos;s own process.
                  </>
                ) : (
                  <>
                    This programme uses the <strong>{getCertificateTemplateLabel(selectedProgramme.certificateTemplate)}</strong> template
                    ({selectedProgramme.certificateOrientation === 'PORTRAIT' ? 'portrait' : 'landscape'}).
                    Certificates are signed by the club advisor only
                    {selectedProgramme.advisorName ? ` (${selectedProgramme.advisorName})` : ''}.
                    No HEPA signature is required — issue certificates directly to student portals within 3 weeks of programme end.
                  </>
                )}
              </Alert>
            )}
            {windowAlert()}
          </SectionCard>

          <SectionCard title="Eligible Attendees" subtitle={`${filtered.length} present attendee${filtered.length === 1 ? '' : 's'}`}>
            {loadingAttendees ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={28} /></Box>
            ) : isManualCertificate ? (
              <Alert severity="info" sx={{ borderRadius: '10px' }}>
                Certificate management for this programme is handled manually by the organizer.
              </Alert>
            ) : filtered.length === 0 ? (
              <Alert severity="info">
                No present attendees yet. Mark attendance as present before issuing certificates.
              </Alert>
            ) : (
              <Box className="portal-table-wrap">
                <Table className="portal-table" size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Matric</TableCell>
                      <TableCell>Faculty</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.map((row) => (
                      <TableRow key={row.userId || row.id}>
                        <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>{row.studentFullName}</TableCell>
                        <TableCell>{row.matricNumber}</TableCell>
                        <TableCell>{row.faculty || '—'}</TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={() => downloadCertificate(row)}
                            disabled={!canIssue || !row.registrationId || downloadingId === row.id || bulkDownloading || issuingAll}
                          >
                            {downloadingId === row.id ? 'Generating...' : 'Issue & Download'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
            {!isManualCertificate && canIssue && (
              <Typography sx={{ mt: 2, color: '#475569', fontSize: '0.85rem' }}>
                Use &quot;Issue All to Portals&quot; to upload certificates for all present attendees, or &quot;Issue &amp; Download&quot; for individual PDF copies.
              </Typography>
            )}
          </SectionCard>
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </OrganizerLayout>
  );
};

export default Certificates;
