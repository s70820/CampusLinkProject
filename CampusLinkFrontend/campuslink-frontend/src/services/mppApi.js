import api from './api';

export async function fetchMppDashboard(mppId) {
  const response = await api.get('/api/mpp/me/dashboard', { params: { mppId } });
  return response.data;
}

export async function fetchMppPendingProgrammes(mppId) {
  const response = await api.get('/api/mpp/me/pending-programmes', { params: { mppId } });
  return response.data || [];
}

export async function fetchMppReviewedProgrammes(mppId) {
  const response = await api.get('/api/mpp/me/reviewed-programmes', { params: { mppId } });
  return response.data || [];
}

export async function cancelMppPublishedProgramme(programmeId, mppId, reason) {
  const response = await api.put(
    `/api/mpp/me/programmes/${programmeId}/cancel`,
    { reason },
    { params: { mppId } }
  );
  return response.data;
}

export async function approveMppProgramme(programmeId, remarks) {
  const response = await api.put(`/api/programmes/${programmeId}/mpp-approve`, { remarks: remarks || null });
  return response.data;
}

export async function rejectMppProgramme(programmeId, remarks) {
  const response = await api.put(`/api/programmes/${programmeId}/mpp-reject`, { remarks: remarks || null });
  return response.data;
}
