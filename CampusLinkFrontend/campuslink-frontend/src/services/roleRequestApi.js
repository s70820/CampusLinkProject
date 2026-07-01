import api from './api';
import { fileUrl } from './registrationApi';
import { apiBaseUrl } from '../config/appConfig';

export { fileUrl };

export function isPersonalizedOrganizerFormUrl(url) {
  return typeof url === 'string' && url.includes('/club-organizer-form');
}

async function fetchClubOrganizerFormBlob({ requestId, userId, clubName }) {
  const url = requestId
    ? `/api/role-requests/${requestId}/club-organizer-form`
    : '/api/role-requests/club-organizer-form/template';
  const response = await api.get(url, {
    params: {
      userId,
      ...(clubName ? { clubName } : {}),
    },
    responseType: 'blob',
  });
  return new Blob([response.data], { type: 'application/pdf' });
}

export async function openClubOrganizerFormPdf({ requestId, userId, clubName, filename = 'Club_Organizer_Approval_Form.pdf' }) {
  const blob = await fetchClubOrganizerFormBlob({ requestId, userId, clubName });
  const objectUrl = URL.createObjectURL(blob);
  const opened = window.open(objectUrl, '_blank', 'noopener,noreferrer');
  if (!opened) {
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

export async function downloadClubOrganizerFormPdf({ requestId, userId, clubName, filename = 'UMT_Club_Organizer_Approval_Form.pdf' }) {
  const blob = await fetchClubOrganizerFormBlob({ requestId, userId, clubName });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

export function resolveRoleRequestDocumentUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/api/')) {
    const base = apiBaseUrl.startsWith('http') ? apiBaseUrl.replace(/\/$/, '') : `${window.location.origin}${apiBaseUrl}`;
    return `${base}${url}`;
  }
  return fileUrl(url);
}

export async function fetchMyRoleRequests(userId) {
  const response = await api.get('/api/role-requests/me', { params: { userId } });
  return response.data || [];
}

export async function fetchRoleRequests(status) {
  const params = status && status !== 'ALL' ? { status } : {};
  const response = await api.get('/api/role-requests', { params });
  return response.data || [];
}

export async function submitRoleRequest({ userId, requestedRole, reason, clubName, documents }) {
  const formData = new FormData();
  formData.append('userId', userId);
  formData.append('requestedRole', requestedRole);
  if (reason) formData.append('reason', reason);
  if (clubName) formData.append('clubName', clubName);
  (documents || []).forEach((file) => formData.append('documents', file));
  const response = await api.post('/api/role-requests', formData);
  return response.data;
}

export async function approveRoleRequest(requestId, reviewerId, reviewNotes, hepaSignedDocument) {
  if (hepaSignedDocument) {
    const formData = new FormData();
    if (reviewNotes) formData.append('reviewNotes', reviewNotes);
    formData.append('hepaSignedDocument', hepaSignedDocument);
    const response = await api.post(
      `/api/role-requests/${requestId}/approve`,
      formData,
      { params: { reviewerId } }
    );
    return response.data;
  }

  const response = await api.post(
    `/api/role-requests/${requestId}/approve`,
    { reviewNotes: reviewNotes || '' },
    { params: { reviewerId } }
  );
  return response.data;
}

export async function rejectRoleRequest(requestId, reviewerId, reviewNotes) {
  const response = await api.post(
    `/api/role-requests/${requestId}/reject`,
    { reviewNotes },
    { params: { reviewerId } }
  );
  return response.data;
}

export async function revokeRoleRequest(requestId, reviewerId, reviewNotes) {
  const response = await api.post(
    `/api/role-requests/${requestId}/revoke`,
    { reviewNotes },
    { params: { reviewerId } }
  );
  return response.data;
}
