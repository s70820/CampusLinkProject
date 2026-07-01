import api from './api';

export const lookupStudentByMatric = (matricNumber, { teamInvite = false, programmeId = null } = {}) =>
  api.get(`/api/students/matric/${matricNumber}`, {
    params: {
      ...(teamInvite ? { teamInvite: true } : {}),
      ...(programmeId != null ? { programmeId } : {}),
    },
  });

export const getMeritRules = (level) =>
  api.get('/api/merit-rules', { params: { level } });

export const previewMerit = (level, committeeMembers) =>
  api.post(`/api/merit-rules/preview?level=${encodeURIComponent(level)}`, committeeMembers);

const FILE_FIELDS = [
  'posterFile',
  'applicationPdfFile',
  'paymentQrFile',
  'advisorSignatureFile',
  'proposalPaperFile',
  'sponsorLetterFile',
  'riskAssessmentFile',
];

export const saveProgrammeDraft = (formData, organizerId, programmeId = null) => {
  const submitData = new FormData();
  const programmeJson = { ...formData };
  FILE_FIELDS.forEach((field) => delete programmeJson[field]);
  delete programmeJson.speakerRows;

  submitData.append('programme', new Blob([JSON.stringify(programmeJson)], { type: 'application/json' }));

  if (formData.posterFile) {
    submitData.append('poster', formData.posterFile);
  }
  if (formData.applicationPdfFile) {
    submitData.append('applicationPdf', formData.applicationPdfFile);
  }
  if (formData.paymentQrFile) {
    submitData.append('paymentQr', formData.paymentQrFile);
  }
  if (formData.advisorSignatureFile) {
    submitData.append('advisorSignature', formData.advisorSignatureFile);
  }
  if (formData.proposalPaperFile) {
    submitData.append('proposalPaper', formData.proposalPaperFile);
  }
  if (formData.sponsorLetterFile) {
    submitData.append('sponsorLetter', formData.sponsorLetterFile);
  }
  if (formData.riskAssessmentFile) {
    submitData.append('riskAssessment', formData.riskAssessmentFile);
  }
  (formData.speakerRows || formData.speakers || []).forEach((speaker, index) => {
    if (speaker?.cvFile) {
      submitData.append(`speakerCv_${index}`, speaker.cvFile);
    }
  });

  const url = programmeId ? `/api/programmes/${programmeId}/draft` : '/api/programmes/draft';
  const method = programmeId ? 'put' : 'post';

  return api[method](url, submitData, { params: { organizerId } });
};

export const getProgrammeFull = (id) => api.get(`/api/programmes/${id}/full`);

export const uploadAdvisorSigned = (id, signedPdf, organizerId) => {
  const data = new FormData();
  data.append('signedPdf', signedPdf);
  return api.post(`/api/programmes/${id}/advisor-signed-upload`, data, { params: { organizerId } });
};

export const uploadSupportingDocuments = (id, files, organizerId) => {
  const data = new FormData();
  (files || []).forEach((file) => data.append('documents', file));
  return api.post(`/api/programmes/${id}/supporting-documents`, data, { params: { organizerId } });
};

export const deleteSupportingDocument = (programmeId, documentId, organizerId) =>
  api.delete(`/api/programmes/${programmeId}/supporting-documents/${documentId}`, { params: { organizerId } });

export const submitToMpp = (id, organizerId) =>
  api.post(`/api/programmes/${id}/submit-mpp`, null, { params: { organizerId } });

export const approveAdvisorOnline = (token, remarks) =>
  api.post(`/api/advisor-approval/token/${token}/approve`, { remarks });

export const getAdvisorApprovalByToken = (token) =>
  api.get(`/api/advisor-approval/token/${token}`);
