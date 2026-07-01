import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputAdornment,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Snackbar,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useNavigate, useParams } from 'react-router-dom';
import PortalHero from './Student/ui/PortalHero';
import OrganizerLayout from './OrganizerLayout';
import { generateProgrammeFormPdf } from '../utils/generateProgrammeFormPdf';
import CommitteeMatricField from './CommitteeMatricField';
import {
  deleteSupportingDocument,
  getProgrammeFull,
  previewMerit,
  saveProgrammeDraft,
  submitToMpp,
  uploadAdvisorSigned,
  uploadSupportingDocuments,
} from '../services/programmeWorkflowApi';
import { resolveProgrammeFileUrl } from '../utils/programmeReviewDisplay';
import { isEditableOrganizerDraft } from '../utils/organizerProgrammeStatus';
import { mapProgrammeFullToForm } from '../utils/mapProgrammeFullToForm';
import {
  BUDGET_EXPENSE_ITEMS,
  BUDGET_INCOME_ITEMS,
  buildBudgetLinesPayload,
  buildSpeakersPayload,
  buildTentativePayload,
  calculateBudgetTotals,
  createDefaultBudgetLines,
  createEmptySpeakerRow,
  createEmptyTentativeRow,
  formatCurrency,
} from '../utils/programmeFormConstants';

import CertificateTemplatePreview from './CertificateTemplatePreview';
import CertificatePreviewDialog from './CertificatePreviewDialog';
import { PROGRAMME_CATEGORIES } from '../constants/programmeCategories';
import {
  CERTIFICATE_ORIENTATIONS,
  CERTIFICATE_TEMPLATES,
  DEFAULT_CERTIFICATE_ORIENTATION,
  DEFAULT_CERTIFICATE_TEMPLATE,
  getCertificateTemplateLabel,
} from '../constants/certificateTemplates';
import { DEMO_CLUB_ADVISOR } from '../constants/clubAdvisor';
import useStoredUser from '../hooks/useStoredUser';

const categoryOptions = PROGRAMME_CATEGORIES;

const levelOptions = ['Faculty/Club', 'University', 'State', 'National', 'International'];
const programmeTypes = ['Physical', 'Online', 'Hybrid'];
const SDG_OPTIONS = [
  { number: 1, label: 'NO POVERTY' },
  { number: 2, label: 'ZERO HUNGER' },
  { number: 3, label: 'GOOD HEALTH AND WELL-BEING' },
  { number: 4, label: 'QUALITY EDUCATION' },
  { number: 5, label: 'GENDER EQUALITY' },
  { number: 6, label: 'CLEAN WATER AND SANITATION' },
  { number: 7, label: 'AFFORDABLE AND CLEAN ENERGY' },
  { number: 8, label: 'DECENT WORK AND ECONOMIC GROWTH' },
  { number: 9, label: 'INDUSTRY, INNOVATION AND INFRASTRUCTURE' },
  { number: 10, label: 'REDUCED INEQUALITIES' },
  { number: 11, label: 'SUSTAINABLE CITIES AND COMMUNITIES' },
  { number: 12, label: 'RESPONSIBLE CONSUMPTION AND PRODUCTION' },
  { number: 13, label: 'CLIMATE ACTION' },
  { number: 14, label: 'LIFE BELOW WATER' },
  { number: 15, label: 'LIFE ON LAND' },
  { number: 16, label: 'PEACE, JUSTICE AND STRONG INSTITUTIONS' },
  { number: 17, label: 'PARTNERSHIPS FOR THE GOALS' },
];

const initialFormState = {
  title: '',
  category: '',
  level: '',
  type: '',
  organizerClub: '',
  description: '',
  objectives: '',
  outcomes: '',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  registrationOpenDate: '',
  registrationCloseDate: '',
  venue: '',
  googleMapsLocation: '',
  communicationLink: '',
  customRegistrationFields: [],
  maxParticipants: '',
  expectedStudentParticipants: '',
  expectedStaffParticipants: '',
  expectedExternalParticipants: '',
  budgetLines: createDefaultBudgetLines(),
  tentativeSchedule: [createEmptyTentativeRow(1)],
  speakers: [],
  proposalPaperFile: null,
  proposalPaperName: '',
  proposalPaperPreview: '',
  sponsorLetterFile: null,
  sponsorLetterName: '',
  sponsorLetterPreview: '',
  riskAssessmentFile: null,
  riskAssessmentName: '',
  riskAssessmentPreview: '',
  posterFile: null,
  posterPreview: '',
  sdgs: [],
  collaboratingOrganization: '',
  sponsorshipInfo: '',
  isPaidProgramme: false,
  registrationFee: '',
  paymentInstructions: '',
  paymentReferenceFormat: '',
  paymentQrFile: null,
  paymentQrPreview: '',
  isTeamProgramme: false,
  teamNameRequired: true,
  minTeamSize: '',
  maxTeamSize: '',
  signedAdvisorForm: null,
  signedAdvisorFormName: '',
  applicationPdfFile: null,
  certificateMode: 'SYSTEM',
  certificateTemplate: DEFAULT_CERTIFICATE_TEMPLATE,
  certificateOrientation: DEFAULT_CERTIFICATE_ORIENTATION,
  advisorSignatureFile: null,
  advisorSignaturePreview: '',
  advisor: {
    advisorName: DEMO_CLUB_ADVISOR.name,
    advisorEmail: DEMO_CLUB_ADVISOR.email,
    approvalMethod: 'OFFLINE',
  },
  committee: {
    director: { matric: '', name: '', faculty: '', committeeRole: 'PENGARAH_PROGRAM' },
    mtMembers: [{ id: 1, matric: '', name: '', faculty: '', position: '', committeeRole: 'MT_PROGRAM' }],
    ajkMembers: [{ id: 1, matric: '', name: '', faculty: '', role: '', committeeRole: 'AJK_PROGRAM' }],
    specialContributions: [],
  },
};

const normalizeCommittee = (committee = {}) => ({
  director: {
    ...initialFormState.committee.director,
    ...(committee.director || {}),
  },
  mtMembers: (committee.mtMembers || initialFormState.committee.mtMembers).map((member) => ({
    ...member,
    position: member.position ?? '',
    committeeRole: 'MT_PROGRAM',
  })),
  ajkMembers: (committee.ajkMembers || initialFormState.committee.ajkMembers).map((member) => ({
    ...member,
    role: member.role ?? '',
    committeeRole: 'AJK_PROGRAM',
  })),
  specialContributions: (committee.specialContributions || []).map((member) => ({
    ...member,
    contributionDescription: member.contributionDescription ?? '',
    committeeRole: 'SPECIAL_CONTRIBUTION',
  })),
});

const stepLabels = [
  'Programme Information',
  'Schedule & Venue',
  'Programme Poster',
  'Programme Committee',
  'SDG & Programme Details',
  'Supporting Documents',
  'Review & Submit',
];

const MAX_SUPPORTING_DOCUMENTS = 5;

const inputRootSx = (hasValue) => ({
  borderRadius: 3,
  bgcolor: hasValue ? '#f8fafc' : '#fff',
  minHeight: 52,
  transition: 'all 180ms ease-in-out',
  '& fieldset': {
    borderColor: 'rgba(148, 163, 184, 0.45)',
  },
  '&:hover fieldset': {
    borderColor: '#2563eb',
  },
  '&.Mui-focused fieldset': {
    borderColor: '#2563eb',
    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
  },
  '& .MuiOutlinedInput-input, & .MuiSelect-select': {
    py: 1.5,
    px: 1.75,
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
  },
});

const fieldStyles = {
  color: '#0f172a',
  '& .MuiInputAdornment-root': {
    color: '#64748b',
  },
  '& .MuiFormHelperText-root': {
    mx: 0,
  },
};

const FormSection = ({ title, subtitle, children }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="body2" sx={{ ...portalMutedTextSx, mb: 2 }}>
        {subtitle}
      </Typography>
    )}
    {children}
  </Box>
);

const registrationPanelSx = {
  p: { xs: 2, sm: 2.5 },
  borderRadius: '12px',
  border: '1px solid rgba(148, 163, 184, 0.35)',
  bgcolor: '#f8fafc',
};

const registrationOptionLabelSx = {
  m: 0,
  alignItems: 'flex-start',
  '& .MuiFormControlLabel-label': {
    fontWeight: 600,
    color: '#0f172a',
    fontSize: '0.9rem',
    lineHeight: 1.45,
  },
};

const committeeReadOnlyFieldSx = {
  minWidth: 160,
  '& .MuiOutlinedInput-root': {
    bgcolor: '#f1f5f9',
    borderRadius: '10px',
  },
  '& .MuiOutlinedInput-input': {
    color: '#0f172a',
    fontWeight: 600,
    WebkitTextFillColor: '#0f172a',
  },
  '& .MuiFormHelperText-root': {
    color: '#64748b',
    fontWeight: 500,
  },
};

const committeeTableHeadSx = {
  backgroundColor: '#e2e8f0',
  color: '#0f172a',
  fontWeight: 700,
  fontSize: '0.85rem',
};

const meritPreviewCardSx = {
  borderRadius: 3,
  p: 3,
  backgroundColor: '#eff6ff',
  border: '1px solid rgba(37, 99, 235, 0.2)',
};

const sdgOptionSx = (selected) => ({
  m: 0,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  px: 1.5,
  py: 1,
  borderRadius: 2,
  border: '1px solid',
  borderColor: selected ? '#2563eb' : 'rgba(148, 163, 184, 0.45)',
  bgcolor: selected ? 'rgba(37, 99, 235, 0.08)' : '#f8fafc',
  '& .MuiFormControlLabel-label': {
    color: '#0f172a',
    fontWeight: selected ? 700 : 600,
    lineHeight: 1.4,
    display: 'flex',
    alignItems: 'center',
    mt: 0,
  },
  '& .MuiCheckbox-root': {
    color: '#64748b',
    alignSelf: 'center',
    py: 0.5,
    '&.Mui-checked': {
      color: '#2563eb',
    },
  },
});

const portalBodyTextSx = { color: '#334155', fontWeight: 500 };
const portalMutedTextSx = { color: '#475569', fontWeight: 500 };

const reviewCardSx = {
  borderRadius: 3,
  p: 3,
  mb: 3,
  bgcolor: '#fff',
  border: '1px solid rgba(148, 163, 184, 0.35)',
  color: '#0f172a',
};

