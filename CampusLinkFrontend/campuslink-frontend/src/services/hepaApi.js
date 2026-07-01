import api from './api';

export async function fetchHepaDashboard(hepaId) {
  const response = await api.get('/api/hepa/me/dashboard', { params: { hepaId } });
  return response.data;
}

export async function fetchHepaPendingProgrammes(hepaId) {
  const response = await api.get('/api/hepa/me/pending-programmes', { params: { hepaId } });
  return response.data || [];
}

export async function fetchHepaReviewedProgrammes(hepaId) {
  const response = await api.get('/api/hepa/me/reviewed-programmes', { params: { hepaId } });
  return response.data || [];
}

export async function cancelHepaPublishedProgramme(programmeId, hepaId, reason) {
  const response = await api.put(
    `/api/hepa/me/programmes/${programmeId}/cancel`,
    { reason },
    { params: { hepaId } }
  );
  return response.data;
}

export async function fetchHepaReports(hepaId) {
  const response = await api.get('/api/hepa/me/reports', { params: { hepaId } });
  return response.data;
}

export async function approveHepaProgramme(programmeId, remarks) {
  const response = await api.put(`/api/programmes/${programmeId}/hepa-approve`, { remarks: remarks || null });
  return response.data;
}

export async function rejectHepaProgramme(programmeId, remarks) {
  const response = await api.put(`/api/programmes/${programmeId}/hepa-reject`, { remarks: remarks || null });
  return response.data;
}

export async function fetchMeritRules(level) {
  const response = await api.get('/api/merit-rules', { params: { level } });
  return response.data || [];
}
