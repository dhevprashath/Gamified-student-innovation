import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

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