const reviewSectionTitleSx = {
  mb: 2,
  color: '#0f172a',
  fontWeight: 700,
  fontSize: '0.8rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

const reviewBodyTextSx = { color: '#334155', fontWeight: 500, lineHeight: 1.6 };
const reviewStrongTextSx = { color: '#0f172a', fontWeight: 700 };

const FormField = ({ label, required = false, helperText = '', error = false, children }) => (
  <Box sx={{ width: '100%' }}>
    <Typography
      component="label"
      sx={{
        display: 'block',
        mb: 1,
        fontWeight: 600,
        fontSize: '0.875rem',
        color: error ? 'error.main' : '#334155',
        letterSpacing: '0.01em',
      }}
    >
      {label}
      {required && (
        <Box component="span" sx={{ color: '#dc2626', ml: 0.25 }}>
          *
        </Box>
      )}
    </Typography>
    {children}
    {helperText && (
      <FormHelperText error={error} sx={{ mt: 0.75 }}>
        {helperText}
      </FormHelperText>
    )}
  </Box>
);

const selectMenuProps = {
  PaperProps: {
    sx: {
      borderRadius: 2,
      boxShadow: '0 18px 36px rgba(15, 23, 42, 0.1)',
      bgcolor: 'background.paper',
      border: '1px solid rgba(148, 163, 184, 0.18)',
      minWidth: 260,
    },
  },
  anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
  transformOrigin: { vertical: 'top', horizontal: 'left' },
};

const notificationConfig = {
  submitSuccess: {
    type: 'success',
    title: 'Submitted for MPP Review',
    message: 'Your programme has been submitted successfully and is now awaiting MPP approval.',
    icon: SendOutlinedIcon,
    iconColor: '#2563eb',
    iconBg: '#eff6ff',
  },
  draftSuccess: {
    type: 'success',
    title: 'Draft Saved',
    message: 'Your programme draft has been saved. You can continue editing and submit when ready.',
    icon: SaveOutlinedIcon,
    iconColor: '#7c3aed',
    iconBg: '#f5f3ff',
  },
  error: {
    type: 'error',
    title: 'Action Failed',
    message: '',
    icon: ErrorOutlineIcon,
    iconColor: '#dc2626',
    iconBg: '#fef2f2',
  },
};

const hasUploadedAdvisorSignedForm = (full) => {
  const programme = full?.programme || {};
  const documents = full?.documents || [];
  return Boolean(
    programme.advisorSignedFormPath
    || documents.some((doc) => doc.documentType === 'ADVISOR_SIGNED')
    || full?.advisorApproval?.status === 'APPROVED'
  );
};

const mapSupportingDocumentsFromFull = (full) => (
  (full?.documents || [])
    .filter((doc) => doc.documentType === 'SUPPORTING')
    .map((doc) => ({
      id: doc.id,
      fileName: doc.fileName || 'Supporting document',
      url: resolveProgrammeFileUrl(doc.filePath),
    }))
);

const formatApiError = (error, fallback) => {
  const data = error?.response?.data;
  let message = fallback;
  if (typeof data === 'string') {
    message = data;
  } else if (data?.message) {
    message = data.message;
  } else if (data?.error) {
    message = data.error;
  } else if (error?.message) {
    message = error.message;
  }
  if (message.length > 220) {
    return `${message.slice(0, 217)}...`;
  }
  return message;
};

const CreateProgramme = () => {
  const navigate = useNavigate();
  const { programmeId: routeProgrammeId } = useParams();
  const user = useStoredUser();
  const [formData, setFormData] = useState(initialFormState);
  const [activeStep, setActiveStep] = useState(0);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingExistingDraft, setLoadingExistingDraft] = useState(Boolean(routeProgrammeId));
  const [dialogNotification, setDialogNotification] = useState({
    open: false,
    variant: 'submitSuccess',
    message: '',
  });
  const [errorSnackbar, setErrorSnackbar] = useState({ open: false, message: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [savedProgrammeId, setSavedProgrammeId] = useState(null);
  const [meritPreview, setMeritPreview] = useState(null);
  const [advisorSignedUploaded, setAdvisorSignedUploaded] = useState(false);
  const [uploadedSupportingDocuments, setUploadedSupportingDocuments] = useState([]);
  const [supportingUploading, setSupportingUploading] = useState(false);
  const [certificatePreviewOpen, setCertificatePreviewOpen] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState(DEFAULT_CERTIFICATE_TEMPLATE);

  const showSuccessDialog = (variant, message = '') => {
    setDialogNotification({ open: true, variant, message });
  };

  const showError = (message) => {
    setErrorSnackbar({ open: true, message });
  };

  useEffect(() => {
    if (routeProgrammeId) return;
    const saved = localStorage.getItem('programmeDraft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData({
          ...initialFormState,
          ...parsed,
          committee: normalizeCommittee(parsed.committee),
          advisor: {
            ...initialFormState.advisor,
            ...(parsed.advisor || {}),
            advisorName: parsed.advisor?.advisorName || DEMO_CLUB_ADVISOR.name,
            advisorEmail: parsed.advisor?.advisorEmail || DEMO_CLUB_ADVISOR.email,
          },
        });
      } catch {
        localStorage.removeItem('programmeDraft');
      }
      return;
    }
    if (user.clubName) {
      setFormData((prev) => ({
        ...prev,
        organizerClub: prev.organizerClub || user.clubName,
      }));
    }
  }, [routeProgrammeId, user.clubName]);

  useEffect(() => {
    if (!routeProgrammeId) return;
    let cancelled = false;
    setLoadingExistingDraft(true);
    getProgrammeFull(routeProgrammeId)
      .then((response) => {
        if (cancelled) return;
        const full = response.data;
        const programme = full.programme || {};
        if (programme.status && !isEditableOrganizerDraft({ status: programme.status })) {
          showError('Only draft programmes can be edited here. Opening in view-only mode is not supported yet.');
          navigate('/organizer/programmes', { replace: true });
          return;
        }
        setFormData(mapProgrammeFullToForm(full, initialFormState));
        setSavedProgrammeId(Number(routeProgrammeId));
        setAdvisorSignedUploaded(hasUploadedAdvisorSignedForm(full));
        setUploadedSupportingDocuments(mapSupportingDocumentsFromFull(full));
        if (full.meritPreview) setMeritPreview(full.meritPreview);
      })
      .catch((error) => {
        if (!cancelled) {
          const message = error.response?.data?.message
            || error.response?.data?.error
            || 'Unable to load this programme draft.';
          showError(message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingExistingDraft(false);
      });
    return () => { cancelled = true; };
  }, [routeProgrammeId, navigate]);

  useEffect(() => {
    if (formData.level && (activeStep === 3 || activeStep === 6)) {
      refreshMeritPreview();
    }
  }, [activeStep, formData.level, formData.committee]);

  const clearFieldError = (field) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleFieldChange = (field) => (event) => {
    const value = event.target.value;
    clearFieldError(field);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFilled = (value) => value !== null && value !== undefined && String(value).trim() !== '';

  const validateStep = (step) => {
    const errors = {};

    if (step === 0) {
      if (!isFilled(formData.title)) errors.title = 'Programme title is required.';
      if (!isFilled(formData.category)) errors.category = 'Please select a category.';
      if (!isFilled(formData.level)) errors.level = 'Please select a programme level.';
      if (!isFilled(formData.type)) errors.type = 'Please select a programme type.';
      if (!isFilled(formData.organizerClub)) errors.organizerClub = 'Organizer club is required.';
      if (!isFilled(formData.description)) errors.description = 'Programme description is required.';
      if (!isFilled(formData.objectives)) errors.objectives = 'Objectives are required.';
      if (!isFilled(formData.outcomes)) errors.outcomes = 'Expected outcomes are required.';
    }

    if (step === 1) {
      if (!isFilled(formData.startDate)) errors.startDate = 'Start date is required.';
      if (!isFilled(formData.endDate)) errors.endDate = 'End date is required.';
      if (!isFilled(formData.startTime)) errors.startTime = 'Start time is required.';
      if (!isFilled(formData.endTime)) errors.endTime = 'End time is required.';
      if (!isFilled(formData.registrationOpenDate)) errors.registrationOpenDate = 'Registration open date is required.';
      if (!isFilled(formData.registrationCloseDate)) errors.registrationCloseDate = 'Registration close date is required.';
      if (!isFilled(formData.venue)) errors.venue = 'Venue is required.';
      if (!isFilled(formData.maxParticipants) || Number(formData.maxParticipants) < 1) {
        errors.maxParticipants = 'Maximum participants must be at least 1.';
      }
      const studentCount = Number(formData.expectedStudentParticipants) || 0;
      const staffCount = Number(formData.expectedStaffParticipants) || 0;
      const externalCount = Number(formData.expectedExternalParticipants) || 0;
      const estimatedTotal = studentCount + staffCount + externalCount;
      if (estimatedTotal > Number(formData.maxParticipants || 0)) {
        errors.expectedStudentParticipants = 'Estimated participants cannot exceed the maximum capacity.';
      }
      const tentativeRows = (formData.tentativeSchedule || []).filter(
        (row) => row.timeSlot?.trim() || row.activity?.trim() || row.personInCharge?.trim()
      );
      tentativeRows.forEach((row) => {
        if (!row.timeSlot?.trim()) errors[`tentativeTime_${row.id}`] = 'Time is required.';
        if (!row.activity?.trim()) errors[`tentativeActivity_${row.id}`] = 'Activity is required.';
        if (!row.personInCharge?.trim()) errors[`tentativePic_${row.id}`] = 'Person in charge is required.';
      });
      if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
        errors.endDate = 'End date cannot be before start date.';
      }
      if (
        formData.startDate &&
        formData.endDate &&
        formData.startDate === formData.endDate &&
        formData.startTime &&
        formData.endTime &&
        formData.endTime <= formData.startTime
      ) {
        errors.endTime = 'End time must be after start time on the same day.';
      }
      if (
        formData.registrationOpenDate &&
        formData.registrationCloseDate &&
        formData.registrationCloseDate < formData.registrationOpenDate
      ) {
        errors.registrationCloseDate = 'Registration close date cannot be before open date.';
      }

      if (formData.isPaidProgramme) {
        if (!isFilled(formData.registrationFee) || Number(formData.registrationFee) <= 0) {
          errors.registrationFee = 'Registration fee is required for paid programmes.';
        }
        if (!isFilled(formData.paymentReferenceFormat)) {
          errors.paymentReferenceFormat = 'Payment reference format is required.';
        }
        if (!isFilled(formData.paymentInstructions)) {
          errors.paymentInstructions = 'Payment instructions are required.';
        }
      }

      if (formData.isTeamProgramme) {
        if (!isFilled(formData.minTeamSize) || Number(formData.minTeamSize) < 1) {
          errors.minTeamSize = 'Minimum team size is required.';
        }
        if (!isFilled(formData.maxTeamSize) || Number(formData.maxTeamSize) < 1) {
          errors.maxTeamSize = 'Maximum team size is required.';
        }
        if (
          isFilled(formData.minTeamSize)
          && isFilled(formData.maxTeamSize)
          && Number(formData.minTeamSize) > Number(formData.maxTeamSize)
        ) {
          errors.maxTeamSize = 'Maximum team size cannot be less than minimum.';
        }
      }
    }

    if (step === 2) {
      if (!formData.posterFile && !formData.posterPreview) {
        errors.poster = 'Programme poster is required.';
      }
    }

    if (step === 3) {
      const committeeState = normalizeCommittee(formData.committee);
      const director = committeeState.director;
      if (!isFilled(director.matric)) errors.directorMatric = 'Director matric number is required.';
      if (isFilled(director.matric) && !isFilled(director.name)) {
        errors.directorMatric = 'Student not found. Please register in CampusLink+ first.';
      }
      if (!isFilled(director.name)) errors.directorName = 'Director name is required.';

      const validateMemberRow = (member, matricErrorKey) => {
        if (!isFilled(member.matric)) return;
        if (!isFilled(member.name)) {
          errors[matricErrorKey] = 'Student not found. Please register in CampusLink+ first.';
        }
      };

      committeeState.mtMembers.forEach((m) => validateMemberRow(m, `mtMatric_${m.id}`));
      committeeState.ajkMembers.forEach((m) => validateMemberRow(m, `ajkMatric_${m.id}`));
      committeeState.specialContributions.forEach((m) => {
        validateMemberRow(m, `specialContributionsMatric_${m.id}`);
        if (isFilled(m.matric) && !isFilled(m.contributionDescription)) {
          errors[`specialContributionDesc_${m.id}`] = 'Contribution description is required.';
        }
      });
    }

    if (step === 4) {
      if (!formData.sdgs.length) errors.sdgs = 'Select at least one SDG with your club advisor.';
      (formData.speakers || []).forEach((speaker) => {
        if (!speaker.speakerName?.trim()) return;
        if (speaker.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(speaker.email.trim())) {
          errors[`speakerEmail_${speaker.id}`] = 'Enter a valid email address.';
        }
      });
    }

    if (step === 5) {
      if (!isFilled(formData.advisor.advisorName)) {
        errors.advisorName = 'Club advisor name is required.';
      }
    }

    if (step === 6) {
      // Review step — validation happens on submit.
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCommitteeChange = (group, id, field) => (event) => {
    const value = event.target.value;
    if (group === 'director') {
      if (field === 'matric') clearFieldError('directorMatric');
      if (field === 'name') clearFieldError('directorName');
    }
    setFormData((prev) => {
      const nextCommittee = { ...prev.committee };
      if (group === 'mtMembers' || group === 'ajkMembers' || group === 'specialContributions') {
        nextCommittee[group] = nextCommittee[group].map((member) =>
          member.id === id ? { ...member, [field]: value } : member
        );
      } else {
        nextCommittee[group] = { ...nextCommittee[group], [field]: value };
      }
      return { ...prev, committee: nextCommittee };
    });
  };

  const addCommitteeRow = (group) => {
    setFormData((prev) => {
      const nextCommittee = normalizeCommittee(prev.committee);
      const baseRow = {
        id: Date.now(),
        matric: '',
        name: '',
        faculty: '',
      };
      if (group === 'mtMembers') {
        nextCommittee[group] = [...nextCommittee[group], { ...baseRow, position: '', committeeRole: 'MT_PROGRAM' }];
      } else if (group === 'ajkMembers') {
        nextCommittee[group] = [...nextCommittee[group], { ...baseRow, role: '', committeeRole: 'AJK_PROGRAM' }];
      } else if (group === 'specialContributions') {
        nextCommittee[group] = [
          ...nextCommittee[group],
          { ...baseRow, contributionDescription: '', committeeRole: 'SPECIAL_CONTRIBUTION' },
        ];
      }
      return { ...prev, committee: nextCommittee };
    });
  };

  const removeCommitteeRow = (group, id) => {
    setFormData((prev) => {
      const nextCommittee = normalizeCommittee(prev.committee);
      nextCommittee[group] = nextCommittee[group].filter((member) => member.id !== id);
      return { ...prev, committee: nextCommittee };
    });
  };

  const handleBudgetAmountChange = (category) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      budgetLines: prev.budgetLines.map((line) => (
        line.category === category ? { ...line, amount: value } : line
      )),
    }));
  };

  const handleTentativeChange = (id, field) => (event) => {
    const value = event.target.value;
    clearFieldError(`tentative${field === 'timeSlot' ? 'Time' : field === 'activity' ? 'Activity' : 'Pic'}_${id}`);
    setFormData((prev) => ({
      ...prev,
      tentativeSchedule: prev.tentativeSchedule.map((row) => (
        row.id === id ? { ...row, [field]: value } : row
      )),
    }));
  };

  const addTentativeRow = () => {
    setFormData((prev) => ({
      ...prev,
      tentativeSchedule: [...prev.tentativeSchedule, createEmptyTentativeRow(Date.now())],
    }));
  };

  const removeTentativeRow = (id) => {
    setFormData((prev) => {
      const nextRows = prev.tentativeSchedule.filter((row) => row.id !== id);
      return {
        ...prev,
        tentativeSchedule: nextRows.length ? nextRows : [createEmptyTentativeRow(1)],
      };
    });
  };

  const handleSpeakerChange = (id, field) => (event) => {
    const value = event.target.value;
    if (field === 'email') clearFieldError(`speakerEmail_${id}`);
    setFormData((prev) => ({
      ...prev,
      speakers: prev.speakers.map((speaker) => (
        speaker.id === id ? { ...speaker, [field]: value } : speaker
      )),
    }));
  };

  const addSpeakerRow = () => {
    setFormData((prev) => ({
      ...prev,
      speakers: [...prev.speakers, createEmptySpeakerRow(Date.now())],
    }));
  };

  const removeSpeakerRow = (id) => {
    setFormData((prev) => ({
      ...prev,
      speakers: prev.speakers.filter((speaker) => speaker.id !== id),
    }));
  };

  const handleSpeakerCvSelect = (id) => (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFormData((prev) => ({
      ...prev,
      speakers: prev.speakers.map((speaker) => (
        speaker.id === id
          ? { ...speaker, cvFile: file, cvFileName: file.name, cvPath: '' }
          : speaker
      )),
    }));
  };

  const handleProposalAttachmentSelect = (field, previewField, nameField) => (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFormData((prev) => ({
      ...prev,
      [field]: file,
      [nameField]: file.name,
      [previewField]: '',
    }));
  };

  const handleSdgToggle = (sdgNumber) => () => {
    clearFieldError('sdgs');
    setFormData((prev) => {
      const selected = prev.sdgs.includes(sdgNumber)
        ? prev.sdgs.filter((item) => item !== sdgNumber)
        : [...prev.sdgs, sdgNumber];
      return { ...prev, sdgs: selected };
    });
  };

  const handleDownloadProgrammePdf = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const { blob, fileName } = await generateProgrammeFormPdf(
        {
          ...formData,
          supportingDocumentCount: uploadedSupportingDocuments.length,
        },
        user.fullName || '',
        meritPreview,
        { download: true }
      );
      const file = new File([blob], fileName, { type: 'application/pdf' });
      setFormData((prev) => ({ ...prev, applicationPdfFile: file }));
    } catch (error) {
      showError('Failed to generate programme PDF. Please try again.');
    }
  };

  const handleSignedFormUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showError('Please upload a PDF file with the advisor signature.');
      return;
    }

    clearFieldError('signedAdvisorForm');
    setFormData((prev) => ({
      ...prev,
      signedAdvisorForm: file,
      signedAdvisorFormName: file.name,
    }));
    setAdvisorSignedUploaded(false);

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user?.id) return;
      const programmeId = savedProgrammeId || (await persistDraft()).id;
      await uploadAdvisorSigned(programmeId, file, user.id);
      setAdvisorSignedUploaded(true);
      setFormData((prev) => ({ ...prev, signedAdvisorForm: null }));
    } catch (error) {
      showError(formatApiError(error, 'Unable to upload advisor-signed form. Save draft and try again.'));
    }
  };

  const handleSupportingDocumentsAdd = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    const remainingSlots = MAX_SUPPORTING_DOCUMENTS - uploadedSupportingDocuments.length;
    if (remainingSlots <= 0) {
      showError(`You can upload up to ${MAX_SUPPORTING_DOCUMENTS} optional supporting documents.`);
      return;
    }

    const selectedFiles = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      showError(`Only ${remainingSlots} more supporting document(s) can be added.`);
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user?.id) {
        showError('Your session has expired. Please log in again.');
        return;
      }
      setSupportingUploading(true);
      const programmeId = savedProgrammeId || (await persistDraft()).id;
      const response = await uploadSupportingDocuments(programmeId, selectedFiles, user.id);
      const uploaded = (response.data || []).map((doc) => ({
        id: doc.id,
        fileName: doc.fileName || 'Supporting document',
        url: resolveProgrammeFileUrl(doc.filePath),
      }));
      setUploadedSupportingDocuments((prev) => [...prev, ...uploaded]);
    } catch (error) {
      showError(formatApiError(error, 'Unable to upload supporting documents.'));
    } finally {
      setSupportingUploading(false);
    }
  };

  const handleRemoveSupportingDocument = async (documentId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user?.id || !savedProgrammeId) return;
      await deleteSupportingDocument(savedProgrammeId, documentId, user.id);
      setUploadedSupportingDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
    } catch (error) {
      showError(formatApiError(error, 'Unable to remove supporting document.'));
    }
  };

  const openCertificatePreview = (templateId = formData.certificateTemplate) => {
    setPreviewTemplateId(templateId);
    setCertificatePreviewOpen(true);
  };

  const handlePosterSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, posterFile: file, posterPreview: previewUrl }));
  };

  const handlePosterDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, posterFile: file, posterPreview: previewUrl }));
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleNext = async () => {
    if (!validateStep(activeStep)) {
      showError('Please complete all required fields before continuing.');
      return;
    }

    if (activeStep === 4) {
      try {
        setSavingDraft(true);
        await persistDraft();
      } catch (error) {
        showError(formatApiError(error, 'Please save your draft before continuing to supporting documents.'));
        return;
      } finally {
        setSavingDraft(false);
      }
    }

    if (activeStep < stepLabels.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const buildCommitteeMembers = () => {
    const members = [];
    const committee = normalizeCommittee(formData.committee);
    const director = committee.director;
    if (director.matric && director.name) {
      members.push({
        matricNumber: director.matric,
        fullName: director.name,
        faculty: director.faculty,
        committeeRole: 'PENGARAH_PROGRAM',
        positionLabel: 'Programme Director (Pengarah Program)',
      });
    }
    committee.mtMembers.forEach((member) => {
      if (member.matric && member.name) {
        members.push({
          matricNumber: member.matric,
          fullName: member.name,
          faculty: member.faculty,
          committeeRole: 'MT_PROGRAM',
          positionLabel: member.position || 'MT Programme (Majlis Tertinggi Program)',
        });
      }
    });
    committee.ajkMembers.forEach((member) => {
      if (member.matric && member.name) {
        members.push({
          matricNumber: member.matric,
          fullName: member.name,
          faculty: member.faculty,
          committeeRole: 'AJK_PROGRAM',
          positionLabel: member.role || 'AJK Programme',
        });
      }
    });
    committee.specialContributions.forEach((member) => {
      if (member.matric && member.name) {
        members.push({
          matricNumber: member.matric,
          fullName: member.name,
          faculty: member.faculty,
          committeeRole: 'SPECIAL_CONTRIBUTION',
          contributionDescription: member.contributionDescription,
          positionLabel: 'Special Contribution (Sumbangan Khas)',
        });
      }
    });
    return members;
  };

  const buildDraftPayload = () => ({
    id: savedProgrammeId,
    title: formData.title,
    description: formData.description,
    category: formData.category,
    programmeLevel: formData.level,
    programmeType: formData.type,
    organizerClub: formData.organizerClub,
    objectives: formData.objectives,
    expectedOutcomes: formData.outcomes,
    venue: formData.venue,
    googleMapsLink: formData.googleMapsLocation,
    communicationLink: formData.communicationLink,
    customRegistrationFields: (formData.customRegistrationFields || [])
      .filter((field) => field.label?.trim())
      .map((field, index) => ({
        id: field.id || `field-${index + 1}`,
        label: field.label.trim(),
        required: Boolean(field.required),
        fieldType: 'TEXT',
      })),
    startDate: formData.startDate,
    endDate: formData.endDate,
    startTime: formData.startTime,
    endTime: formData.endTime,
    registrationOpenDate: formData.registrationOpenDate,
    registrationCloseDate: formData.registrationCloseDate,
    collaboratingOrganization: formData.collaboratingOrganization,
    sponsorshipInfo: formData.sponsorshipInfo,
    expectedParticipants: parseInt(formData.maxParticipants || 0, 10),
    expectedStudentParticipants: formData.expectedStudentParticipants
      ? parseInt(formData.expectedStudentParticipants, 10) : null,
    expectedStaffParticipants: formData.expectedStaffParticipants
      ? parseInt(formData.expectedStaffParticipants, 10) : null,
    expectedExternalParticipants: formData.expectedExternalParticipants
      ? parseInt(formData.expectedExternalParticipants, 10) : null,
    budgetLines: buildBudgetLinesPayload(formData.budgetLines),
    tentativeSchedule: buildTentativePayload(formData.tentativeSchedule),
    speakers: buildSpeakersPayload(formData.speakers),
    isPaid: formData.isPaidProgramme,
    registrationFee: formData.registrationFee ? parseFloat(formData.registrationFee) : null,
    paymentInstructions: formData.paymentInstructions,
    paymentReferenceFormat: formData.paymentReferenceFormat,
    isTeamProgramme: formData.isTeamProgramme,
    teamNameRequired: formData.teamNameRequired,
    minTeamSize: formData.minTeamSize ? parseInt(formData.minTeamSize, 10) : null,
    maxTeamSize: formData.maxTeamSize ? parseInt(formData.maxTeamSize, 10) : null,
    certificateMode: formData.certificateMode || 'SYSTEM',
    certificateTemplate: formData.certificateTemplate || DEFAULT_CERTIFICATE_TEMPLATE,
    certificateOrientation: formData.certificateOrientation || DEFAULT_CERTIFICATE_ORIENTATION,
    status: 'DRAFT',
    committeeMembers: buildCommitteeMembers(),
    sdgNumbers: [...new Set(formData.sdgs)],
    advisor: {
      ...formData.advisor,
      approvalMethod: 'OFFLINE',
    },
    posterFile: formData.posterFile,
    proposalPaperFile: formData.proposalPaperFile,
    sponsorLetterFile: formData.sponsorLetterFile,
    riskAssessmentFile: formData.riskAssessmentFile,
    speakerRows: formData.speakers,
    applicationPdfFile: formData.applicationPdfFile,
    paymentQrFile: formData.paymentQrFile,
  });

  const refreshMeritPreview = async () => {
    if (!formData.level) return;
    try {
      const response = await previewMerit(formData.level, buildCommitteeMembers());
      setMeritPreview(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCommitteeMatricResolved = (group, id) => (resolved) => {
    if (resolved.reset) {
      setFormData((prev) => {
        const nextCommittee = { ...prev.committee };
        if (group === 'mtMembers' || group === 'ajkMembers' || group === 'specialContributions') {
          nextCommittee[group] = nextCommittee[group].map((member) =>
            member.id === id
              ? { ...member, matric: resolved.matricNumber, name: '', faculty: '' }
              : member
          );
        } else {
          nextCommittee[group] = {
            ...nextCommittee[group],
            matric: resolved.matricNumber,
            name: '',
            faculty: '',
          };
        }
        return { ...prev, committee: nextCommittee };
      });
      return;
    }

    setFormData((prev) => {
      const nextCommittee = { ...prev.committee };
      if (group === 'mtMembers' || group === 'ajkMembers' || group === 'specialContributions') {
        nextCommittee[group] = nextCommittee[group].map((member) =>
          member.id === id
            ? {
                ...member,
                matric: resolved.matricNumber || member.matric,
                name: resolved.fullName || member.name,
                faculty: resolved.faculty || member.faculty,
              }
            : member
        );
      } else {
        nextCommittee[group] = {
          ...nextCommittee[group],
          matric: resolved.matricNumber || nextCommittee[group].matric,
          name: resolved.fullName || nextCommittee[group].name,
          faculty: resolved.faculty || nextCommittee[group].faculty,
        };
      }
      return { ...prev, committee: nextCommittee };
    });
  };

  const ensureApplicationPdf = async () => {
    if (formData.applicationPdfFile) return formData.applicationPdfFile;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const { blob, fileName } = await generateProgrammeFormPdf(
      formData,
      user.fullName || '',
      meritPreview,
      { download: false }
    );
    const file = new File([blob], fileName, { type: 'application/pdf' });
    setFormData((prev) => ({ ...prev, applicationPdfFile: file }));
    return file;
  };

  const persistDraft = async (overrides = {}) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const payload = { ...buildDraftPayload(), ...overrides };
    const response = await saveProgrammeDraft(payload, user.id, savedProgrammeId);
    setSavedProgrammeId(response.data.id);
    return response.data;
  };

  const handleSaveDraft = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        showError('Your session has expired. Please log in again.');
        return;
      }
      setSavingDraft(true);
      await persistDraft();
      showSuccessDialog('draftSuccess');
    } catch (error) {
      showError(formatApiError(error, 'Failed to save draft.'));
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmitToMpp = async () => {
    if (!validateStep(0) || !validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4) || !validateStep(5) || !validateStep(6)) {
      showError('Please complete all required fields before MPP submission.');
      return;
    }

    if (!formData.signedAdvisorForm && !advisorSignedUploaded) {
      setFieldErrors((prev) => ({
        ...prev,
        signedAdvisorForm: 'Attach the advisor-signed programme form before submitting to MPP.',
      }));
      showError('Please choose the advisor-signed programme form before submitting to MPP.');
      return;
    }

    if (!formData.advisor.advisorName) {
      showError('Please enter the club advisor name before submitting to MPP.');
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        showError('Your session has expired. Please log in again.');
        return;
      }

      setSubmitting(true);
      const applicationPdfFile = await ensureApplicationPdf();
      const saved = await persistDraft({
        applicationPdfFile,
        advisor: {
          ...formData.advisor,
          approvalMethod: 'OFFLINE',
        },
      });

      if (formData.signedAdvisorForm) {
        await uploadAdvisorSigned(saved.id, formData.signedAdvisorForm, user.id);
        setAdvisorSignedUploaded(true);
      }

      await submitToMpp(saved.id, user.id);
      showSuccessDialog('submitSuccess');
    } catch (error) {
      showError(formatApiError(error, 'Failed to submit programme to MPP. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const activeNotification = notificationConfig[dialogNotification.variant] || notificationConfig.error;
  const NotificationIcon = activeNotification.icon;
  const dialogMessage = dialogNotification.message || activeNotification.message;

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <FormSection title="Basic details" subtitle="Tell us what your programme is about.">
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <FormField
                    label="Programme Title"
                    required
                    helperText={fieldErrors.title || 'Give your programme a clear, descriptive name'}
                    error={Boolean(fieldErrors.title)}
                  >
                    <TextField
                      hiddenLabel
                      variant="outlined"
                      fullWidth
                      placeholder="e.g. Leadership Bootcamp 2026"
                      value={formData.title}
                      onChange={handleFieldChange('title')}
                      error={Boolean(fieldErrors.title)}
                      sx={{ '& .MuiOutlinedInput-root': inputRootSx(Boolean(formData.title)) }}
                    />
                  </FormField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormField
                    label="Programme Category"
                    required
                    helperText={fieldErrors.category}
                    error={Boolean(fieldErrors.category)}
                  >
                    <FormControl fullWidth error={Boolean(fieldErrors.category)} sx={{ minHeight: 52 }}>
                      <Select
                        displayEmpty
                        fullWidth
                        value={formData.category}
                        onChange={handleFieldChange('category')}
                        MenuProps={selectMenuProps}
                        sx={inputRootSx(Boolean(formData.category))}
                        renderValue={(selected) =>
                          selected || (
                            <Typography sx={{ color: '#94a3b8' }}>Select a category</Typography>
                          )
                        }
                      >
                        <MenuItem value="" disabled>
                          Select a category
                        </MenuItem>
                        {categoryOptions.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </FormField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormField
                    label="Programme Level"
                    required
                    helperText={fieldErrors.level}
                    error={Boolean(fieldErrors.level)}
                  >
                    <FormControl fullWidth error={Boolean(fieldErrors.level)} sx={{ minHeight: 52 }}>
                      <Select
                        displayEmpty
                        fullWidth
                        value={formData.level}
                        onChange={handleFieldChange('level')}
                        MenuProps={selectMenuProps}
                        sx={inputRootSx(Boolean(formData.level))}
                        renderValue={(selected) =>
                          selected || (
                            <Typography sx={{ color: '#94a3b8' }}>Select programme level</Typography>
                          )
                        }
                      >
                        <MenuItem value="" disabled>
                          Select programme level
                        </MenuItem>
                        {levelOptions.map((level) => (
                          <MenuItem key={level} value={level}>
                            {level}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </FormField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormField
                    label="Programme Type"
                    required
                    helperText={fieldErrors.type}
                    error={Boolean(fieldErrors.type)}
                  >
                    <FormControl fullWidth error={Boolean(fieldErrors.type)} sx={{ minHeight: 52 }}>
                      <Select
                        displayEmpty
                        fullWidth
                        value={formData.type}
                        onChange={handleFieldChange('type')}
                        MenuProps={selectMenuProps}
                        sx={inputRootSx(Boolean(formData.type))}
                        renderValue={(selected) =>
                          selected || (
                            <Typography sx={{ color: '#94a3b8' }}>Select programme type</Typography>
                          )
                        }
                      >
                        <MenuItem value="" disabled>
                          Select programme type
                        </MenuItem>
                        {programmeTypes.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </FormField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormField
                    label="Organizer Club"
                    required
                    helperText={fieldErrors.organizerClub || 'The club or faculty organising this programme'}
                    error={Boolean(fieldErrors.organizerClub)}
                  >
                    <TextField
                      hiddenLabel
                      variant="outlined"
                      fullWidth
                      placeholder="e.g. Computer Science Club"
                      value={formData.organizerClub}
                      onChange={handleFieldChange('organizerClub')}
                      error={Boolean(fieldErrors.organizerClub)}
                      sx={{ '& .MuiOutlinedInput-root': inputRootSx(Boolean(formData.organizerClub)) }}
                    />
                  </FormField>
                </Grid>
              </Grid>
            </FormSection>

            <FormSection title="Programme content" subtitle="Describe the purpose and expected results.">
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <FormField
                    label="Programme Description"
                    required
                    helperText={fieldErrors.description}
                    error={Boolean(fieldErrors.description)}
                  >
                    <TextField
                      hiddenLabel
                      variant="outlined"
                      fullWidth
                      multiline
                      minRows={4}
                      placeholder="Describe what participants will experience..."
                      value={formData.description}
                      onChange={handleFieldChange('description')}
                      error={Boolean(fieldErrors.description)}
                      sx={{ '& .MuiOutlinedInput-root': inputRootSx(Boolean(formData.description)) }}
                    />
                  </FormField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormField
                    label="Objectives"
                    required
                    helperText={fieldErrors.objectives}
                    error={Boolean(fieldErrors.objectives)}
                  >
                    <TextField
                      hiddenLabel
                      variant="outlined"
                      fullWidth
                      multiline
                      minRows={5}
                      placeholder="List the programme goals..."
                      value={formData.objectives}
                      onChange={handleFieldChange('objectives')}
                      error={Boolean(fieldErrors.objectives)}
                      sx={{ '& .MuiOutlinedInput-root': inputRootSx(Boolean(formData.objectives)) }}
                    />
                  </FormField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormField
                    label="Expected Outcomes"
                    required
                    helperText={fieldErrors.outcomes}
                    error={Boolean(fieldErrors.outcomes)}
                  >
                    <TextField
                      hiddenLabel
                      variant="outlined"
                      fullWidth
                      multiline
                      minRows={5}
                      placeholder="What should participants achieve?"
                      value={formData.outcomes}
                      onChange={handleFieldChange('outcomes')}
                      error={Boolean(fieldErrors.outcomes)}
                      sx={{ '& .MuiOutlinedInput-root': inputRootSx(Boolean(formData.outcomes)) }}
                    />
                  </FormField>
                </Grid>
              </Grid>
            </FormSection>
          </Box>
        );

      case 1:
        return (
          <Box>
            <FormSection
              title="Programme schedule"
              subtitle="Set when your programme runs, including start and end times."
            >
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormField
                    label="Start Date"
                    required
                    helperText={fieldErrors.startDate}
                    error={Boolean(fieldErrors.startDate)}
                  >
                    <TextField
                      hiddenLabel
                      variant="outlined"
                      fullWidth
                      type="date"
                      value={formData.startDate}
                      onChange={handleFieldChange('startDate')}
                      error={Boolean(fieldErrors.startDate)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <CalendarMonthIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': inputRootSx(Boolean(formData.startDate)) }}
                    />
                  </FormField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormField
                    label="Start Time"
                    required
                    helperText={fieldErrors.startTime || 'When the programme begins'}
                    error={Boolean(fieldErrors.startTime)}
                  >
                    <TextField
                      hiddenLabel
                      variant="outlined"
                      fullWidth
                      type="time"
                      value={formData.startTime}
                      onChange={handleFieldChange('startTime')}
                      error={Boolean(fieldErrors.startTime)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <AccessTimeIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': inputRootSx(Boolean(formData.startTime)) }}
                    />
                  </FormField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormField
                    label="End Date"
                    required
                    helperText={fieldErrors.endDate}
                    error={Boolean(fieldErrors.endDate)}
                  >
                    <TextField
                      hiddenLabel
                      variant="outlined"
                      fullWidth
                      type="date"
                      value={formData.endDate}
                      onChange={handleFieldChange('endDate')}
                      error={Boolean(fieldErrors.endDate)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <CalendarMonthIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': inputRootSx(Boolean(formData.endDate)) }}
                    />
                  </FormField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormField
                    label="End Time"
                    required
                    helperText={fieldErrors.endTime || 'When the programme ends'}
                    error={Boolean(fieldErrors.endTime)}
                  >
                    <TextField
                      hiddenLabel
                      variant="outlined"
                      fullWidth
                      type="time"
                      value={formData.endTime}
                      onChange={handleFieldChange('endTime')}
                      error={Boolean(fieldErrors.endTime)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <AccessTimeIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': inputRootSx(Boolean(formData.endTime)) }}
                    />
                  </FormField>
                </Grid>
              </Grid>
            </FormSection>

            <FormSection title="Registration period" subtitle="When can students register for this programme?">
              <Grid container spacing={2.5}>
                <Grid item xs={12} md={6}>
                  <FormField
                    label="Registration Open Date"
                    required
                    helperText={fieldErrors.registrationOpenDate || 'When registration becomes available'}
                    error={Boolean(fieldErrors.registrationOpenDate)}
                  >
                    <TextField
                      hiddenLabel
                      variant="outlined"
                      fullWidth
                      type="date"
                      value={formData.registrationOpenDate}
                      onChange={handleFieldChange('registrationOpenDate')}
                      error={Boolean(fieldErrors.registrationOpenDate)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <CalendarMonthIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': inputRootSx(Boolean(formData.registrationOpenDate)),
                      }}
                    />
                  </FormField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormField
                    label="Registration Close Date"
                    required
                    helperText={fieldErrors.registrationCloseDate || 'Last day students can register'}
                    error={Boolean(fieldErrors.registrationCloseDate)}
                  >
                    <TextField
                      hiddenLabel
                      variant="outlined"
                      fullWidth
                      type="date"
                      value={formData.registrationCloseDate}
                      onChange={handleFieldChange('registrationCloseDate')}
                      error={Boolean(fieldErrors.registrationCloseDate)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <CalendarMonthIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': inputRootSx(Boolean(formData.registrationCloseDate)),
                      }}
                    />
                  </FormField>
                </Grid>
              </Grid>
            </FormSection>

            <FormSection title="Venue & capacity">
              <Grid container spacing={2.5}>
                <Grid item xs={12} md={6}>
                  <FormField
                    label="Venue"
                    required
                    helperText={fieldErrors.venue || 'Example: Kompleks Sukan, Dewan Utama'}
                    error={Boolean(fieldErrors.venue)}
                  >
                    <TextField
                      hiddenLabel
                      variant="outlined"
                      fullWidth
                      placeholder="Enter programme venue"
                      value={formData.venue}
                      onChange={handleFieldChange('venue')}
                      error={Boolean(fieldErrors.venue)}
                      sx={{ '& .MuiOutlinedInput-root': inputRootSx(Boolean(formData.venue)) }}
                    />
                  </FormField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormField
                    label="Maximum Participants"
                    required
                    helperText={fieldErrors.maxParticipants || 'Upper limit for registrations'}
                    error={Boolean(fieldErrors.maxParticipants)}
                  >
                    <TextField
                      hiddenLabel
                      variant="outlined"
                      fullWidth
                      type="number"
                      inputProps={{ min: 1 }}
                      placeholder="e.g. 50"
                      value={formData.maxParticipants}
                      onChange={handleFieldChange('maxParticipants')}
                      error={Boolean(fieldErrors.maxParticipants)}
                      sx={{
                        '& .MuiOutlinedInput-root': inputRootSx(Boolean(formData.maxParticipants)),
                      }}
                    />
                  </FormField>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 1.5 }}>
                    Participant estimation
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormField
                    label="Expected Student Participants"
                    helperText={fieldErrors.expectedStudentParticipants}
                    error={Boolean(fieldErrors.expectedStudentParticipants)}
                  >
                    <TextField
                      hiddenLabel
                      variant="outlined"
                      fullWidth
                      type="number"
                      inputProps={{ min: 0 }}
                      value={formData.expectedStudentParticipants}
                      onChange={handleFieldChange('expectedStudentParticipants')}
                      sx={{
                        '& .MuiOutlinedInput-root': inputRootSx(Boolean(formData.expectedStudentParticipants)),
                      }}
                    />
                  </FormField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormField label="Expected Staff Participants">
                    <TextField
                      hiddenLabel
                      variant="outlined"
                      fullWidth
                      type="number"
                      inputProps={{ min: 0 }}
                      value={formData.expectedStaffParticipants}
                      onChange={handleFieldChange('expectedStaffParticipants')}
                      sx={{
                        '& .MuiOutlinedInput-root': inputRootSx(Boolean(formData.expectedStaffParticipants)),
                      }}
                    />
                  </FormField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormField label="Expected External Participants">
                    <TextField
                      hiddenLabel
                      variant="outlined"
                      fullWidth
                      type="number"
                      inputProps={{ min: 0 }}
                      value={formData.expectedExternalParticipants}
                      onChange={handleFieldChange('expectedExternalParticipants')}
                      sx={{
                        '& .MuiOutlinedInput-root': inputRootSx(Boolean(formData.expectedExternalParticipants)),
                      }}
                    />
                  </FormField>
                </Grid>
                <Grid item xs={12}>
                  <FormField
                    label="Google Maps Location"
                    helperText="Optional — paste a Google Maps link for easier navigation"
                  >
                    <TextField
                      hiddenLabel
                      variant="outlined"
                      fullWidth
                      placeholder="https://maps.google.com/..."
                      value={formData.googleMapsLocation}
                      onChange={handleFieldChange('googleMapsLocation')}
                      sx={{
                        '& .MuiOutlinedInput-root': inputRootSx(Boolean(formData.googleMapsLocation)),
                      }}
                    />
                  </FormField>
                </Grid>
                <Grid item xs={12}>
                  <FormField
                    label="Participant Group Link (Telegram / WhatsApp)"
                    helperText="Optional. Most programmes use a group so participants can get updates and coordinate easily. The link is only shown to students after their registration is fully confirmed."
                  >
                    <TextField
                      hiddenLabel
                      variant="outlined"
                      fullWidth
                      placeholder="https://t.me/your_group or https://chat.whatsapp.com/..."
                      value={formData.communicationLink}
                      onChange={handleFieldChange('communicationLink')}
                      sx={{
                        '& .MuiOutlinedInput-root': inputRootSx(Boolean(formData.communicationLink)),
                      }}
                    />
                  </FormField>
                </Grid>
              </Grid>
            </FormSection>

            <FormSection
              title="Programme tentative"
              subtitle="Outline the day-by-day or session-by-session schedule for your programme."
            >
              <Card sx={{ borderRadius: 3, overflowX: 'auto' }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                  <Box component="thead" sx={{ backgroundColor: '#e2e8f0' }}>
                    <Box component="tr">
                      <Box component="th" sx={{ ...committeeTableHeadSx, textAlign: 'left', py: 2, px: 2 }}>Time</Box>
                      <Box component="th" sx={{ ...committeeTableHeadSx, textAlign: 'left', py: 2, px: 2 }}>Activity</Box>
                      <Box component="th" sx={{ ...committeeTableHeadSx, textAlign: 'left', py: 2, px: 2 }}>Person in Charge</Box>
                      <Box component="th" sx={{ ...committeeTableHeadSx, textAlign: 'center', py: 2, px: 2, width: 90 }}>Action</Box>
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {(formData.tentativeSchedule || []).map((row) => (
                      <Box component="tr" key={row.id} sx={{ borderTop: '1px solid rgba(148, 163, 184, 0.25)' }}>
                        <Box component="td" sx={{ p: 1.5, verticalAlign: 'top' }}>
                          <TextField
                            hiddenLabel
                            variant="outlined"
                            fullWidth
                            placeholder="08:00 - 09:00"
                            value={row.timeSlot}
                            onChange={handleTentativeChange(row.id, 'timeSlot')}
                            error={Boolean(fieldErrors[`tentativeTime_${row.id}`])}
                            helperText={fieldErrors[`tentativeTime_${row.id}`]}
                            size="small"
                          />
                        </Box>
                        <Box component="td" sx={{ p: 1.5, verticalAlign: 'top' }}>
                          <TextField
                            hiddenLabel
                            variant="outlined"
                            fullWidth
                            placeholder="Registration & briefing"
                            value={row.activity}
                            onChange={handleTentativeChange(row.id, 'activity')}
                            error={Boolean(fieldErrors[`tentativeActivity_${row.id}`])}
                            helperText={fieldErrors[`tentativeActivity_${row.id}`]}
                            size="small"
                          />
                        </Box>
                        <Box component="td" sx={{ p: 1.5, verticalAlign: 'top' }}>
                          <TextField
                            hiddenLabel
                            variant="outlined"
                            fullWidth
                            placeholder="Name / committee role"
                            value={row.personInCharge}
                            onChange={handleTentativeChange(row.id, 'personInCharge')}
                            error={Boolean(fieldErrors[`tentativePic_${row.id}`])}
                            helperText={fieldErrors[`tentativePic_${row.id}`]}
                            size="small"
                          />
                        </Box>
                        <Box component="td" sx={{ p: 1.5, textAlign: 'center', verticalAlign: 'top' }}>
                          <Button
                            color="error"
                            variant="outlined"
                            size="small"
                            onClick={() => removeTentativeRow(row.id)}
                            disabled={(formData.tentativeSchedule || []).length <= 1}
                          >
                            Remove
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Card>
              <Button variant="outlined" sx={{ mt: 2 }} onClick={addTentativeRow}>
                Add schedule row
              </Button>
            </FormSection>

            <FormSection
              title="Registration settings"
              subtitle="Configure optional student questions, payment details, and team registration."
            >
              <Stack spacing={2.5}>
                <Box sx={registrationPanelSx}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 0.5, color: '#0f172a' }}>
                    Extra information from students
                  </Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '0.8rem', mb: 1.5 }}>
                    Add any additional fields students must complete during registration (e.g. T-shirt size, dietary requirements).
                  </Typography>
                  <Stack spacing={1.5}>
                    {(formData.customRegistrationFields || []).map((field, index) => (
                      <Box
                        key={field.id || `custom-field-${index}`}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', md: '1fr auto auto' },
                          gap: 1.5,
                          alignItems: 'center',
                          p: 1.5,
                          borderRadius: '10px',
                          border: '1px solid rgba(37, 99, 235, 0.12)',
                          bgcolor: '#fff',
                        }}
                      >
                        <TextField
                          hiddenLabel
                          variant="outlined"
                          fullWidth
                          placeholder="Field label (e.g. T-Shirt Size)"
                          value={field.label}
                          onChange={(e) => setFormData((prev) => ({
                            ...prev,
                            customRegistrationFields: prev.customRegistrationFields.map((item, i) => (
                              i === index ? { ...item, label: e.target.value } : item
                            )),
                          }))}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={Boolean(field.required)}
                              onChange={(e) => setFormData((prev) => ({
                                ...prev,
                                customRegistrationFields: prev.customRegistrationFields.map((item, i) => (
                                  i === index ? { ...item, required: e.target.checked } : item
                                )),
                              }))}
                            />
                          }
                          label="Required"
                        />
                        <Button
                          color="error"
                          variant="outlined"
                          onClick={() => setFormData((prev) => ({
                            ...prev,
                            customRegistrationFields: prev.customRegistrationFields.filter((_, i) => i !== index),
                          }))}
                        >
                          Remove
                        </Button>
                      </Box>
                    ))}
                    <Button
                      variant="outlined"
                      onClick={() => setFormData((prev) => ({
                        ...prev,
                        customRegistrationFields: [
                          ...(prev.customRegistrationFields || []),
                          { id: `field-${Date.now()}`, label: '', required: false },
                        ],
                      }))}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      Add Field
                    </Button>
                  </Stack>
                </Box>

                <Box sx={registrationPanelSx}>
                  <FormControlLabel
                    sx={registrationOptionLabelSx}
                    control={
                      <Checkbox
                        checked={formData.isPaidProgramme}
                        onChange={(e) => setFormData((p) => ({ ...p, isPaidProgramme: e.target.checked }))}
                      />
                    }
                    label="Paid programme (requires payment receipt verification)"
                  />
                  {formData.isPaidProgramme && (
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid item xs={12} sm={4}>
                        <FormField
                          label="Registration Fee (RM)"
                          required
                          error={Boolean(fieldErrors.registrationFee)}
                          helperText={fieldErrors.registrationFee}
                        >
                          <TextField
                            hiddenLabel
                            fullWidth
                            type="number"
                            inputProps={{ min: 0, step: 0.01 }}
                            placeholder="e.g. 20"
                            value={formData.registrationFee}
                            onChange={handleFieldChange('registrationFee')}
                            error={Boolean(fieldErrors.registrationFee)}
                            sx={{ '& .MuiOutlinedInput-root': inputRootSx(Boolean(formData.registrationFee)) }}
                          />
                        </FormField>
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <FormField
                          label="Payment Reference Format"
                          required
                          helperText={fieldErrors.paymentReferenceFormat || 'Students will use this format when paying (include MatricNumber as placeholder).'}
                          error={Boolean(fieldErrors.paymentReferenceFormat)}
                        >
                          <TextField
                            hiddenLabel
                            fullWidth
                            placeholder="e.g. BengkelRobotik_MatricNumber"
                            value={formData.paymentReferenceFormat}
                            onChange={handleFieldChange('paymentReferenceFormat')}
                            error={Boolean(fieldErrors.paymentReferenceFormat)}
                            sx={{ '& .MuiOutlinedInput-root': inputRootSx(Boolean(formData.paymentReferenceFormat)) }}
                          />
                        </FormField>
                      </Grid>
                      <Grid item xs={12} md={7}>
                        <FormField
                          label="Payment Instructions"
                          required
                          error={Boolean(fieldErrors.paymentInstructions)}
                          helperText={fieldErrors.paymentInstructions}
                        >
                          <TextField
                            hiddenLabel
                            fullWidth
                            multiline
                            minRows={4}
                            placeholder="e.g. Transfer RM20 to Maybank 1234-5678-9012 (Kelab Robotics UMT) and upload your receipt."
                            value={formData.paymentInstructions}
                            onChange={handleFieldChange('paymentInstructions')}
                            error={Boolean(fieldErrors.paymentInstructions)}
                            sx={{ '& .MuiOutlinedInput-root': inputRootSx(Boolean(formData.paymentInstructions)) }}
                          />
                        </FormField>
                      </Grid>
                      <Grid item xs={12} md={5}>
                        <FormField
                          label="Payment QR Image"
                          helperText="Optional QR code for FPX / bank transfer."
                        >
                          <Box
                            sx={{
                              border: '1px dashed rgba(37, 99, 235, 0.35)',
                              borderRadius: '10px',
                              bgcolor: '#fff',
                              p: 2,
                              minHeight: 148,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textAlign: 'center',
                              gap: 1,
                            }}
                          >
                            <UploadFileIcon sx={{ color: '#2563eb', fontSize: 28 }} />
                            <Button variant="outlined" component="label" size="small">
                              Upload QR Code
                              <input
                                hidden
                                accept="image/*"
                                type="file"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) setFormData((p) => ({ ...p, paymentQrFile: file }));
                                }}
                              />
                            </Button>
                            {(formData.paymentQrFile || formData.paymentQrPreview) && (
                              <Typography sx={{ fontSize: '0.75rem', color: '#475569', wordBreak: 'break-all' }}>
                                {formData.paymentQrFile?.name || 'Saved QR image'}
                              </Typography>
                            )}
                          </Box>
                        </FormField>
                      </Grid>
                    </Grid>
                  )}
                </Box>

                <Box sx={registrationPanelSx}>
                  <FormControlLabel
                    sx={registrationOptionLabelSx}
                    control={
                      <Checkbox
                        checked={formData.isTeamProgramme}
                        onChange={(e) => setFormData((p) => ({ ...p, isTeamProgramme: e.target.checked }))}
                      />
                    }
                    label="Team-based programme"
                  />
                  {formData.isTeamProgramme && (
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <FormField
                          label="Minimum Team Size"
                          required
                          error={Boolean(fieldErrors.minTeamSize)}
                          helperText={fieldErrors.minTeamSize}
                        >
                          <TextField
                            hiddenLabel
                            fullWidth
                            type="number"
                            inputProps={{ min: 1 }}
                            placeholder="e.g. 2"
                            value={formData.minTeamSize}
                            onChange={handleFieldChange('minTeamSize')}
                            error={Boolean(fieldErrors.minTeamSize)}
                            sx={{ '& .MuiOutlinedInput-root': inputRootSx(Boolean(formData.minTeamSize)) }}
                          />
                        </FormField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormField
                          label="Maximum Team Size"
                          required
                          error={Boolean(fieldErrors.maxTeamSize)}
                          helperText={fieldErrors.maxTeamSize}
                        >
                          <TextField
                            hiddenLabel
                            fullWidth
                            type="number"
                            inputProps={{ min: 1 }}
                            placeholder="e.g. 5"
                            value={formData.maxTeamSize}
                            onChange={handleFieldChange('maxTeamSize')}
                            error={Boolean(fieldErrors.maxTeamSize)}
                            sx={{ '& .MuiOutlinedInput-root': inputRootSx(Boolean(formData.maxTeamSize)) }}
                          />
                        </FormField>
                      </Grid>
                    </Grid>
                  )}
                </Box>
              </Stack>
            </FormSection>
          </Box>
        );

      case 2:
        return (
          <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Box
                onDrop={handlePosterDrop}
                onDragOver={handleDragOver}
                sx={{
                  border: '2px dashed rgba(37, 99, 235, 0.65)',
                  borderRadius: 3,
                  p: 4,
                  textAlign: 'center',
                  bgcolor: 'rgba(37, 99, 235, 0.04)',
                }}
              >
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                  Upload programme poster
                </Typography>
                <Typography sx={{ color: '#475569', mb: 3 }}>
                  Drag & drop your poster image here, or browse to select a file.
                </Typography>
                <Button variant="contained" component="label">
                  Choose Poster
                  <input hidden accept="image/*" type="file" onChange={handlePosterSelect} />
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
                Poster Preview
              </Typography>
              <Box
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  height: 380,
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  bgcolor: 'background.paper',
                }}
              >
                {formData.posterPreview ? (
                  <img
                    src={formData.posterPreview}
                    alt="Programme Poster Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 2,
                      color: '#475569',
                    }}
                  >
                    No poster uploaded yet.
                  </Box>
                )}
              </Box>
              {formData.posterPreview && (
                <Button fullWidth sx={{ mt: 2 }} variant="outlined" component="label">
                  Replace poster
                  <input hidden accept="image/*" type="file" onChange={handlePosterSelect} />
                </Button>
              )}
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700, color: '#0f172a' }}>
              Programme attachments
            </Typography>
            <Typography sx={{ mb: 2, ...portalMutedTextSx }}>
              Upload proposal documents required for UMT programme approval. Supporting documents can be added in the next step.
            </Typography>
            <Grid container spacing={2}>
              {[
                {
                  label: 'Proposal Paper (optional)',
                  field: 'proposalPaperFile',
                  nameField: 'proposalPaperName',
                  previewField: 'proposalPaperPreview',
                  accept: '.pdf,.doc,.docx',
                },
                {
                  label: 'Sponsor Letter',
                  field: 'sponsorLetterFile',
                  nameField: 'sponsorLetterName',
                  previewField: 'sponsorLetterPreview',
                  accept: '.pdf,.doc,.docx,image/*',
                },
                {
                  label: 'Risk Assessment (optional)',
                  field: 'riskAssessmentFile',
                  nameField: 'riskAssessmentName',
                  previewField: 'riskAssessmentPreview',
                  accept: '.pdf,.doc,.docx',
                },
              ].map((item) => (
                <Grid item xs={12} md={4} key={item.field}>
                  <Card sx={{ borderRadius: 3, p: 2.5, border: '1px solid rgba(148, 163, 184, 0.35)', height: '100%' }}>
                    <Typography sx={{ fontWeight: 700, mb: 1, color: '#0f172a' }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '0.85rem', color: '#64748b', mb: 2 }}>
                      {formData[item.nameField] || formData[item.previewField] ? 'File attached' : 'No file uploaded'}
                    </Typography>
                    <Button variant="outlined" component="label" fullWidth>
                      {formData[item.nameField] ? 'Replace file' : 'Upload file'}
                      <input
                        hidden
                        type="file"
                        accept={item.accept}
                        onChange={handleProposalAttachmentSelect(item.field, item.previewField, item.nameField)}
                      />
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
          </Box>
        );

      case 3: {
        const committee = normalizeCommittee(formData.committee);
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Committee assignment
            </Typography>
            <Typography sx={{ mb: 3, ...portalMutedTextSx }}>
              Assign committee members by matric number (must be registered in CampusLink+). Merit is calculated by MyStar programme-level rules.
            </Typography>

            <Card sx={{ borderRadius: 3, p: 3, mb: 4, border: '1px solid rgba(37, 99, 235, 0.15)' }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
                Programme Director (Pengarah Program)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormField
                    label="Matric Number"
                    required
                    helperText={fieldErrors.directorMatric}
                    error={Boolean(fieldErrors.directorMatric)}
                  >
                    <CommitteeMatricField
                      value={committee.director.matric}
                      onResolved={handleCommitteeMatricResolved('director', null)}
                    />
                  </FormField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Full Name"
                    fullWidth
                    required
                    value={committee.director.name}
                    InputProps={{ readOnly: true }}
                    error={Boolean(fieldErrors.directorName)}
                    helperText={fieldErrors.directorName || 'Auto-populated'}
                    sx={committeeReadOnlyFieldSx}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Faculty"
                    fullWidth
                    value={committee.director.faculty}
                    InputProps={{ readOnly: true }}
                    helperText="Auto-populated"
                    sx={committeeReadOnlyFieldSx}
                  />
                </Grid>
              </Grid>
            </Card>

            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
                MT Programme (Majlis Tertinggi Program)
              </Typography>
              <Card sx={{ borderRadius: 3, overflowX: 'auto' }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                  <Box component="thead" sx={{ backgroundColor: '#e2e8f0' }}>
                    <Box component="tr">
                      <Box component="th" sx={{ ...committeeTableHeadSx, textAlign: 'left', py: 2, px: 2 }}>Matric Number</Box>
                      <Box component="th" sx={{ ...committeeTableHeadSx, textAlign: 'left', py: 2, px: 2 }}>Full Name</Box>
                      <Box component="th" sx={{ ...committeeTableHeadSx, textAlign: 'left', py: 2, px: 2 }}>Faculty</Box>
                      <Box component="th" sx={{ ...committeeTableHeadSx, textAlign: 'left', py: 2, px: 2 }}>Position (optional)</Box>
                      <Box component="th" sx={{ ...committeeTableHeadSx, textAlign: 'left', py: 2, px: 2 }}>Actions</Box>
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {committee.mtMembers.map((member) => (
                      <Box component="tr" key={member.id}>
                        <Box component="td" sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
                          <CommitteeMatricField
                            value={member.matric}
                            onResolved={handleCommitteeMatricResolved('mtMembers', member.id)}
                            error={Boolean(fieldErrors[`mtMatric_${member.id}`])}
                            helperText={fieldErrors[`mtMatric_${member.id}`]}
                          />
                        </Box>
                        <Box component="td" sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
                          <TextField value={member.name} fullWidth InputProps={{ readOnly: true }} sx={committeeReadOnlyFieldSx} />
                        </Box>
                        <Box component="td" sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
                          <TextField value={member.faculty} fullWidth InputProps={{ readOnly: true }} sx={committeeReadOnlyFieldSx} />
                        </Box>
                        <Box component="td" sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
                          <TextField
                            value={member.position}
                            onChange={handleCommitteeChange('mtMembers', member.id, 'position')}
                            placeholder="e.g. Secretary, Treasurer"
                            fullWidth
                          />
                        </Box>
                        <Box component="td" sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
                          <Button color="error" onClick={() => removeCommitteeRow('mtMembers', member.id)}>
                            Remove
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Card>
              <Button sx={{ mt: 2 }} onClick={() => addCommitteeRow('mtMembers')}>
                Add MT Member
              </Button>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
                AJK Programme (Ahli Jawatankuasa Program)
              </Typography>
              <Card sx={{ borderRadius: 3, overflowX: 'auto' }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                  <Box component="thead" sx={{ backgroundColor: '#e2e8f0' }}>
                    <Box component="tr">
                      <Box component="th" sx={{ ...committeeTableHeadSx, textAlign: 'left', py: 2, px: 2 }}>Matric Number</Box>
                      <Box component="th" sx={{ ...committeeTableHeadSx, textAlign: 'left', py: 2, px: 2 }}>Full Name</Box>
                      <Box component="th" sx={{ ...committeeTableHeadSx, textAlign: 'left', py: 2, px: 2 }}>Faculty</Box>
                      <Box component="th" sx={{ ...committeeTableHeadSx, textAlign: 'left', py: 2, px: 2 }}>Role (optional)</Box>
                      <Box component="th" sx={{ ...committeeTableHeadSx, textAlign: 'left', py: 2, px: 2 }}>Actions</Box>
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {committee.ajkMembers.map((member) => (
                      <Box component="tr" key={member.id}>
                        <Box component="td" sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
                          <CommitteeMatricField
                            value={member.matric}
                            onResolved={handleCommitteeMatricResolved('ajkMembers', member.id)}
                            error={Boolean(fieldErrors[`ajkMatric_${member.id}`])}
                            helperText={fieldErrors[`ajkMatric_${member.id}`]}
                          />
                        </Box>
                        <Box component="td" sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
                          <TextField value={member.name} fullWidth InputProps={{ readOnly: true }} sx={committeeReadOnlyFieldSx} />
                        </Box>
                        <Box component="td" sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
                          <TextField value={member.faculty} fullWidth InputProps={{ readOnly: true }} sx={committeeReadOnlyFieldSx} />
                        </Box>
                        <Box component="td" sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
                          <TextField
                            value={member.role}
                            onChange={handleCommitteeChange('ajkMembers', member.id, 'role')}
                            placeholder="e.g. Logistics, Publicity"
                            fullWidth
                          />
                        </Box>
                        <Box component="td" sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
                          <Button color="error" onClick={() => removeCommitteeRow('ajkMembers', member.id)}>
                            Remove
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Card>
              <Button sx={{ mt: 2 }} onClick={() => addCommitteeRow('ajkMembers')}>
                Add AJK Member
              </Button>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
                Special Contribution (Sumbangan Khas)
              </Typography>
              {committee.specialContributions.length === 0 ? (
                <Typography sx={{ color: '#475569', mb: 2 }}>
                  No special contribution members added yet.
                </Typography>
              ) : (
                <Card sx={{ borderRadius: 3, overflowX: 'auto', mb: 2 }}>
                  <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                    <Box component="thead" sx={{ backgroundColor: '#e2e8f0' }}>
                      <Box component="tr">
                        <Box component="th" sx={{ ...committeeTableHeadSx, textAlign: 'left', py: 2, px: 2 }}>Matric Number</Box>
                        <Box component="th" sx={{ ...committeeTableHeadSx, textAlign: 'left', py: 2, px: 2 }}>Full Name</Box>
                        <Box component="th" sx={{ ...committeeTableHeadSx, textAlign: 'left', py: 2, px: 2 }}>Faculty</Box>
                        <Box component="th" sx={{ ...committeeTableHeadSx, textAlign: 'left', py: 2, px: 2 }}>Contribution Description</Box>
                        <Box component="th" sx={{ ...committeeTableHeadSx, textAlign: 'left', py: 2, px: 2 }}>Actions</Box>
                      </Box>
                    </Box>
                    <Box component="tbody">
                      {committee.specialContributions.map((member) => (
                        <Box component="tr" key={member.id}>
                          <Box component="td" sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
                            <CommitteeMatricField
                              value={member.matric}
                              onResolved={handleCommitteeMatricResolved('specialContributions', member.id)}
                              error={Boolean(fieldErrors[`specialContributionsMatric_${member.id}`])}
                              helperText={fieldErrors[`specialContributionsMatric_${member.id}`]}
                            />
                          </Box>
                          <Box component="td" sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
                            <TextField value={member.name} fullWidth InputProps={{ readOnly: true }} sx={committeeReadOnlyFieldSx} />
                          </Box>
                          <Box component="td" sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
                            <TextField value={member.faculty} fullWidth InputProps={{ readOnly: true }} sx={committeeReadOnlyFieldSx} />
                          </Box>
                          <Box component="td" sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
                            <TextField
                              value={member.contributionDescription}
                              onChange={handleCommitteeChange('specialContributions', member.id, 'contributionDescription')}
                              placeholder="e.g. Speaker, Facilitator, Designer"
                              fullWidth
                              required
                              error={Boolean(fieldErrors[`specialContributionDesc_${member.id}`])}
                              helperText={fieldErrors[`specialContributionDesc_${member.id}`]}
                            />
                          </Box>
                          <Box component="td" sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
                            <Button color="error" onClick={() => removeCommitteeRow('specialContributions', member.id)}>
                              Remove
                            </Button>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Card>
              )}
              <Button onClick={() => addCommitteeRow('specialContributions')}>
                Add Special Contribution
              </Button>
            </Box>

            <Card sx={meritPreviewCardSx}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700, color: '#0f172a' }}>
                Estimated merit preview
              </Typography>
              <Typography sx={{ color: '#475569', mb: 2, fontWeight: 500 }}>
                Based on MyStar programme-level rules for committee members only.
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" sx={{ color: '#0f172a', fontWeight: 700 }}>Programme Level</Typography>
                  <Typography sx={{ color: '#334155', fontWeight: 600 }}>
                    {meritPreview?.programmeLevel || formData.level || 'Not selected'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Typography variant="subtitle2" sx={{ color: '#0f172a', fontWeight: 700 }}>MyStar merit rules</Typography>
                  <Typography sx={{ color: '#334155', fontWeight: 500 }}>
                    Director: {meritPreview?.rules?.DIRECTOR ?? '—'} · MT: {meritPreview?.rules?.MT ?? '—'} · AJK: {meritPreview?.rules?.AJK ?? '—'} · Special Contribution: {meritPreview?.rules?.SPECIAL_CONTRIBUTION ?? '—'}
                  </Typography>
                </Grid>
                {meritPreview?.breakdown?.map((item, index) => (
                  <Grid item xs={12} sm={6} key={`${item.matricNumber}-${index}`}>
                    <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 500 }}>
                      {item.positionLabel} ({item.matricNumber}): <strong>{item.meritPoints} pts</strong>
                    </Typography>
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ color: '#0f172a', fontWeight: 700 }}>Estimated committee merit total</Typography>
                  <Typography sx={{ fontWeight: 800, color: '#1d4ed8', fontSize: '1.05rem' }}>
                    {meritPreview?.totalMerit ?? 0} points
                  </Typography>
                </Grid>
              </Grid>
            </Card>
          </Box>
        );
      }

      case 4: {
        const budgetTotals = calculateBudgetTotals(formData.budgetLines);
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3, p: 3, border: '1px solid rgba(37, 99, 235, 0.15)' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#0f172a' }}>
                  Financial information (budget)
                </Typography>
                <Typography sx={{ ...portalMutedTextSx, mb: 3 }}>
                  Enter estimated income and expenses for this programme. Totals are calculated automatically.
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#0f172a' }}>Income</Typography>
                    <Stack spacing={1.5}>
                      {BUDGET_INCOME_ITEMS.map((item) => {
                        const line = formData.budgetLines.find((entry) => entry.category === item.category);
                        return (
                          <TextField
                            key={item.category}
                            label={item.label}
                            type="number"
                            inputProps={{ min: 0, step: '0.01' }}
                            value={line?.amount ?? ''}
                            onChange={handleBudgetAmountChange(item.category)}
                            fullWidth
                          />
                        );
                      })}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#0f172a' }}>Expenses</Typography>
                    <Stack spacing={1.5}>
                      {BUDGET_EXPENSE_ITEMS.map((item) => {
                        const line = formData.budgetLines.find((entry) => entry.category === item.category);
                        return (
                          <TextField
                            key={item.category}
                            label={item.label}
                            type="number"
                            inputProps={{ min: 0, step: '0.01' }}
                            value={line?.amount ?? ''}
                            onChange={handleBudgetAmountChange(item.category)}
                            fullWidth
                          />
                        );
                      })}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Card sx={{ ...meritPreviewCardSx, mb: 0 }}>
                      <Typography sx={{ color: '#334155' }}>
                        Total Income: <strong>{formatCurrency(budgetTotals.totalIncome)}</strong>
                      </Typography>
                      <Typography sx={{ color: '#334155', mt: 0.5 }}>
                        Total Expense: <strong>{formatCurrency(budgetTotals.totalExpense)}</strong>
                      </Typography>
                      <Typography sx={{ color: '#0f172a', mt: 0.5, fontWeight: 700 }}>
                        Budget Balance: {formatCurrency(budgetTotals.balance)}
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700, color: '#0f172a' }}>
                Sustainable Development Goals (SDG)
              </Typography>
              <Typography sx={{ mb: 1, ...portalMutedTextSx, fontSize: 14 }}>
                (Sila tanda (/) di kotak SDG yang berkenaan)
              </Typography>
              <Typography sx={{ mb: 2, ...portalMutedTextSx, fontSize: 14 }}>
                *Minta pandangan daripada penasihat kelab untuk tandakan SDG yang terlibat di dalam program.
              </Typography>
              {fieldErrors.sdgs && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {fieldErrors.sdgs}
                </Alert>
              )}
              <Card sx={{ borderRadius: 3, p: 3, backgroundColor: '#fff', border: '1px solid rgba(148, 163, 184, 0.35)' }}>
                <Grid container spacing={1}>
                  {SDG_OPTIONS.map((sdg) => (
                    <Grid item xs={12} sm={6} key={sdg.number}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.sdgs.includes(sdg.number)}
                            onChange={handleSdgToggle(sdg.number)}
                          />
                        }
                        label={
                          <Typography component="span" sx={{ fontSize: 13, fontWeight: formData.sdgs.includes(sdg.number) ? 700 : 600, color: '#0f172a' }}>
                            {sdg.number}. {sdg.label}
                          </Typography>
                        }
                        sx={sdgOptionSx(formData.sdgs.includes(sdg.number))}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Collaborating Organization"
                fullWidth
                value={formData.collaboratingOrganization}
                onChange={handleFieldChange('collaboratingOrganization')}
              />
              <TextField
                label="Sponsorship Information"
                fullWidth
                multiline
                minRows={4}
                sx={{ mt: 3 }}
                value={formData.sponsorshipInfo}
                onChange={handleFieldChange('sponsorshipInfo')}
              />
            </Grid>
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3, p: 3, border: '1px solid rgba(148, 163, 184, 0.35)' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#0f172a' }}>
                  Speaker information (optional)
                </Typography>
                <Typography sx={{ ...portalMutedTextSx, mb: 2 }}>
                  Add invited speakers or facilitators if applicable.
                </Typography>
                {(formData.speakers || []).length === 0 ? (
                  <Typography sx={{ color: '#64748b', mb: 2 }}>No speakers added yet.</Typography>
                ) : (
                  <Stack spacing={2}>
                    {(formData.speakers || []).map((speaker) => (
                      <Card key={speaker.id} sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(148, 163, 184, 0.25)' }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              label="Speaker Name"
                              fullWidth
                              value={speaker.speakerName}
                              onChange={handleSpeakerChange(speaker.id, 'speakerName')}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              label="Position"
                              fullWidth
                              value={speaker.position}
                              onChange={handleSpeakerChange(speaker.id, 'position')}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              label="Organization"
                              fullWidth
                              value={speaker.organization}
                              onChange={handleSpeakerChange(speaker.id, 'organization')}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              label="Email"
                              fullWidth
                              value={speaker.email}
                              onChange={handleSpeakerChange(speaker.id, 'email')}
                              error={Boolean(fieldErrors[`speakerEmail_${speaker.id}`])}
                              helperText={fieldErrors[`speakerEmail_${speaker.id}`]}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              label="Phone"
                              fullWidth
                              value={speaker.phone}
                              onChange={handleSpeakerChange(speaker.id, 'phone')}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Button variant="outlined" component="label" fullWidth sx={{ height: 56 }}>
                              {speaker.cvFileName || speaker.cvPath ? 'Replace CV' : 'CV Upload'}
                              <input hidden type="file" accept=".pdf,.doc,.docx" onChange={handleSpeakerCvSelect(speaker.id)} />
                            </Button>
                            {(speaker.cvFileName || speaker.cvPath) && (
                              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#64748b' }}>
                                {speaker.cvFileName || 'CV uploaded'}
                              </Typography>
                            )}
                          </Grid>
                          <Grid item xs={12}>
                            <Button color="error" variant="outlined" onClick={() => removeSpeakerRow(speaker.id)}>
                              Remove speaker
                            </Button>
                          </Grid>
                        </Grid>
                      </Card>
                    ))}
                  </Stack>
                )}
                <Button variant="outlined" sx={{ mt: 2 }} onClick={addSpeakerRow}>
                  Add speaker
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3, p: 3, border: '1px solid rgba(37, 99, 235, 0.15)' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#0f172a' }}>
                  Participation Certificates
                </Typography>
                <Typography sx={{ ...portalMutedTextSx, mb: 2, fontSize: '0.92rem' }}>
                  Choose whether CampusLink+ should generate UMT-style certificates for participants, or whether your club will prepare certificates manually.
                </Typography>
                <FormControl component="fieldset" sx={{ mb: 2 }}>
                  <RadioGroup
                    value={formData.certificateMode}
                    onChange={(e) => setFormData((prev) => ({
                      ...prev,
                      certificateMode: e.target.value,
                      advisorSignatureFile: e.target.value === 'MANUAL' ? null : prev.advisorSignatureFile,
                      advisorSignaturePreview: e.target.value === 'MANUAL' ? '' : prev.advisorSignaturePreview,
                    }))}
                    sx={{
                      '& .MuiFormControlLabel-label': {
                        color: '#0f172a',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                      },
                    }}
                  >
                    <FormControlLabel
                      value="SYSTEM"
                      control={<Radio />}
                      label="Use CampusLink+ certificate template (club advisor signature only)"
                    />
                    <FormControlLabel
                      value="MANUAL"
                      control={<Radio />}
                      label="Prepare certificates manually outside the system"
                    />
                  </RadioGroup>
                </FormControl>
                {formData.certificateMode === 'SYSTEM' && (
                  <Box>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', mb: 1 }}>
                      Certificate template
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', ...portalMutedTextSx, mb: 2 }}>
                      Choose a professional UMT certificate design. The large preview below reflects your selected orientation.
                    </Typography>
                    <FormControl component="fieldset" sx={{ mb: 2.5 }}>
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', mb: 1 }}>
                        Certificate orientation
                      </Typography>
                      <RadioGroup
                        row
                        value={formData.certificateOrientation}
                        onChange={(e) => setFormData((prev) => ({
                          ...prev,
                          certificateOrientation: e.target.value,
                        }))}
                      >
                        {CERTIFICATE_ORIENTATIONS.map((option) => (
                          <FormControlLabel
                            key={option.id}
                            value={option.id}
                            control={<Radio />}
                            label={option.label}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <Grid container spacing={2} sx={{ mb: 2.5 }}>
                      {CERTIFICATE_TEMPLATES.map((template) => (
                        <Grid item xs={6} key={template.id} sx={{ display: 'flex', minWidth: 0 }}>
                          <Card
                            onClick={() => setFormData((prev) => ({ ...prev, certificateTemplate: template.id }))}
                            sx={{
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              p: 1.5,
                              cursor: 'pointer',
                              borderRadius: 2,
                              border: '2px solid',
                              borderColor: formData.certificateTemplate === template.id
                                ? '#2563eb'
                                : 'rgba(148, 163, 184, 0.35)',
                              bgcolor: formData.certificateTemplate === template.id
                                ? 'rgba(37, 99, 235, 0.04)'
                                : '#fff',
                            }}
                          >
                            <CertificateTemplatePreview
                              templateId={template.id}
                              selected={formData.certificateTemplate === template.id}
                              orientation={formData.certificateOrientation}
                            />
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                              <Box>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                                  {template.name}
                                </Typography>
                                <Typography sx={{ fontSize: '0.78rem', color: '#64748b', mt: 0.5 }}>
                                  {template.description}
                                </Typography>
                              </Box>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<VisibilityOutlinedIcon />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openCertificatePreview(template.id);
                                }}
                              >
                                Preview
                              </Button>
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2.5 }}>
                      <Button
                        variant="contained"
                        startIcon={<VisibilityOutlinedIcon />}
                        onClick={() => openCertificatePreview(formData.certificateTemplate)}
                      >
                        Preview selected template
                      </Button>
                    </Box>
                    <Typography sx={{ fontSize: '0.9rem', ...portalMutedTextSx, mb: 1.5 }}>
                      Upload the club advisor&apos;s signature image (PNG/JPG). It will appear on generated certificates together with the advisor name from Club Advisor Assignment.
                    </Typography>
                    <Button variant="outlined" component="label" sx={{ mb: 2 }}>
                      {formData.advisorSignatureFile ? 'Change Advisor Signature' : 'Upload Advisor Signature'}
                      <input
                        hidden
                        accept="image/png,image/jpeg,image/jpg"
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setFormData((prev) => ({
                            ...prev,
                            advisorSignatureFile: file,
                            advisorSignaturePreview: URL.createObjectURL(file),
                          }));
                        }}
                      />
                    </Button>
                    {formData.advisorSignaturePreview && (
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontSize: '0.85rem', color: '#475569', mb: 1 }}>
                          Signature preview
                        </Typography>
                        <Box
                          component="img"
                          src={formData.advisorSignaturePreview}
                          alt="Advisor signature preview"
                          sx={{ maxHeight: 80, maxWidth: 220, border: '1px solid #e2e8f0', borderRadius: 1, p: 1, bgcolor: '#fff' }}
                        />
                      </Box>
                    )}
                  </Box>
                )}
                {formData.certificateMode === 'MANUAL' && (
                  <Alert severity="info" sx={{ borderRadius: '10px' }}>
                    The Certificates page will show a notice that this programme uses manual certificates. No PDF will be generated in CampusLink+.
                  </Alert>
                )}
              </Card>
            </Grid>
          </Grid>
        );
      }

      case 5:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, color: '#0f172a' }}>
              Supporting Documents
            </Typography>
            <Typography sx={{ ...portalMutedTextSx, mb: 3 }}>
              Download the programme form generated from your details, obtain your club advisor&apos;s signature, then upload the signed PDF.
              You may also attach optional supporting documents for MPP/HEPA review.
            </Typography>

            <Card sx={{ ...reviewCardSx, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#0f172a' }}>
                Club Advisor Assignment
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Advisor Name"
                    fullWidth
                    required
                    value={formData.advisor.advisorName}
                    onChange={(e) => setFormData((prev) => ({
                      ...prev,
                      advisor: { ...prev.advisor, advisorName: e.target.value },
                    }))}
                    error={Boolean(fieldErrors.advisorName)}
                    helperText={fieldErrors.advisorName}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Advisor Email"
                    fullWidth
                    value={formData.advisor.advisorEmail}
                    onChange={(e) => setFormData((prev) => ({
                      ...prev,
                      advisor: { ...prev.advisor, advisorEmail: e.target.value },
                    }))}
                  />
                </Grid>
              </Grid>
            </Card>

            <Card
              sx={{
                borderRadius: 3,
                p: 3,
                mb: 3,
                border: '1px solid rgba(16, 185, 129, 0.25)',
                bgcolor: 'rgba(16, 185, 129, 0.04)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#0f172a' }}>
                Advisor-Signed Programme Form (Required)
              </Typography>
              <Typography sx={{ color: '#475569', mb: 2.5 }}>
                This is the exact document MPP and HEPA will review. Download the programme form, get your advisor&apos;s signature, then upload the signed PDF here.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={handleDownloadProgrammePdf}
                >
                  Download Programme Form (PDF)
                </Button>
                <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
                  {advisorSignedUploaded ? 'Replace Signed PDF' : 'Upload Signed PDF'}
                  <input hidden accept="application/pdf" type="file" onChange={handleSignedFormUpload} />
                </Button>
              </Stack>

              {formData.applicationPdfFile && (
                <Typography variant="body2" sx={{ color: '#2563eb', fontWeight: 600, mb: 1 }}>
                  Programme form PDF ready — it will be saved when you submit to MPP.
                </Typography>
              )}
              {(formData.signedAdvisorFormName || advisorSignedUploaded) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                    Advisor-signed PDF: {formData.signedAdvisorFormName || 'uploaded to this draft'}
                  </Typography>
                </Box>
              )}
              {!formData.signedAdvisorForm && !advisorSignedUploaded && (
                <Typography variant="body2" sx={{ ...portalMutedTextSx }}>
                  Required before submitting to MPP review.
                </Typography>
              )}
              {fieldErrors.signedAdvisorForm && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {fieldErrors.signedAdvisorForm}
                </Alert>
              )}
            </Card>

            <Card
              sx={{
                borderRadius: 3,
                p: 3,
                border: '1px solid rgba(37, 99, 235, 0.15)',
                bgcolor: 'rgba(37, 99, 235, 0.02)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#0f172a' }}>
                Additional Supporting Documents (Optional)
              </Typography>
              <Typography sx={{ color: '#475569', mb: 2 }}>
                Upload letters, budgets, venue confirmations, or other files to help MPP/HEPA review your programme.
                Maximum {MAX_SUPPORTING_DOCUMENTS} files.
              </Typography>

              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFileIcon />}
                disabled={supportingUploading || uploadedSupportingDocuments.length >= MAX_SUPPORTING_DOCUMENTS}
                sx={{ mb: 2 }}
              >
                {supportingUploading ? 'Uploading...' : 'Add Supporting Documents'}
                <input
                  hidden
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  type="file"
                  onChange={handleSupportingDocumentsAdd}
                />
              </Button>

              <Typography variant="body2" sx={{ color: '#64748b', mb: 1.5 }}>
                {uploadedSupportingDocuments.length} of {MAX_SUPPORTING_DOCUMENTS} optional document(s) attached.
              </Typography>

              {uploadedSupportingDocuments.length > 0 && (
                <Stack spacing={1}>
                  {uploadedSupportingDocuments.map((doc, index) => (
                    <Box
                      key={doc.id || `${doc.fileName}-${index}`}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        p: 1.5,
                        borderRadius: 2,
                        border: '1px solid rgba(148, 163, 184, 0.35)',
                        bgcolor: '#fff',
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                          {index + 1}. {doc.fileName}
                        </Typography>
                        {doc.url && (
                          <Button
                            size="small"
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ mt: 0.5, px: 0 }}
                          >
                            View
                          </Button>
                        )}
                      </Box>
                      {doc.id && (
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteOutlineOutlinedIcon />}
                          onClick={() => handleRemoveSupportingDocument(doc.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
            </Card>
          </Box>
        );

      case 6: {
        const reviewCommittee = normalizeCommittee(formData.committee);
        const reviewBudget = calculateBudgetTotals(formData.budgetLines);
        const reviewTentative = (formData.tentativeSchedule || []).filter(
          (row) => row.timeSlot?.trim() || row.activity?.trim() || row.personInCharge?.trim()
        );
        const reviewSpeakers = (formData.speakers || []).filter((speaker) => speaker.speakerName?.trim());
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#0f172a' }}>
              Review your programme details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={reviewCardSx}>
                  <Typography variant="subtitle2" sx={reviewSectionTitleSx}>
                    Programme overview
                  </Typography>
                  <Typography sx={reviewStrongTextSx}>{formData.title || 'No title yet'}</Typography>
                  <Typography sx={{ mt: 1, ...reviewBodyTextSx }}>{formData.description || 'No description provided.'}</Typography>
                  <Typography sx={{ mt: 2, ...reviewBodyTextSx }}>Category: {formData.category || '—'}</Typography>
                  <Typography sx={reviewBodyTextSx}>Level: {formData.level || '—'}</Typography>
                  <Typography sx={reviewBodyTextSx}>Type: {formData.type || '—'}</Typography>
                  <Typography sx={reviewBodyTextSx}>Organizer Club: {formData.organizerClub || '—'}</Typography>
                  <Typography sx={reviewBodyTextSx}>
                    Certificates: {formData.certificateMode === 'MANUAL'
                      ? 'Manual (outside system)'
                      : `${getCertificateTemplateLabel(formData.certificateTemplate)} · ${formData.certificateOrientation === 'PORTRAIT' ? 'Portrait' : 'Landscape'}`}
                  </Typography>
                </Card>
                <Card sx={{ ...reviewCardSx, mb: 0 }}>
                  <Typography variant="subtitle2" sx={reviewSectionTitleSx}>
                    Schedule & registration
                  </Typography>
                  <Typography sx={reviewBodyTextSx}>
                    Start: {formData.startDate || '—'}
                    {formData.startTime ? ` at ${formData.startTime}` : ''}
                  </Typography>
                  <Typography sx={reviewBodyTextSx}>
                    End: {formData.endDate || '—'}
                    {formData.endTime ? ` at ${formData.endTime}` : ''}
                  </Typography>
                  <Typography sx={reviewBodyTextSx}>Registration Open: {formData.registrationOpenDate || '—'}</Typography>
                  <Typography sx={reviewBodyTextSx}>Registration Close: {formData.registrationCloseDate || '—'}</Typography>
                  <Typography sx={reviewBodyTextSx}>Venue: {formData.venue || '—'}</Typography>
                  <Typography sx={reviewBodyTextSx}>Max Participants: {formData.maxParticipants || '—'}</Typography>
                  <Typography sx={reviewBodyTextSx}>
                    Estimated: Students {formData.expectedStudentParticipants || '0'} · Staff {formData.expectedStaffParticipants || '0'} · External {formData.expectedExternalParticipants || '0'}
                  </Typography>
                </Card>
                <Card sx={reviewCardSx}>
                  <Typography variant="subtitle2" sx={reviewSectionTitleSx}>
                    Programme tentative
                  </Typography>
                  {reviewTentative.length ? reviewTentative.map((row) => (
                    <Typography key={row.id} sx={reviewBodyTextSx}>
                      {row.timeSlot || '—'} — {row.activity || '—'} (PIC: {row.personInCharge || '—'})
                    </Typography>
                  )) : (
                    <Typography sx={reviewBodyTextSx}>No tentative schedule added.</Typography>
                  )}
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={reviewCardSx}>
                  <Typography variant="subtitle2" sx={reviewSectionTitleSx}>
                    Outcomes & committee
                  </Typography>
                  <Typography sx={reviewBodyTextSx}>Objectives: {formData.objectives || '—'}</Typography>
                  <Typography sx={{ mt: 1, ...reviewBodyTextSx }}>Expected Outcomes: {formData.outcomes || '—'}</Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, ...reviewStrongTextSx }}>
                      Committee (MyStar)
                    </Typography>
                    <Typography variant="body2" sx={reviewBodyTextSx}>
                      Programme Director: {reviewCommittee.director.name || '—'} ({reviewCommittee.director.matric || '—'}) — {reviewCommittee.director.faculty || '—'}
                    </Typography>
                    {reviewCommittee.mtMembers.filter((m) => m.matric).map((member) => (
                      <Typography key={`mt-${member.id}`} variant="body2" sx={reviewBodyTextSx}>
                        MT Programme{member.position ? ` (${member.position})` : ''}: {member.name || '—'} ({member.matric || '—'}) — {member.faculty || '—'}
                      </Typography>
                    ))}
                    {reviewCommittee.ajkMembers.filter((m) => m.matric).map((member) => (
                      <Typography key={`ajk-${member.id}`} variant="body2" sx={reviewBodyTextSx}>
                        AJK Programme{member.role ? ` (${member.role})` : ''}: {member.name || '—'} ({member.matric || '—'}) — {member.faculty || '—'}
                      </Typography>
                    ))}
                    {reviewCommittee.specialContributions.filter((m) => m.matric).map((member) => (
                      <Typography key={`sc-${member.id}`} variant="body2" sx={reviewBodyTextSx}>
                        Special Contribution ({member.contributionDescription || '—'}): {member.name || '—'} ({member.matric || '—'}) — {member.faculty || '—'}
                      </Typography>
                    ))}
                  </Box>
                </Card>
                <Card sx={reviewCardSx}>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: '#0f172a', fontWeight: 700 }}>
                    SDGs & partners
                  </Typography>
                  {formData.sdgs.length ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.sdgs.map((sdgNumber) => {
                        const sdg = SDG_OPTIONS.find((item) => item.number === sdgNumber);
                        return (
                          <Chip
                            key={sdgNumber}
                            label={sdg ? `${sdg.number}. ${sdg.label}` : sdgNumber}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        );
                      })}
                    </Box>
                  ) : (
                    <Typography sx={{ color: '#475569' }}>No SDGs selected</Typography>
                  )}
                  <Typography sx={{ mt: 2, color: '#334155' }}>
                    Collaborating Org: {formData.collaboratingOrganization || '—'}
                  </Typography>
                  <Typography sx={{ color: '#334155' }}>Sponsorship: {formData.sponsorshipInfo || '—'}</Typography>
                </Card>
                <Card sx={reviewCardSx}>
                  <Typography variant="subtitle2" sx={reviewSectionTitleSx}>
                    Budget summary
                  </Typography>
                  <Typography sx={reviewBodyTextSx}>Total Income: {formatCurrency(reviewBudget.totalIncome)}</Typography>
                  <Typography sx={reviewBodyTextSx}>Total Expense: {formatCurrency(reviewBudget.totalExpense)}</Typography>
                  <Typography sx={reviewBodyTextSx}>Budget Balance: {formatCurrency(reviewBudget.balance)}</Typography>
                </Card>
                <Card sx={reviewCardSx}>
                  <Typography variant="subtitle2" sx={reviewSectionTitleSx}>
                    Speaker information
                  </Typography>
                  {reviewSpeakers.length ? reviewSpeakers.map((speaker) => (
                    <Typography key={speaker.id} sx={reviewBodyTextSx}>
                      {speaker.speakerName}
                      {speaker.organization ? ` (${speaker.organization})` : ''}
                      {speaker.email ? ` — ${speaker.email}` : ''}
                    </Typography>
                  )) : (
                    <Typography sx={reviewBodyTextSx}>No speakers listed.</Typography>
                  )}
                </Card>
                {formData.posterPreview && (
                  <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    <img
                      src={formData.posterPreview}
                      alt="Poster preview"
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                  </Card>
                )}
              </Grid>
            </Grid>

            <Card sx={{ ...reviewCardSx, mt: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0f172a' }}>Merit Preview (MyStar)</Typography>
              <Typography sx={{ mb: 1, ...reviewBodyTextSx }}>
                Total estimated merit: <Box component="strong" sx={{ color: '#0f172a' }}>{meritPreview?.totalMerit ?? 0} points</Box>
              </Typography>
              {meritPreview?.breakdown?.map((item, index) => (
                <Typography key={index} variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
                  {item.positionLabel} — {item.matricNumber}: {item.meritPoints} pts
                </Typography>
              ))}
            </Card>

            <Card sx={{ ...reviewCardSx, mt: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#0f172a' }}>Supporting Documents</Typography>
              <Typography sx={reviewBodyTextSx}>
                Advisor-signed form: {advisorSignedUploaded || formData.signedAdvisorFormName ? 'Attached' : 'Not attached yet'}
              </Typography>
              <Typography sx={reviewBodyTextSx}>
                Proposal paper: {formData.proposalPaperName || formData.proposalPaperPreview ? 'Attached' : 'Not attached'}
              </Typography>
              <Typography sx={reviewBodyTextSx}>
                Sponsor letter: {formData.sponsorLetterName || formData.sponsorLetterPreview ? 'Attached' : 'Not attached'}
              </Typography>
              <Typography sx={reviewBodyTextSx}>
                Risk assessment: {formData.riskAssessmentName || formData.riskAssessmentPreview ? 'Attached' : 'Not attached'}
              </Typography>
              <Typography sx={reviewBodyTextSx}>
                Optional supporting documents: {uploadedSupportingDocuments.length} file(s)
              </Typography>
              <Typography sx={reviewBodyTextSx}>
                Club advisor: {formData.advisor.advisorName || '—'}
                {formData.advisor.advisorEmail ? ` (${formData.advisor.advisorEmail})` : ''}
              </Typography>
            </Card>
          </Box>
        );
      }

      default:
        return null;
    }
  };

  return (
    <OrganizerLayout>
      <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 4 }}>
        <PortalHero
          eyebrow="Organizer Portal"
          title={routeProgrammeId ? 'Continue Programme Draft' : 'Create a New Programme'}
          subtitle={routeProgrammeId
            ? 'Resume editing your saved draft and submit when you are ready.'
            : 'Complete the programme details below, then submit for MPP and HEPA approval.'}
        />

        {loadingExistingDraft ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
        <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)', mt: 3, overflow: 'hidden' }}>
          <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
            <Stepper
              activeStep={activeStep}
              alternativeLabel
              sx={{
                mb: 4,
                px: { xs: 0, sm: 1 },
                '& .MuiStepConnector-line': {
                  borderColor: 'rgba(148, 163, 184, 0.45)',
                },
                '& .MuiStepConnector-root': {
                  top: 18,
                },
                '& .MuiStepLabel-label': {
                  fontSize: { xs: '0.68rem', sm: '0.75rem' },
                  mt: 1,
                  color: '#475569',
                  fontWeight: 600,
                  lineHeight: 1.35,
                  textAlign: 'center',
                },
                '& .MuiStepLabel-label.Mui-active': {
                  color: '#0f172a',
                  fontWeight: 700,
                },
                '& .MuiStepLabel-label.Mui-completed': {
                  color: '#334155',
                  fontWeight: 600,
                },
                '& .MuiStepIcon-root': {
                  width: 34,
                  height: 34,
                },
                '& .MuiStepIcon-root.Mui-active': { color: '#2563eb' },
                '& .MuiStepIcon-root.Mui-completed': { color: '#16a34a' },
              }}
            >
              {stepLabels.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ mb: 3, ...fieldStyles }}>{renderStepContent()}</Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Button variant="outlined" disabled={activeStep === 0} onClick={handleBack} sx={{ minWidth: 140 }}>
                Back
              </Button>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleSaveDraft}
                  disabled={savingDraft || submitting}
                  sx={{ minWidth: 140 }}
                >
                  {savingDraft ? <CircularProgress size={22} color="inherit" /> : 'Save Draft'}
                </Button>
                {activeStep < stepLabels.length - 1 ? (
                  <Button variant="contained" onClick={handleNext} sx={{ minWidth: 140 }}>
                    Continue
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleSubmitToMpp}
                    disabled={savingDraft || submitting}
                    sx={{ minWidth: 140 }}
                  >
                    {submitting ? <CircularProgress size={22} color="inherit" /> : 'Submit to MPP Review'}
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
        )}

        <Dialog
          open={dialogNotification.open}
          onClose={() => setDialogNotification((prev) => ({ ...prev, open: false }))}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            className: 'portal-light-surface',
            sx: {
              borderRadius: 4,
              p: 1,
              boxShadow: '0 24px 48px rgba(15, 23, 42, 0.18)',
            },
          }}
        >
          <DialogContent sx={{ textAlign: 'center', pt: 4, pb: 2 }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                bgcolor: activeNotification.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <NotificationIcon sx={{ fontSize: 40, color: activeNotification.iconColor }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              {activeNotification.title}
            </Typography>
            <Typography sx={{ ...portalMutedTextSx, lineHeight: 1.6 }}>
              {dialogMessage}
            </Typography>
            {dialogNotification.variant === 'submitSuccess' && formData.title && (
              <Box
                sx={{
                  mt: 2,
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: '#f8fafc',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                }}
              >
                <Typography variant="body2" sx={portalMutedTextSx}>
                  Programme
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>{formData.title}</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', gap: 1, pb: 3, px: 3 }}>
            {dialogNotification.variant === 'submitSuccess' && (
              <Button
                variant="outlined"
                onClick={() => {
                  setDialogNotification((prev) => ({ ...prev, open: false }));
                  navigate('/organizer/programmes');
                }}
              >
                View My Programmes
              </Button>
            )}
            <Button
              variant="contained"
              onClick={() => setDialogNotification((prev) => ({ ...prev, open: false }))}
              sx={{ minWidth: 120 }}
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={errorSnackbar.open}
          autoHideDuration={7000}
          onClose={() => setErrorSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setErrorSnackbar((prev) => ({ ...prev, open: false }))}
            severity="error"
            variant="filled"
            icon={<ErrorOutlineIcon />}
            sx={{
              width: '100%',
              maxWidth: 520,
              borderRadius: 3,
              boxShadow: '0 12px 32px rgba(220, 38, 38, 0.25)',
              fontWeight: 600,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {errorSnackbar.message}
          </Alert>
        </Snackbar>

        <CertificatePreviewDialog
          open={certificatePreviewOpen}
          onClose={() => setCertificatePreviewOpen(false)}
          formData={formData}
          templateId={previewTemplateId}
          orientation={formData.certificateOrientation}
          onOrientationChange={(value) => setFormData((prev) => ({ ...prev, certificateOrientation: value }))}
        />
      </Box>
    </OrganizerLayout>
  );
};

export default CreateProgramme;
