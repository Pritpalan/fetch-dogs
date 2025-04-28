import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";


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
      const navigate = useNavigate();

      setTimeout(() => {
        // window.location.href = '/';
        navigate("/");
      }, 2000);
    }
    return Promise.reject(error);
  }
);

export default fetchClient;
