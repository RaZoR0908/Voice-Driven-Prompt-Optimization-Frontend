import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const submitVoice = (formData) => api.post("/api/voice/input", formData);
export const generatePrompt = (payload, sessionId) =>
  api.post("/api/prompt/generate", payload, {
    headers: {
      "X-Session-Id": sessionId,
    },
  });
export const getHistory = (sessionId) =>
  api.get(`/api/chat/history?sessionId=${sessionId}`);
export const getMemoryGraph = () => api.get("/api/memory/graph");
export const getMemoryCards = () => api.get("/api/memory/cards");
export const getDecisionLogs = (messageId) =>
  api.get(`/api/logs?messageId=${messageId}`);
