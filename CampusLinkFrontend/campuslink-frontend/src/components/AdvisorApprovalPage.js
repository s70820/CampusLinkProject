import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';
import { approveAdvisorOnline, getAdvisorApprovalByToken } from '../services/programmeWorkflowApi';

function AdvisorApprovalPage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAdvisorApprovalByToken(token);
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired approval link.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      setError('');
      await approveAdvisorOnline(token, remarks);
      setSuccess('Programme approved successfully. The organizer may now submit to MPP.');
      setData((prev) => ({ ...prev, status: 'APPROVED' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve programme.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: 6, px: 2 }}>
      <Card sx={{ maxWidth: 560, mx: 'auto', borderRadius: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Club Advisor Approval
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3 }}>
            Review and digitally approve this programme proposal.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {data && (
            <Box sx={{ mb: 3 }}>
              <Typography><strong>Programme:</strong> {data.programmeTitle}</Typography>
              <Typography><strong>Club:</strong> {data.organizerClub}</Typography>
              <Typography><strong>Level:</strong> {data.programmeLevel}</Typography>
              <Typography><strong>Advisor:</strong> {data.advisorName}</Typography>
              <Typography><strong>Status:</strong> {data.status}</Typography>
            </Box>
          )}

          {data?.status === 'PENDING' && (
            <>
              <TextField
                label="Remarks (optional)"
                fullWidth
                multiline
                minRows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" fullWidth onClick={handleApprove} disabled={submitting}>
                {submitting ? 'Approving...' : 'Approve Programme'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default AdvisorApprovalPage;
