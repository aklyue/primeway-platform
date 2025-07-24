import axios from "axios";

const axiosInstance = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}`,
});
// Interceptor to inject the token for every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getOrgMembers = (orgId: string) =>
  axiosInstance.get(`/organizations/${orgId}/members`);
export const addOrgMember = (orgId: string, email: string) =>
  axiosInstance.post(`/organizations/${orgId}/members`, { email });
export const removeOrgMember = (orgId: string, email: string) =>
  axiosInstance.delete(`/organizations/${orgId}/members`, { data: { email } });

export default axiosInstance;
