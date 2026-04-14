import axios from 'axios';
import { ethers } from 'ethers';
import RepairPassportArtifact from '../contracts/RepairPassport.json';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
export const CONTRACT_ABI = RepairPassportArtifact.abi;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// Blockchain Helpers
export const getWeb3Provider = () => {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  // Fallback to Hardhat Local Node (Dev Mode)
  return new ethers.JsonRpcProvider('http://127.0.0.1:8545');
};

export const getContract = async (withSigner = false) => {
  const provider = getWeb3Provider();
  if (withSigner) {
    if (window.ethereum) {
      const signer = await provider.getSigner();
      return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    } else {
      // Dev Mode: Use Hardhat Account #0 automatically
      const devKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
      const wallet = new ethers.Wallet(devKey, provider);
      return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
    }
  }
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};

export const isMetaMaskInstalled = () => typeof window.ethereum !== 'undefined';
// Auth
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);

// Request interceptor to add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('idrp_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Products
export const registerProduct = (data) => api.post('/products/register', data);
export const getProduct = (productId) => api.get(`/products/${productId}`);
export const listProducts = (page = 1, limit = 20) => api.get(`/products?page=${page}&limit=${limit}`);

// Repairs
export const logRepair = (data) => api.post('/repairs/log', data);
export const getRepairs = (productId) => api.get(`/repairs/${productId}`);
export const verifyRepair = (repairId) => api.patch(`/repairs/verify/${repairId}`);

// Transfers
export const transferOwnership = (data) => api.post('/transfers/execute', data);
export const getTransfers = (productId) => api.get(`/transfers/${productId}`);

// Dashboard
export const getStats = () => api.get('/dashboard/stats');
export const getCityRepairs = () => api.get('/dashboard/city-repairs');
export const getLifecycleData = () => api.get('/dashboard/lifecycle');
export const getActivity = (limit = 10) => api.get(`/dashboard/activity?limit=${limit}`);

// Health
export const healthCheck = () => api.get('/health');

export default api;
