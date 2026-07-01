import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Typography,
} from '@mui/material';
import CardMembershipOutlinedIcon from '@mui/icons-material/CardMembershipOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import StudentLayout from './layout/StudentLayout';
import PageHeader from './ui/PageHeader';
import SectionCard from './ui/SectionCard';
import DashboardCard from './ui/DashboardCard';
import EmptyState from './ui/EmptyState';
import StatusBadge from './ui/StatusBadge';
import { fetchStudentCertificates, fetchCertificateRenderData } from '../../services/studentPortalApi';
import generateParticipationCertificatePdf from '../../utils/generateParticipationCertificatePdf';
import { readStoredUser } from '../../hooks/useStoredUser';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' });
};

const certificateLabel = (type) => {
  if (!type) return 'Participation';
  return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

const StudentCertificates = () => {
  const user = readStoredUser();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    if (!user?.id) {
      setCertificates([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchStudentCertificates(user.id)
      .then((data) => {
        if (!cancelled) setCertificates(data || []);
      })
      .catch(() => {
        if (!cancelled) setCertificates([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user?.id]);

  const readyCount = certificates.filter((c) => c.status === 'READY').length;

  const handleDownload = async (cert) => {
    if (!user?.id || cert.status !== 'READY') return;
    setDownloadingId(cert.id);
    try {
      const renderData = await fetchCertificateRenderData(user.id, cert.id);
      await generateParticipationCertificatePdf({
        ...renderData,
        fileName: `Sijil_Penyertaan_${cert.programmeTitle?.replace(/[^a-zA-Z0-9_-]+/g, '_') || cert.id}.pdf`,
      });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <StudentLayout>
      <PageHeader
        title="Certificates"
        subtitle="View and download certificates for programmes you have completed."
      />

      <Box className="portal-grid portal-grid--stats" sx={{ mb: 3, gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <DashboardCard
          label="Certificates Ready"
          value={readyCount}
          subtitle="Available to download"
          icon={CardMembershipOutlinedIcon}
          variant="purple"
        />
        <DashboardCard
          label="Total Earned"
          value={certificates.length}
          subtitle="Across all programmes"
          icon={CardMembershipOutlinedIcon}
          variant="blue"
        />
      </Box>

      <SectionCard
        title="Your Certificates"
        subtitle={loading ? 'Loading...' : `${certificates.length} certificate${certificates.length === 1 ? '' : 's'}`}
      >
        {certificates.length === 0 && !loading ? (
          <EmptyState
            title="No certificates yet"
            description="Complete programmes and attend sessions to earn downloadable certificates."
            icon={CardMembershipOutlinedIcon}
          />
        ) : (
          <Grid container spacing={2}>
            {certificates.map((cert) => (
              <Grid key={cert.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    border: '1px solid rgba(37,99,235,0.12)',
                    bgcolor: 'rgba(255,255,255,0.94)',
                    boxShadow: '0 4px 16px rgba(37,99,235,0.06)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '10px',
                        bgcolor: '#ede9fe',
                        color: '#6d28d9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <CardMembershipOutlinedIcon />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', mb: 0.25 }}>
                        {cert.programmeTitle}
                      </Typography>
                      <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {cert.organizerClub || 'CampusLink Programme'}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography sx={{ fontSize: '0.8rem', color: '#475569', mb: 0.5 }}>
                    Type: {certificateLabel(cert.certificateType)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mb: 1.5 }}>
                    Issued: {formatDate(cert.issuedAt)}
                  </Typography>

                  <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <StatusBadge status={cert.status === 'READY' ? 'Completed' : 'Pending'} />
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<DownloadOutlinedIcon />}
                      disabled={cert.status !== 'READY' || downloadingId === cert.id}
                      onClick={() => handleDownload(cert)}
                      sx={{ fontWeight: 700, borderRadius: '8px' }}
                    >
                      {downloadingId === cert.id ? 'Downloading...' : 'Download'}
                    </Button>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </SectionCard>
    </StudentLayout>
  );
};

export default StudentCertificates;
