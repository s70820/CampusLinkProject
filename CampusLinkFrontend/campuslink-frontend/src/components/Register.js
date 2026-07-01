import React, { useState, useCallback } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Link as MuiLink,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import useAuthInteractionState from '../hooks/useAuthInteractionState';
import {
  AuthMotionAlert,
  AuthMotionBox,
  AuthMotionCard,
  AuthMotionForm,
  authFieldSx,
  authSelectMenuProps,
  authInputLabelProps,
  authPasswordSlotProps,
} from './Design/AuthFormMotion';
import {
  normalizePhoneNumber,
  phoneValidationHelperText,
  validatePhoneNumber,
} from '../utils/phoneValidation';
import {
  personalEmailErrorMessage,
  personalEmailHelperText,
  validatePersonalEmail,
} from '../utils/emailValidation';

const Register = () => {
  const facultyOptions = [
    'Faculty of Computer Science and Mathematics (FSKM)',
    'Faculty of Ocean Engineering Technology (FTKK)',
    'Faculty of Fisheries and Food Science (FPSM)',
    'Faculty of Science and Marine Environment (FSSM)',
    'Faculty of Business, Economics and Social Development (FPEPS)',
    'Faculty of Maritime Studies (FPM)',
    'Faculty of Food Science and Agrotechnology (FSMA)',
  ];

  const [formData, setFormData] = useState({
    fullName: '',
    matricNumber: '',
    faculty: '',
    email: '',
    phoneNumber: '',
    icNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [matricRegistryStatus, setMatricRegistryStatus] = useState(null);
  const [registryInfo, setRegistryInfo] = useState(null);

  const {
    showPassword,
    showConfirmPassword,
    hasError,
    triggerError,
    toggleShowPassword,
    toggleShowConfirmPassword,
  } = useAuthInteractionState();

  const validateMatricNumber = (matric) => /^S\d{5}$/i.test(matric);
  const validateIcNumber = (ic) => /^\d{12}$/.test(ic.replace(/\D/g, ''));

  const verifyMatricRegistry = useCallback(async (matric) => {
    if (!validateMatricNumber(matric)) {
      setMatricRegistryStatus(null);
      setRegistryInfo(null);
      return false;
    }
    setMatricRegistryStatus('checking');
    setRegistryInfo(null);
    try {
      const response = await api.get(`/api/students/registry/${matric.trim().toUpperCase()}`);
      if (response.data?.found) {
        setMatricRegistryStatus('found');
        setRegistryInfo(response.data);
        setFormData((prev) => ({
          ...prev,
          fullName: response.data.fullName || prev.fullName,
          faculty: response.data.faculty || prev.faculty,
        }));
        return true;
      }
      setMatricRegistryStatus('not_found');
      setRegistryInfo(null);
      return false;
    } catch {
      setMatricRegistryStatus('not_found');
      setRegistryInfo(null);
      return false;
    }
  }, []);

  const fail = (message) => {
    setError(message);
    triggerError();
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'matricNumber') {
      setMatricRegistryStatus(null);
      setRegistryInfo(null);
    }
  };

  const handleMatricBlur = () => {
    if (formData.matricNumber.trim()) {
      verifyMatricRegistry(formData.matricNumber);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!validateMatricNumber(formData.matricNumber)) {
      fail('Matric number must be in format SXXXXX (e.g., S12345)');
      return;
    }
    const matricValid = await verifyMatricRegistry(formData.matricNumber);
    if (!matricValid) {
      fail('Matric number not found in UMT student registry.');
      return;
    }
    if (!formData.faculty) {
      fail('Please select your faculty.');
      return;
    }
    if (!formData.phoneNumber.trim()) {
      fail('Phone number is required.');
      return;
    }
    if (!validatePhoneNumber(formData.phoneNumber)) {
      fail('Phone number must be a valid Malaysian or international number (8-15 digits).');
      return;
    }
    if (!formData.icNumber.trim()) {
      fail('IC number is required.');
      return;
    }
    if (!validateIcNumber(formData.icNumber)) {
      fail('IC number must be exactly 12 digits (e.g. 050718115013).');
      return;
    }
    if (!validatePersonalEmail(formData.email)) {
      fail(personalEmailErrorMessage(formData.email));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      fail('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      fail('Password must be at least 6 characters long');
      return;
    }

    try {
      try {
        await api.get(`/api/users/email/${encodeURIComponent(formData.email.trim())}`);
        fail('This email is already registered. Please sign in or use a different email.');
        return;
      } catch (checkError) {
        if (checkError.response?.status !== 404) {
          console.warn('Unable to verify email availability:', checkError);
        }
      }

      const payload = {
        fullName: formData.fullName,
        matricNumber: formData.matricNumber.trim().toUpperCase(),
        faculty: formData.faculty,
        email: formData.email.trim().toLowerCase(),
        phoneNumber: normalizePhoneNumber(formData.phoneNumber),
        icNumber: formData.icNumber.replace(/\D/g, ''),
        password: formData.password,
        role: 'STUDENT',
        approvalStatus: 'APPROVED',
      };

      await api.post('/api/register', payload);

      setSuccess('Registration successful! Please login to continue.');
      setMatricRegistryStatus(null);
      setRegistryInfo(null);
      setFormData({
        fullName: '',
        matricNumber: '',
        faculty: '',
        email: '',
        phoneNumber: '',
        icNumber: '',
        password: '',
        confirmPassword: '',
      });
    } catch (submitError) {
      const serverMessage = submitError.response?.data?.message || submitError.response?.statusText;
      fail(serverMessage || submitError.message || 'Registration failed. Please try again.');
      console.error('Registration error:', submitError);
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthMotionCard>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" className="auth-heading" sx={{ mb: 0.5 }}>
            Create your account
          </Typography>
          <Typography className="auth-subheading" sx={{ fontSize: '0.95rem' }}>
            Register as a UMT student. MPP and organizer access is available later via Role Request after sign-in.
          </Typography>
        </Box>

        {error && <AuthMotionAlert severity="error" shake={hasError}>{error}</AuthMotionAlert>}
        {success && <AuthMotionAlert severity="success" shake={false}>{success}</AuthMotionAlert>}

        <AuthMotionForm onSubmit={handleSubmit}>
          <AuthMotionBox>
            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              margin="normal"
              required
              disabled={loading}
              sx={authFieldSx}
            />
          </AuthMotionBox>

          <AuthMotionBox>
            <TextField
              fullWidth
              label="Matric Number"
              name="matricNumber"
              value={formData.matricNumber}
              onChange={handleChange}
              onBlur={handleMatricBlur}
              margin="normal"
              placeholder="S12345"
              required
              disabled={loading}
              error={matricRegistryStatus === 'not_found'}
              helperText={
                matricRegistryStatus === 'checking'
                  ? 'Checking UMT student registry...'
                  : matricRegistryStatus === 'found'
                    ? `Verified: ${registryInfo?.fullName || 'Student'}${registryInfo?.studyLevel ? ` — ${registryInfo.studyLevel}` : ''}`
                    : matricRegistryStatus === 'not_found'
                      ? 'Matric number not found in UMT student registry.'
                      : 'Format: SXXXXX (e.g., S12345)'
              }
              sx={authFieldSx}
            />
          </AuthMotionBox>

          <AuthMotionBox>
            <FormControl fullWidth margin="normal" required className="auth-field" sx={{ mb: 2 }}>
              <InputLabel {...authInputLabelProps}>Faculty</InputLabel>
              <Select
                name="faculty"
                value={formData.faculty}
                onChange={handleChange}
                disabled={loading}
                label="Faculty"
                MenuProps={authSelectMenuProps}
              >
                <MenuItem value="" disabled sx={{ color: '#64748b !important' }}>Select your faculty</MenuItem>
                {facultyOptions.map((faculty) => (
                  <MenuItem key={faculty} value={faculty} sx={{ color: '#e2e8f0' }}>{faculty}</MenuItem>
                ))}
              </Select>
              <FormHelperText>Select your UMT faculty</FormHelperText>
            </FormControl>
          </AuthMotionBox>

          <AuthMotionBox>
            <TextField
              fullWidth
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              margin="normal"
              placeholder="e.g. 0123456789, +60123456789, +12125551234"
              required
              disabled={loading}
              helperText={phoneValidationHelperText}
              sx={authFieldSx}
            />
          </AuthMotionBox>

          <AuthMotionBox>
            <TextField
              fullWidth
              label="IC Number"
              name="icNumber"
              value={formData.icNumber}
              onChange={handleChange}
              margin="normal"
              placeholder="e.g. 050718115013"
              required
              disabled={loading}
              helperText="12 digits only, no dash required"
              sx={authFieldSx}
            />
          </AuthMotionBox>

          <AuthMotionBox>
            <TextField
              fullWidth
              label="Personal Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              type="email"
              required
              disabled={loading}
              placeholder="you@gmail.com"
              helperText={personalEmailHelperText}
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
              margin="normal"
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
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              disabled={loading}
              sx={{ mb: 3, ...authFieldSx }}
              slotProps={authPasswordSlotProps(showConfirmPassword, toggleShowConfirmPassword)}
            />
          </AuthMotionBox>

          <AuthMotionBox>
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" fullWidth variant="contained" disabled={loading} className="auth-submit-btn" sx={{ mb: 2 }}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </motion.div>
          </AuthMotionBox>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" className="auth-link-text">
              Already have an account?{' '}
              <MuiLink component={Link} to="/login" className="auth-link" sx={{ textDecoration: 'none' }}>
                Sign in here
              </MuiLink>
            </Typography>
          </Box>
        </AuthMotionForm>
    </AuthMotionCard>
  );
};

export default Register;
