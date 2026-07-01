import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, CircularProgress, Tab, Tabs, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import HepaLayout from '../HepaLayout';
import PortalHero from '../Student/ui/PortalHero';
import SectionCard from '../Student/ui/SectionCard';
import EmptyState from '../Student/ui/EmptyState';
import { fetchMeritRules } from '../../services/hepaApi';
import {
  MERIT_PROGRAMME_LEVELS,
  formatMeritRoleType,
  getMeritLevelLabel,
  sortMeritRules,
} from '../../utils/meritRulesDisplay';

function HEPAMeritManagement() {
  const [level, setLevel] = useState('University');
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchMeritRules(level)
      .then((data) => {
        if (!cancelled) setRules(sortMeritRules(data));
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Unable to load merit rules.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [level]);

  const levelLabel = useMemo(() => getMeritLevelLabel(level), [level]);

  return (
    <HepaLayout>
      <PortalHero
        eyebrow="HEPA Portal"
        title="Merit Management"
        subtitle="Official UMT MyStar merit point rules by programme level and committee role — used when programmes are approved."
      />

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <SectionCard title={`Merit Rules — ${levelLabel}`}>
        <Tabs
          value={level}
          onChange={(e, v) => setLevel(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2 }}
        >
          {MERIT_PROGRAMME_LEVELS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : rules.length === 0 ? (
          <EmptyState message={`No merit rules found for ${levelLabel} programmes.`} />
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width={56}>No.</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align="right">Merit Points</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rules.map((rule, index) => (
                  <TableRow key={rule.id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{formatMeritRoleType(rule.roleType)}</TableCell>
                    <TableCell align="right">{rule.meritPoints}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </SectionCard>
    </HepaLayout>
  );
}

export default HEPAMeritManagement;
