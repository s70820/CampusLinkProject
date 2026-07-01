import api from './api';

export async function fetchStudentDashboardStats(userId) {
  const response = await api.get('/api/students/me/dashboard-stats', { params: { userId } });
  return response.data;
}

export async function fetchStudentAttendance(userId) {
  const response = await api.get('/api/students/me/attendance', { params: { userId } });
  return response.data || [];
}

export async function fetchActiveAttendanceSessions(userId) {
  const response = await api.get('/api/students/me/attendance/active-sessions', { params: { userId } });
  return response.data || [];
}

export async function checkInWithQr(userId, qrPayload) {
  const response = await api.post('/api/students/me/attendance/check-in', { qrPayload }, { params: { userId } });
  return response.data;
}

export async function fetchStudentMeritRecords(userId) {
  const response = await api.get('/api/students/me/merit-records', { params: { userId } });
  return response.data || [];
}

export async function fetchStudentCertificates(userId) {
  const response = await api.get('/api/students/me/certificates', { params: { userId } });
  return response.data || [];
}

export async function fetchCertificateRenderData(userId, certificateId) {
  const response = await api.get(`/api/students/me/certificates/${certificateId}/render`, {
    params: { userId },
  });
  return response.data;
}
