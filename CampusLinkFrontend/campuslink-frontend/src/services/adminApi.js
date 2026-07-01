import api from './api';

export async function fetchUserOverview(requesterId) {
  const response = await api.get('/api/admin/users/overview', { params: { requesterId } });
  return response.data;
}

export async function fetchUsers(requesterId, role) {
  const params = { requesterId };
  if (role && role !== 'ALL') params.role = role;
  const response = await api.get('/api/admin/users', { params });
  return response.data || [];
}

export async function revokeUserRole(userId, reviewerId, reviewNotes) {
  const response = await api.post(
    `/api/admin/users/${userId}/revoke-role`,
    { reviewNotes },
    { params: { reviewerId } }
  );
  return response.data;
}

export async function removeUserAccount(userId, reviewerId, reason) {
  const response = await api.post(
    `/api/admin/users/${userId}/remove`,
    { reason },
    { params: { reviewerId } }
  );
  return response.data;
}
