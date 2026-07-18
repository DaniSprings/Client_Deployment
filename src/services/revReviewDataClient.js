/**
 * RevReviewData API Client
 *
 * This client provides methods to interact with the RevReviewData database API.
 * All endpoints are read-only (GET requests only).
 */

const normalizeApiBase = (value, fallback) => {
  const raw = (value || fallback || "").trim();

  if (!raw) {
    return fallback;
  }

  const withProtocol = /^https?:\/\//i.test(raw)
    ? raw
    : `https://${raw.replace(/^\/+/, "")}`;

  return withProtocol.replace(/\/$/, "");
};

const API_BASE_URL = normalizeApiBase(
  import.meta.env.VITE_API_URL,
  "https://clientapi-production-afc7.up.railway.app",
);

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Brands API
 */
export const brandsAPI = {
  // Get all brands
  getAll: async () => {
    return await fetchAPI("/api/brands");
  },

  // Get brand by ID
  getById: async (id) => {
    return await fetchAPI(`/api/brands/${id}`);
  },

  // Get total count of brands
  getCount: async () => {
    return await fetchAPI("/api/brands/count");
  },
};

/**
 * Models API
 */
export const modelsAPI = {
  // Get all models (includes related data: brand, price, performance, dimensions)
  getAll: async () => {
    return await fetchAPI("/api/models");
  },

  // Get model by ID (includes related data)
  getById: async (id) => {
    return await fetchAPI(`/api/models/${id}`);
  },

  // Get total count of models
  getCount: async () => {
    return await fetchAPI("/api/models/count");
  },

  // Search models by name
  search: async (name) => {
    return await fetchAPI(
      `/api/models/search?name=${encodeURIComponent(name)}`,
    );
  },
};

/**
 * Vehicle Dimensions API
 */
export const dimensionsAPI = {
  // Get all vehicle dimensions
  getAll: async () => {
    return await fetchAPI("/api/vehicledimensions");
  },

  // Get dimensions by DIM_ID
  getById: async (dimId) => {
    return await fetchAPI(`/api/vehicledimensions/${dimId}`);
  },
};

/**
 * Engine Performance API
 */
export const performanceAPI = {
  // Get all engine performance records
  getAll: async () => {
    return await fetchAPI("/api/engineperformance");
  },

  // Get performance by Performance_ID
  getById: async (performanceId) => {
    return await fetchAPI(`/api/engineperformance/${performanceId}`);
  },
};

/**
 * Prices API
 */
export const pricesAPI = {
  // Get all prices
  getAll: async () => {
    return await fetchAPI("/api/prices");
  },

  // Get price by Model_ID
  getById: async (modelId) => {
    return await fetchAPI(`/api/prices/${modelId}`);
  },
};

export const towingAPI = {
  getAll: async () => {
    return await fetchAPI("/api/towing");
  },
  getById: async (towingId) => {
    return await fetchAPI(`/api/towing/${towingId}`);
  }
};

export const safetyAPI = {
  getAll: async () => {
    return await fetchAPI("/api/safety");
  },
  getById: async (safetyId) => {
    return await fetchAPI(`/api/safety/${safetyId}`);
  }
};

/**
 * Database Connection Test
 */
export const testConnection = async () => {
  return await fetchAPI("/test-revreviewdata");
};

/**
 * Combined API object for easy importing
 */
const revReviewDataAPI = {
  brands: brandsAPI,
  models: modelsAPI,
  dimensions: dimensionsAPI,
  performance: performanceAPI,
  prices: pricesAPI,
  safety: safetyAPI,
  towing: towingAPI,
  testConnection,
};

export default revReviewDataAPI;
