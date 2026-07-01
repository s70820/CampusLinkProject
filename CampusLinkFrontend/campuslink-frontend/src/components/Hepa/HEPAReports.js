import React, { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import HepaLayout from '../HepaLayout';
import PortalHero from '../Student/ui/PortalHero';
import DashboardCard from '../Student/ui/DashboardCard';
import SectionCard from '../Student/ui/SectionCard';
import { useStoredUser } from '../../hooks/useStoredUser';
import { fetchHepaReports } from '../../services/hepaApi';
import { formatProgrammeDate } from '../../utils/organizerProgrammeStatus';

function RoleBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, gap: 2 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{label}</Typography>
        <Typography sx={{ color: '#334155', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {count} ({pct}%)
        </Typography>
      </Box>
      <Box sx={{ height: 10, bgcolor: '#e2e8f0', borderRadius: 999 }}>
        <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: color, borderRadius: 999 }} />
      </Box>
    </Box>
  );
}

function HEPAReports() {
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
        if (!cancelled) setError(err.response?.data?.message || 'Unable to load reports.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id]);

  return (
    <HepaLayout>
      <PortalHero
        eyebrow="HEPA Portal"
        title="Campus Reports"
        subtitle="Compliance and performance overview for programme workflow, role requests, and campus participation."
      />

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : data && (
        <>
          <Box className="portal-grid portal-grid--stats" sx={{ mb: 3 }}>
            <DashboardCard label="Total Programmes" value={data.totalProgrammes} subtitle="All workflow stages" icon={AssessmentOutlinedIcon} variant="blue" />
            <DashboardCard label="Approved" value={data.approvedProgrammes} subtitle="Open for registration" icon={FactCheckOutlinedIcon} variant="green" />
            <DashboardCard label="Pending Role Requests" value={data.pendingRoleRequests} subtitle={`${data.totalRoleRequests} total requests`} icon={HowToRegOutlinedIcon} variant="amber" />
            <DashboardCard label="Campus Users" value={data.totalStudents + data.totalOrganizers} subtitle={`${data.totalMpp} MPP reviewers`} icon={GroupsOutlinedIcon} variant="purple" />
          </Box>

          <Box className="portal-grid portal-grid--2" sx={{ mb: 3 }}>
            <SectionCard title="Workflow Pipeline">
              <RoleBar label="Pending MPP Review" count={data.pendingMppProgrammes} total={data.totalProgrammes} color="#d97706" />
              <RoleBar label="Pending HEPA Approval" count={data.pendingHepaProgrammes} total={data.totalProgrammes} color="#2563eb" />
              <RoleBar label="Approved & Published" count={data.approvedProgrammes} total={data.totalProgrammes} color="#059669" />
              <RoleBar label="Rejected" count={data.rejectedProgrammes} total={data.totalProgrammes} color="#dc2626" />
            </SectionCard>

            <SectionCard title="Programmes by Category">
              {data.programmesByCategory.length === 0 ? (
                <Typography sx={{ color: '#334155', fontWeight: 500 }}>No category data available.</Typography>
              ) : (
                data.programmesByCategory.map((row) => (
                  <RoleBar
                    key={row.category}
                    label={row.category}
                    count={row.count}
                    total={data.totalProgrammes}
                    color="#7c3aed"
                  />
                ))
              )}
            </SectionCard>
          </Box>

          <SectionCard title="Recently Approved Programmes" noPadding>
            <Box sx={{ overflowX: 'auto' }}>
              <Table className="portal-table">
                <TableHead>
                  <TableRow>
                    <TableCell>Programme</TableCell>
                    <TableCell>Club</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.recentApprovals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4, color: '#334155' }}>
                        No recently approved programmes.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.recentApprovals.map((p) => (
                      <TableRow key={p.id} hover>
                        <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>{p.title}</TableCell>
                        <TableCell sx={{ color: '#334155' }}>{p.organizerClub || '—'}</TableCell>
                        <TableCell sx={{ color: '#334155' }}>{formatProgrammeDate(p.startDate, p.endDate)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Box>
          </SectionCard>
        </>
      )}
    </HepaLayout>
  );
}

export default HEPAReports;
