import React, { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import HepaLayout from '../HepaLayout';
import PortalHero from '../Student/ui/PortalHero';
import DashboardCard from '../Student/ui/DashboardCard';
import SectionCard from '../Student/ui/SectionCard';
import { useStoredUser } from '../../hooks/useStoredUser';
import { fetchHepaReports } from '../../services/hepaApi';

function HEPAAnalytics() {
  const { user } = useStoredUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) return undefined;
    let cancelled = false;
    setLoading(true);
    fetchHepaReports(user.id)
      .then((reports) => { if (!cancelled) setData(reports); })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Unable to load analytics.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id]);

  const approvalRate = data && data.totalProgrammes > 0
    ? Math.round((data.approvedProgrammes / data.totalProgrammes) * 100)
    : 0;

  const topCategory = data?.programmesByCategory?.[0];

  return (
    <HepaLayout>
      <PortalHero
        eyebrow="HEPA Portal"
        title="Campus Analytics"
        subtitle="Key indicators on programme reach, approval efficiency, and student participation across UMT."
      />

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : data && (
        <>
          <Box className="portal-grid portal-grid--stats" sx={{ mb: 3 }}>
            <DashboardCard
              label="Approval Rate"
              value={`${approvalRate}%`}
              subtitle={`${data.approvedProgrammes} of ${data.totalProgrammes} programmes`}
              icon={AnalyticsOutlinedIcon}
              variant="green"
            />
            <DashboardCard
              label="Active Students"
              value={data.totalStudents}
              subtitle={`${data.totalOrganizers} club organizers`}
              icon={SchoolOutlinedIcon}
              variant="blue"
            />
            <DashboardCard
              label="Top Category"
              value={topCategory?.category || '—'}
              subtitle={topCategory ? `${topCategory.count} programmes` : 'No data'}
              icon={EmojiEventsOutlinedIcon}
              variant="purple"
              valueVariant="text"
            />
            <DashboardCard
              label="Review Backlog"
              value={data.pendingMppProgrammes + data.pendingHepaProgrammes}
              subtitle={`${data.pendingMppProgrammes} MPP · ${data.pendingHepaProgrammes} HEPA`}
              icon={RateReviewOutlinedIcon}
              variant="amber"
            />
          </Box>

          <SectionCard title="Participation Insights">
            <Typography sx={{ color: '#64748b', mb: 2 }}>
              CampusLink+ tracks {data.totalProgrammes} programmes across {data.programmesByCategory.length} categories.
              The highest-volume category is <strong>{topCategory?.category || 'N/A'}</strong> with {topCategory?.count || 0} programmes.
            </Typography>
            <Typography sx={{ color: '#64748b', mb: 2 }}>
              {data.pendingRoleRequests} role upgrade requests are awaiting HEPA decision out of {data.totalRoleRequests} total submissions.
            </Typography>
            <Typography sx={{ color: '#64748b' }}>
              Workflow efficiency: {data.rejectedProgrammes} programmes were rejected during review, while {data.approvedProgrammes} are published for student registration.
            </Typography>
          </SectionCard>
        </>
      )}
    </HepaLayout>
  );
}

export default HEPAAnalytics;
