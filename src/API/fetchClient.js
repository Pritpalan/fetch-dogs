import axios from "axios";
import { toast } from "react-hot-toast";

const fetchClient = axios.create({
  baseURL: "https://frontend-take-home-service.fetch.com",
  withCredentials: true,
});

fetchClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      toast.error("Session expired. Please log in again.", {
        id: "session-expired",
      });

      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    }
    return Promise.reject(error);
  }
);

export default fetchClient;
