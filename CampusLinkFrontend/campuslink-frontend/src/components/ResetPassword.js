import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Link as MuiLink } from '@mui/material';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import LockResetIcon from '@mui/icons-material/LockResetOutlined';
import api from '../services/api';
import useAuthInteractionState from '../hooks/useAuthInteractionState';
import {
  AuthMotionAlert,
  AuthMotionBox,
  AuthMotionCard,
  AuthMotionForm,
  authFieldSx,
  authPasswordSlotProps,
} from './Design/AuthFormMotion';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const {
    showPassword,
    showConfirmPassword,
    hasError,
    triggerError,
    toggleShowPassword,
    toggleShowConfirmPassword,
  } = useAuthInteractionState();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!token) {
      setError('Invalid reset link. Please request a new password reset email.');
      triggerError();
      setLoading(false);
      return;
    }
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      triggerError();
      setLoading(false);
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.');
      triggerError();
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/auth/reset-password', {
        token,
        newPassword: formData.newPassword,
      });
      setSuccess(response.data?.message || 'Password reset successfully.');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset password. The link may have expired.');
      triggerError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthMotionCard>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" className="auth-heading" sx={{ mb: 0.5 }}>
          Reset password
        </Typography>
        <Typography className="auth-subheading" sx={{ fontSize: '0.95rem' }}>
          Choose a new password for your CampusLink+ account
        </Typography>
      </Box>

      {error && <AuthMotionAlert severity="error" shake={hasError}>{error}</AuthMotionAlert>}
      {success && <AuthMotionAlert severity="success">{success}</AuthMotionAlert>}

      <AuthMotionForm onSubmit={handleSubmit}>
        <AuthMotionBox>
          <TextField
            fullWidth
            label="New Password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            type={showPassword ? 'text' : 'password'}
            required
            disabled={loading}
            helperText="Minimum 6 characters"
            sx={authFieldSx}
            slotProps={authPasswordSlotProps(showPassword, toggleShowPassword)}
          />
        </AuthMotionBox>

        <AuthMotionBox>
          <TextField
            fullWidth
            label="Confirm New Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            type={showConfirmPassword ? 'text' : 'password'}
            required
            disabled={loading}
            sx={{ mb: 2, ...authFieldSx }}
            slotProps={authPasswordSlotProps(showConfirmPassword, toggleShowConfirmPassword)}
          />
        </AuthMotionBox>

        <AuthMotionBox>
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !token}
              startIcon={<LockResetIcon />}
              className="auth-submit-btn"
              sx={{ mb: 2 }}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </motion.div>
        </AuthMotionBox>
      </AuthMotionForm>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" className="auth-link-text">
          <MuiLink component={Link} to="/login" className="auth-link" sx={{ textDecoration: 'none' }}>
            Back to sign in
          </MuiLink>
        </Typography>
      </Box>
    </AuthMotionCard>
  );
};

export default ResetPassword;
