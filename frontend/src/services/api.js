import axios from 'axios';

// Resolves the API base:
//  - Dev: Vite dev server (http://127.0.0.1:8000/api)
//  - Prod: point VITE_API_URL (Vercel project env var) at the deployed
//    backend, e.g. "https://innoquest-api.onrender.com/api".
//    Never bake localhost into a production build - that is what made
//    every live-site request hit the visitor's own machine and fail.
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? `${window.location.origin}/api`
    : 'http://127.0.0.1:8000/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Projects
export const createProject = async (data) => {
  const resp = await api.post('/projects', data);
  return resp.data;
};

export const getProjects = async () => {
  const resp = await api.get('/projects');
  return resp.data;
};

export const getProjectDetails = async (projectId) => {
  const resp = await api.get(`/projects/${projectId}`);
  return resp.data;
};

// Project Module Suggestions
export const generateModuleSuggestions = async (projectId) => {
  const resp = await api.post('/modules/suggest', { project_id: projectId });
  return resp.data;
};

export const getModuleSuggestions = async (projectId) => {
  const resp = await api.get(`/modules/${projectId}`);
  return resp.data;
};

// Innovation Advisor
export const analyzeInnovation = async (data) => {
  const resp = await api.post('/innovation/analyze', data);
  return resp.data;
};

export const getInnovationAnalysis = async (projectId) => {
  const resp = await api.get(`/innovation/${projectId}`);
  return resp.data;
};

// Research Gap Finder
export const analyzeResearchGap = async (data) => {
  const resp = await api.post('/research-gap/analyze', data);
  return resp.data;
};

export const getResearchGap = async (projectId) => {
  const resp = await api.get(`/research-gap/${projectId}`);
  return resp.data;
};

// Gamified Innovation Journey
export const getJourneyProgress = async (projectId) => {
  const resp = await api.get(`/journey/${projectId}`);
  return resp.data;
};

export const completeJourneyStage = async (projectId, stageName) => {
  const resp = await api.post(`/journey/${projectId}/complete-stage`, { stage_name: stageName });
  return resp.data;
};

// Project Readiness
export const getProjectReadiness = async (projectId) => {
  const resp = await api.get(`/readiness/${projectId}`);
  return resp.data;
};

// AI Pitch Generator
export const generatePitch = async (projectId) => {
  const resp = await api.post('/pitch/generate', { project_id: projectId });
  return resp.data;
};

export const getPitch = async (projectId) => {
  const resp = await api.get(`/pitch/${projectId}`);
  return resp.data;
};

export default api;
