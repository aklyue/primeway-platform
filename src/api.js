import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://api.primeway.io',
  withCredentials: true,  // Include cookies in requests
});


export const getOrgMembers = (orgId) => axiosInstance.get(`/organizations/${orgId}/members`);
export const addOrgMember = (orgId, email) => axiosInstance.post(`/organizations/${orgId}/members`, { email });
export const removeOrgMember = (orgId, email) => axiosInstance.delete(`/organizations/${orgId}/members`, { data: { email } });

export default axiosInstance;
