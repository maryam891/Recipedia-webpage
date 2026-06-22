import axios from "axios";
const api = axios.create({
  baseURL: "/",
  withCredentials: true,
});
//Use axios interceptor to check when session is expired(401) and if url is not Login since session can expire on other pages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !window.location.href.includes("/Login")
    ) {
      window.location.href = "/Login?sessionExpired=1";
    }
    return Promise.reject(error);
  },
);

export default api;
