// api/ecg.js
import axios from "axios";

const API_URL = "http://localhost:5001/api/ecg";

export const startECG = async () => {
  try {
    const res = await axios.post(`${API_URL}/start`, {}, { withCredentials: true });
    return res.data;
  } catch (err) {
    console.error("Error starting ECG:", err);
  }
};

export const stopECG = async () => {
  try {
    const res = await axios.post(`${API_URL}/stop`, {}, { withCredentials: true });
    return res.data;
  } catch (err) {
    console.error("Error stopping ECG:", err);
  }
};
