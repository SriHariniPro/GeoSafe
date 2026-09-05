import axios from 'axios';
import { 
  DashboardSummary, Accident, Hotspot, HotspotEvolution,
  RiskPredictionResponse, SimulationResponse, RouteResponse,
  Intervention, EDASummary, ModelPerformance, User,
  DatasetMetadata, LocationItem, ConstructionSite
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const res = await api.get('/dashboard');
  return res.data;
};

export const getAccidents = async (params: Record<string, any> = {}) => {
  const res = await api.get('/accidents', { params });
  return res.data;
};

export const getDatasetMetadata = async (): Promise<DatasetMetadata> => {
  const res = await api.get('/accidents/meta');
  return res.data;
};

export const searchLocations = async (query: string): Promise<LocationItem[]> => {
  const res = await api.get('/accidents/locations', { params: { query } });
  return res.data;
};

export const getConstructionSites = async (): Promise<ConstructionSite[]> => {
  const res = await api.get('/construction');
  return res.data;
};

export const getHotspots = async (): Promise<Hotspot[]> => {
  const res = await api.get('/hotspots');
  return res.data;
};

export const getHotspotEvolution = async (): Promise<HotspotEvolution[]> => {
  const res = await api.get('/hotspots/evolution');
  return res.data;
};

export const triggerHotspotDetection = async (eps: number = 0.8, minSamples: number = 5) => {
  const res = await api.post(`/hotspots/detect?eps_km=${eps}&min_samples=${minSamples}`);
  return res.data;
};

export const predictRisk = async (payload: any): Promise<RiskPredictionResponse> => {
  const res = await api.post('/risk/predict', payload);
  return res.data;
};

export const runSimulation = async (payload: any): Promise<SimulationResponse> => {
  const res = await api.post('/simulation/what-if', payload);
  return res.data;
};

export const analyzeRoute = async (origin: string, destination: string): Promise<RouteResponse> => {
  const res = await api.post('/routes/analyze', { origin, destination });
  return res.data;
};

export const getInterventions = async (): Promise<Intervention[]> => {
  const res = await api.get('/interventions');
  return res.data;
};

export const generateInterventions = async (): Promise<Intervention[]> => {
  const res = await api.post('/interventions/generate');
  return res.data;
};

export const updateIntervention = async (id: number, payload: Partial<Intervention>): Promise<Intervention> => {
  const res = await api.put(`/interventions/${id}`, payload);
  return res.data;
};

export const getEDAData = async (): Promise<EDASummary> => {
  const res = await api.get('/analytics/eda');
  return res.data;
};

export const getModelPerformance = async (): Promise<ModelPerformance> => {
  const res = await api.get('/ml/performance');
  return res.data;
};

export const retrainModel = async () => {
  const res = await api.post('/ml/train');
  return res.data;
};

export const uploadExcelDataset = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/accidents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const loginUser = async (email: string, password: string) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const registerUser = async (name: string, email: string, password: string, role: string = 'user') => {
  const res = await api.post('/auth/register', { name, email, password, role });
  return res.data;
};

export default api;
