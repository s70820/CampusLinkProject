import api from './api';
import { mapProgrammeFromApi } from '../utils/programmeMapper';

export async function fetchApprovedProgrammes(userId) {
  const params = userId != null && userId !== '' ? { userId: Number(userId) } : undefined;
  const response = await api.get('/api/programmes/browse', { params });
  return (response.data || []).map(mapProgrammeFromApi);
}
