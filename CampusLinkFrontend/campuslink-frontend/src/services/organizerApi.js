import api from './api';

const deleteDraftRequest = async (organizerId, programmeId) => {
  await api.delete(`/api/organizers/me/programmes/${programmeId}/draft`, { params: { organizerId } });
};

export async function fetchOrganizerDashboard(organizerId) {
  const response = await api.get('/api/organizers/me/dashboard', { params: { organizerId } });
  return response.data;
}

export async function fetchOrganizerProgrammes(organizerId, { operationalOnly = false } = {}) {
  const response = await api.get('/api/organizers/me/programmes', {
    params: { organizerId, operationalOnly },
  });
  return response.data || [];
}

export async function deleteOrganizerDraft(organizerId, programmeId) {
  await deleteDraftRequest(organizerId, programmeId);
}

export async function fetchProgrammeAttendance(organizerId, programmeId) {
  const response = await api.get(`/api/organizers/me/programmes/${programmeId}/attendance`, {
    params: { organizerId },
  });
  return response.data || [];
}

export async function fetchCurrentAttendanceSession(organizerId, programmeId) {
  const response = await api.get(`/api/organizers/me/programmes/${programmeId}/attendance/sessions/current`, {
    params: { organizerId },
  });
  return response.data;
}

export async function startAttendanceSession(organizerId, programmeId) {
  const response = await api.post(
    `/api/organizers/me/programmes/${programmeId}/attendance/sessions/start`,
    null,
    { params: { organizerId } }
  );
  return response.data;
}

export async function pauseAttendanceSession(organizerId, programmeId) {
  const response = await api.post(
    `/api/organizers/me/programmes/${programmeId}/attendance/sessions/pause`,
    null,
    { params: { organizerId } }
  );
  return response.data;
}

export async function resumeAttendanceSession(organizerId, programmeId) {
  const response = await api.post(
    `/api/organizers/me/programmes/${programmeId}/attendance/sessions/resume`,
    null,
    { params: { organizerId } }
  );
  return response.data;
}

export async function endAttendanceSession(organizerId, programmeId) {
  const response = await api.post(
    `/api/organizers/me/programmes/${programmeId}/attendance/sessions/end`,
    null,
    { params: { organizerId } }
  );
  return response.data;
}

export async function issueOrganizerCertificate(organizerId, programmeId, registrationId) {
  const response = await api.post(
    `/api/organizers/me/programmes/${programmeId}/certificates/issue`,
    null,
    { params: { organizerId, registrationId } }
  );
  return response.data;
}

export async function issueAllOrganizerCertificates(organizerId, programmeId) {
  const response = await api.post(
    `/api/organizers/me/programmes/${programmeId}/certificates/issue-all`,
    null,
    { params: { organizerId } }
  );
  return response.data;
}
