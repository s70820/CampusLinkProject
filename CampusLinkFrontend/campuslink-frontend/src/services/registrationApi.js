import api from './api';
import { resolveAssetUrl } from '../config/appConfig';

export const fileUrl = (path) => resolveAssetUrl(path);

export async function fetchStudentProfile(userId) {
  const response = await api.get('/api/students/me/profile', { params: { userId } });
  return response.data;
}

export async function fetchMyRegistrations(userId) {
  const response = await api.get('/api/registrations/me', { params: { userId } });
  return response.data || [];
}

export async function fetchProgrammeAvailability(programmeId, userId) {
  const params = userId != null && userId !== '' ? { userId: Number(userId) } : undefined;
  const response = await api.get(`/api/programmes/browse/${programmeId}/availability`, { params });
  return response.data;
}

export async function registerIndividual({ userId, programmeId, paymentReference, receipt, customResponses }) {
  const formData = new FormData();
  formData.append('userId', userId);
  formData.append('programmeId', programmeId);
  if (paymentReference) formData.append('paymentReference', paymentReference);
  if (customResponses) formData.append('customResponses', JSON.stringify(customResponses));
  if (receipt) formData.append('receipt', receipt);
  const response = await api.post('/api/registrations/individual', formData);
  return response.data;
}

export async function registerTeam({ userId, programmeId, teamName, teammates, paymentReference, receipt, customResponses }) {
  const formData = new FormData();
  formData.append('userId', userId);
  formData.append('programmeId', programmeId);
  formData.append('teamName', teamName);
  if (paymentReference) formData.append('paymentReference', paymentReference);
  if (customResponses) formData.append('customResponses', JSON.stringify(customResponses));
  if (receipt) formData.append('receipt', receipt);
  formData.append(
    'teammates',
    new Blob([JSON.stringify(teammates || [])], { type: 'application/json' })
  );
  const response = await api.post('/api/registrations/team', formData);
  return response.data;
}

export async function fetchProgrammeRegistrations(programmeId) {
  const response = await api.get(`/api/registrations/programme/${programmeId}`);
  return response.data || [];
}

export async function approvePayment(registrationId, organizerId, remarks) {
  const response = await api.put(`/api/registrations/${registrationId}/payment/approve`, { remarks }, {
    params: { organizerId },
  });
  return response.data;
}

export async function rejectPayment(registrationId, organizerId, remarks) {
  const response = await api.put(`/api/registrations/${registrationId}/payment/reject`, { remarks }, {
    params: { organizerId },
  });
  return response.data;
}

export async function acceptTeamInvite(memberId, userId) {
  const response = await api.post(`/api/registrations/team-invites/${memberId}/accept`, null, {
    params: { userId },
  });
  return response.data;
}

export async function rejectTeamInvite(memberId, userId) {
  const response = await api.post(`/api/registrations/team-invites/${memberId}/reject`, null, {
    params: { userId },
  });
  return response.data;
}

export async function fetchNotifications(userId) {
  const response = await api.get('/api/notifications', { params: { userId } });
  return response.data || [];
}

export async function fetchUnreadNotificationCount(userId) {
  const response = await api.get('/api/notifications/unread-count', { params: { userId } });
  return response.data?.count ?? 0;
}

export async function markNotificationRead(notificationId, userId) {
  await api.patch(`/api/notifications/${notificationId}/read`, null, { params: { userId } });
}

export async function markAllNotificationsRead(userId) {
  await api.patch('/api/notifications/read-all', null, { params: { userId } });
}

export async function fetchMyTeamRegistrations(userId) {
  const response = await api.get('/api/registrations/teams/me', { params: { userId } });
  return response.data || [];
}

export async function fetchTeamRegistration(teamRegistrationId, userId) {
  const response = await api.get(`/api/registrations/teams/${teamRegistrationId}`, { params: { userId } });
  return response.data;
}
