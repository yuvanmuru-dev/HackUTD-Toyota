import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Get or create session ID
export const getSessionId = () => {
  if (typeof window !== 'undefined') {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }
  return uuidv4();
};

// API client
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Vehicle {
  id: number;
  model: string;
  year: number;
  trim: string;
  price: number;
  drivetrain: string;
  mpg_city: number;
  mpg_highway: number;
  mpg_combined: number;
  engine: string;
  transmission: string;
  seating: number;
  cargo_volume: number;
  towing_capacity: number;
  safety_rating: number;
  image_url: string;
  category: string;
  features: string;
}

export interface VehicleFilter {
  model?: string;
  min_price?: number;
  max_price?: number;
  drivetrain?: string;
  min_mpg?: number;
  category?: string;
  search_query?: string;
}

export interface FinanceRequest {
  vehicle_price: number;
  down_payment: number;
  trade_in_value: number;
  interest_rate: number;
  loan_term_months: number;
  include_tax: boolean;
  tax_rate: number;
  include_fees: boolean;
  fees: number;
}

export interface FinanceResponse {
  monthly_payment: number;
  total_loan_amount: number;
  total_interest_paid: number;
  total_amount_paid: number;
  breakdown: {
    vehicle_price: number;
    tax: number;
    fees: number;
    down_payment: number;
    trade_in_value: number;
    financed_amount: number;
  };
}

export interface LeaseRequest {
  vehicle_price: number;
  down_payment: number;
  residual_value: number;
  money_factor: number;
  lease_term_months: number;
  sales_tax_rate: number;
  fees: number;
}

export interface LeaseResponse {
  monthly_payment: number;
  total_lease_cost: number;
  depreciation: number;
  finance_charge: number;
  total_taxes: number;
  breakdown: {
    vehicle_price: number;
    residual_value: number;
    down_payment: number;
    monthly_depreciation: number;
    monthly_finance_charge: number;
    monthly_tax: number;
    acquisition_fees: number;
  };
}

export interface ComparisonRequest {
  session_id: string;
  vehicle_ids: number[];
}

export interface ComparisonResponse {
  vehicles: Vehicle[];
  comparison_table: { [key: string]: any[] };
}

// API functions
export const vehicleApi = {
  // Get all vehicles with filters
  getVehicles: async (filters?: VehicleFilter): Promise<Vehicle[]> => {
    const { data } = await api.get('/cars', { params: filters });
    return data;
  },

  // Get single vehicle
  getVehicle: async (id: number): Promise<Vehicle> => {
    const { data } = await api.get(`/cars/${id}`);
    return data;
  },

  // Compare vehicles
  compareVehicles: async (vehicleIds: number[]): Promise<ComparisonResponse> => {
    const { data } = await api.post('/compare', {
      session_id: getSessionId(),
      vehicle_ids: vehicleIds,
    });
    return data;
  },

  // Calculate finance
  calculateFinance: async (request: FinanceRequest): Promise<FinanceResponse> => {
    const { data } = await api.post('/finance', request);
    return data;
  },

  // Calculate lease
  calculateLease: async (request: LeaseRequest): Promise<LeaseResponse> => {
    const { data } = await api.post('/lease', request);
    return data;
  },

  // Favorites
  getFavorites: async (): Promise<any[]> => {
    const { data } = await api.get(`/favorites/${getSessionId()}`);
    return data;
  },

  addFavorite: async (vehicleId: number): Promise<any> => {
    const { data } = await api.post('/favorites', {
      user_id: getSessionId(),
      vehicle_id: vehicleId,
    });
    return data;
  },

  removeFavorite: async (vehicleId: number): Promise<any> => {
    const { data } = await api.delete(`/favorites/${getSessionId()}/${vehicleId}`);
    return data;
  },

  // View history
  addToHistory: async (vehicleId: number): Promise<any> => {
    const { data } = await api.post('/history', {
      user_id: getSessionId(),
      vehicle_id: vehicleId,
    });
    return data;
  },

  getHistory: async (limit: number = 10): Promise<any[]> => {
    const { data } = await api.get(`/history/${getSessionId()}`, {
      params: { limit },
    });
    return data;
  },
};
