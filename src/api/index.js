import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const submitVoice = (formData) => {
  // Add client timestamp and timezone offset
  const now = new Date();
  formData.append("clientTimestamp", now.toISOString());
  // Get timezone offset in minutes (e.g., -330 for IST = UTC+5:30)
  formData.append("clientTimezoneOffset", now.getTimezoneOffset());
  return api.post("/api/voice/input", formData);
};
export const generatePrompt = (payload, sessionId) =>
  api.post("/api/prompt/generate", payload, {
    headers: {
      "X-Session-Id": sessionId,
    },
  });
export const getHistory = (sessionId) =>
  api.get(`/api/chat/history?sessionId=${sessionId}`);
export const getMemoryGraph = () => api.get("/api/memory/graph");
export const getMemoryCards = (sessionId) =>
  api.get(`/api/memory/cards?sessionId=${sessionId}`);
export const getDecisionLogs = (messageId) =>
  api.get(`/api/logs?messageId=${messageId}`);
