import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import MailOutlineIcon from '@mui/icons-material/MailOutlineOutlined';
import api from '../services/api';
import useAuthInteractionState from '../hooks/useAuthInteractionState';
import {
  AuthMotionAlert,
  AuthMotionBox,
  AuthMotionCard,
  AuthMotionForm,
  authFieldSx,
} from './Design/AuthFormMotion';
import { personalEmailErrorMessage, validatePersonalEmail } from '../utils/emailValidation';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { hasError, triggerError } = useAuthInteractionState();

  useEffect(() => {
    const syncEmailAutofill = () => {
      const input = document.querySelector('.auth-glass-card input[name="email"]');
      if (input?.value) {
        setEmail(input.value);
      }
    };

    syncEmailAutofill();
    const timers = [100, 300, 600].map((delay) => window.setTimeout(syncEmailAutofill, delay));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!validatePersonalEmail(email)) {
      setError(personalEmailErrorMessage(email));
      triggerError();
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/auth/forgot-password', { email: email.trim() });
      setSuccess(response.data?.message || 'If an account exists for that email, a password reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to process your request. Please try again.');
      triggerError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthMotionCard>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" className="auth-heading" sx={{ mb: 0.5 }}>
          Forgot password?
        </Typography>
        <Typography className="auth-subheading" sx={{ fontSize: '0.95rem' }}>
          Enter your personal email and we&apos;ll send you a reset link
        </Typography>
      </Box>

      {error && <AuthMotionAlert severity="error" shake={hasError}>{error}</AuthMotionAlert>}
      {success && <AuthMotionAlert severity="success">{success}</AuthMotionAlert>}

      <AuthMotionForm onSubmit={handleSubmit}>
        <AuthMotionBox>
          <TextField
            fullWidth
            label="Personal Email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onInput={(e) => {
              if (e.target.value) setEmail(e.target.value);
            }}
            type="email"
            autoComplete="username"
            required
            disabled={loading}
            placeholder="you@gmail.com"
            helperText="Use the personal email you registered with"
            sx={authFieldSx}
          />
        </AuthMotionBox>

        <AuthMotionBox>
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              startIcon={<MailOutlineIcon />}
              className="auth-submit-btn"
              sx={{ mb: 2 }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </motion.div>
        </AuthMotionBox>
      </AuthMotionForm>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" className="auth-link-text">
          Remember your password?{' '}
          <MuiLink component={Link} to="/login" className="auth-link" sx={{ textDecoration: 'none' }}>
            Back to sign in
          </MuiLink>
        </Typography>
      </Box>
    </AuthMotionCard>
  );
};

export default ForgotPassword;
