import React, { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Link as MuiLink,
  TextField,
  Typography,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoginIcon from '@mui/icons-material/Login';
import api from '../services/api';
import { sanitizeStoredUser } from '../hooks/useStoredUser';
import { getPortalDashboardPath, initializePortalOnLogin } from '../utils/portalContext';
import { syncStoredUserFromServer } from '../utils/syncStoredUserFromServer';
import useAuthInteractionState from '../hooks/useAuthInteractionState';
import useAutofillSync from '../hooks/useAutofillSync';
import {
  AuthMotionAlert,
  AuthMotionBox,
  AuthMotionCard,
  AuthMotionForm,
  authFieldSx,
  authPasswordSlotProps,
} from './Design/AuthFormMotion';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { showPassword, hasError, triggerError, toggleShowPassword } = useAuthInteractionState();
  const syncAutofill = useAutofillSync(setFormData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/login', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(sanitizeStoredUser(response.data.user)));
      }

      let userRole = response.data.user?.role;
      const userId = response.data.user?.id;
      if (userId) {
        try {
          const synced = await syncStoredUserFromServer(userId);
          userRole = synced.user?.role || userRole;
        } catch {
          // Login response is still authoritative if profile sync fails.
        }
      }

      const portal = initializePortalOnLogin(userRole);
      navigate(getPortalDashboardPath(portal));
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(message);
      triggerError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthMotionCard>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" className="auth-heading" sx={{ mb: 0.5 }}>
            Welcome back
          </Typography>
          <Typography className="auth-subheading" sx={{ fontSize: '0.95rem' }}>
            Sign in to your CampusLink+ account
          </Typography>
        </Box>

        {error && <AuthMotionAlert severity="error" shake={hasError}>{error}</AuthMotionAlert>}

        <AuthMotionForm onSubmit={handleSubmit}>
          <AuthMotionBox>
            <TextField
              fullWidth
              label="Personal Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onInput={syncAutofill}
              type="email"
              autoComplete="username"
              required
              disabled={loading}
              placeholder="you@gmail.com"
              sx={authFieldSx}
            />
          </AuthMotionBox>

          <AuthMotionBox>
            <TextField
              fullWidth
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onInput={syncAutofill}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              disabled={loading}
              sx={authFieldSx}
              slotProps={authPasswordSlotProps(showPassword, toggleShowPassword)}
            />
            <Box sx={{ textAlign: 'right', mt: 0.5 }}>
              <MuiLink component={Link} to="/forgot-password" className="auth-link" sx={{ fontSize: '0.85rem', textDecoration: 'none' }}>
                Forgot password?
              </MuiLink>
            </Box>
          </AuthMotionBox>

          <AuthMotionBox>
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                startIcon={<LoginIcon />}
                className="auth-submit-btn"
                sx={{ mb: 2 }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </motion.div>
          </AuthMotionBox>
        </AuthMotionForm>

        <Divider className="auth-divider" sx={{ my: 2.5 }}>
          <Typography variant="body2" className="auth-divider-text">New here?</Typography>
        </Divider>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <Button
            component={Link}
            to="/register"
            fullWidth
            variant="outlined"
            className="auth-outline-btn"
          >
            Create an account
          </Button>
        </motion.div>
    </AuthMotionCard>
  );
};

export default Login;
