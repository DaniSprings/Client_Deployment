import axios from "axios";

const normalizeApiBase = (value, fallback) => {
  const raw = (value || fallback || "").trim();
  if (!raw) return fallback;
  const withProtocol = /^https?:\/\//i.test(raw)
    ? raw
    : `https://${raw.replace(/^\/+/, "")}`;
  return withProtocol.replace(/\/$/, "");
};

export const API_BASE = normalizeApiBase(
  import.meta.env.VITE_API_URL,
  "https://clientapi-production-afc7.up.railway.app",
);

// ─── Removed: localhost fallback that was retrying failed production
// requests against http://localhost4000 (invalid URL, wrong in production)

// Cache configuration
const cache = new Map();
let CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Retry config — only retries on transient server errors, never on network
// failures that would previously trigger the localhost fallback
const requestRetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// Request interceptor — add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  },
);

// Response interceptor — handle errors, NO localhost fallback
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const { config, response } = error;

    // Handle 401 — clear auth and redirect to login
    if (response?.status === 401 && !config?.suppressAuthRedirect) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      window.location.href = "/login";
    }

    const serverErrorMessage =
      response?.data?.error || response?.data?.message || error.message;

    console.error(
      `[API Error] ${response?.status || "Network"} ${config?.url}`,
      serverErrorMessage,
    );

    return Promise.reject({
      status: response?.status,
      message: serverErrorMessage,
      data: response?.data,
      config,
    });
  },
);

// Cache helpers
const getCachedData = (key) => {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_DURATION) {
    console.log(`[Cache Hit] ${key}`);
    return item.data;
  }
  cache.delete(key);
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Retry logic — server errors only, not network failures
const withRetry = async (requestFn, retries = 0) => {
  try {
    return await requestFn();
  } catch (error) {
    const shouldRetry =
      retries < requestRetryConfig.maxRetries &&
      requestRetryConfig.retryableStatusCodes.includes(error.status);

    if (shouldRetry) {
      const delay = requestRetryConfig.retryDelay * Math.pow(2, retries);
      console.log(`[Retry] Attempt ${retries + 1}/${requestRetryConfig.maxRetries} after ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return withRetry(requestFn, retries + 1);
    }

    throw error;
  }
};

// HTTP methods
export const get = (url, config = {}) => {
  const cacheKey = `GET_${url}`;
  const shouldUseCache = config.cache !== false;

  if (shouldUseCache) {
    const cached = getCachedData(cacheKey);
    if (cached) return Promise.resolve({ data: cached });
  }

  return withRetry(() =>
    api.get(url, config).then((response) => {
      if (shouldUseCache) setCachedData(cacheKey, response.data);
      return response;
    }),
  );
};

export const post = (url, data, config = {}) => {
  if (config.skipRetry) {
    const { skipRetry: _skipRetry, ...requestConfig } = config;
    return api.post(url, data, requestConfig);
  }
  return withRetry(() => api.post(url, data, config));
};

export const put = (url, data, config = {}) =>
  withRetry(() => api.put(url, data, config));

export const del = (url, config = {}) =>
  withRetry(() => api.delete(url, config));

// Utilities
export const clearCache = (pattern = null) => {
  if (pattern) {
    Array.from(cache.keys()).forEach((key) => {
      if (key.includes(pattern)) cache.delete(key);
    });
    console.log(`[Cache] Cleared keys matching: ${pattern}`);
  } else {
    cache.clear();
    console.log("[Cache] Cleared all");
  }
};

export const setCacheDuration = (duration) => { CACHE_DURATION = duration; };

export const getApiStatus = async () => {
  try {
    const response = await api.get("/health");
    return { status: "healthy", data: response.data };
  } catch (error) {
    return { status: "unhealthy", error: error.message };
  }
};

// ─── Model Table API ──────────────────────────────────────────────────────────
export const models = {
  getRanges: () => get("/api/models/ranges", { cache: true }),
  getPrices: () => get("/api/models/prices", { cache: true }),
  getEngines: () => get("/api/models/engines", { cache: true }),
  getPerformance: () => get("/api/models/performance", { cache: true }),
  getModelDetail: (id) => get(`/api/models/model/${id}`, { cache: true }),
  searchModels: (query) =>
    get(`/api/models/models/search?q=${encodeURIComponent(query)}`),
  searchModelTableBrands: (query) =>
    get(`/api/models/model-table/brands/search?q=${encodeURIComponent(query)}`),
  searchModelTableModels: (brand, query) =>
    get(`/api/models/model-table/models/search?brand=${encodeURIComponent(brand)}&q=${encodeURIComponent(query)}`),
  getModelTableModelsByBrand: (brand) =>
    get(`/api/models/model-table/models/by-brand?brand=${encodeURIComponent(brand)}`),
  searchModelTableResults: (brand, model) =>
    get(`/api/models/model-table/search?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`),
  getAllBrands: () => get("/api/models/brands/all", { cache: true }),
  getBrandsWithCount: () => get("/api/models/brands/with-count", { cache: true }),
  getModelsByBrand: (brand) =>
    get(`/api/models/model-table/models/by-brand?brand=${encodeURIComponent(brand)}`, { cache: true }),
  getYearsByBrandModel: (brand, model) =>
    get(`/api/models/years/by-brand-model?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`, { cache: true }),
  getCarDetails: (brand, model, year) =>
    get(`/api/models/details?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}&year=${encodeURIComponent(year)}`),
  getCarStats: (brand, model) =>
    get(`/api/models/carstats/${encodeURIComponent(brand)}/${encodeURIComponent(model)}`),
  getCarStatsByYear: (brand, model, year) =>
    get(`/api/models/carstats/${encodeURIComponent(brand)}/${encodeURIComponent(model)}/${encodeURIComponent(year)}`),
  getCarStatsBatch: (carRequests) => post("/api/models/carstats/batch", carRequests),
  getVehicleData: (payload) => post("/api/models/vehicle-data", payload),
  getDimensionsByBrandModel: (brand, model) =>
    get(`/api/models/dimensions/${encodeURIComponent(brand)}/${encodeURIComponent(model)}`),
  getMultipleCarsData: async (carsArray) => {
    const promises = carsArray.map((car) =>
      models.getCarDetails(car.brand, car.model, car.year)
        .catch((err) => ({ error: true, message: err.message, car })),
    );
    return Promise.all(promises);
  },
  getMultipleCarsParallel: async (carsArray) => {
    const allPromises = carsArray.map((car) => ({
      carId: car.id, brand: car.brand, model: car.model, year: car.year,
      dataPromises: Promise.all([
        get(`/api/models/price?brand=${encodeURIComponent(car.brand)}&model=${encodeURIComponent(car.model)}&year=${encodeURIComponent(car.year)}`).catch((e) => ({ error: true, type: "price", message: e.message })),
        get(`/api/models/engine?brand=${encodeURIComponent(car.brand)}&model=${encodeURIComponent(car.model)}&year=${encodeURIComponent(car.year)}`).catch((e) => ({ error: true, type: "engine", message: e.message })),
        get(`/api/models/performance?brand=${encodeURIComponent(car.brand)}&model=${encodeURIComponent(car.model)}&year=${encodeURIComponent(car.year)}`).catch((e) => ({ error: true, type: "performance", message: e.message })),
        get(`/api/models/range?brand=${encodeURIComponent(car.brand)}&model=${encodeURIComponent(car.model)}&year=${encodeURIComponent(car.year)}`).catch((e) => ({ error: true, type: "range", message: e.message })),
      ]),
    }));
    return Promise.all(allPromises.map(async (item) => {
      const [price, engine, performance, range] = await item.dataPromises;
      return { carId: item.carId, brand: item.brand, model: item.model, year: item.year, data: { price, engine, performance, range } };
    }));
  },
  invalidateCache: () => { clearCache("models"); clearCache("brands"); clearCache("carstats"); },
};

// ─── Cars API ─────────────────────────────────────────────────────────────────
export const cars = {
  getAllBrands: () => get("/api/cars/brands", { cache: true }),
  searchBrands: (query) => get(`/api/cars/brands/search?q=${encodeURIComponent(query)}`),
  autoCorrectBrand: (query) => get(`/api/cars/brands/autocorrect?q=${encodeURIComponent(query)}`),
  getModelsByBrand: (brand) => get(`/api/cars/models?brand=${encodeURIComponent(brand)}`, { cache: true }),
  searchModels: (query, brand) => get(`/api/cars/models/search?q=${encodeURIComponent(query)}&brand=${encodeURIComponent(brand)}`),
  autoCorrectModel: (query, brand) => get(`/api/cars/models/autocorrect?q=${encodeURIComponent(query)}&brand=${encodeURIComponent(brand)}`),
  getYearsByBrandModel: (brand, model) => get(`/api/cars/years?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`, { cache: true }),
  getCarDetails: (brand, model, year = null) => {
    let url = `/api/cars/details?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`;
    if (year) url += `&year=${encodeURIComponent(year)}`;
    return get(url);
  },
  getAllCarsByBrandModel: (brand, model) => get(`/api/cars/all?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`),
  invalidateCache: () => { clearCache("cars"); clearCache("brands"); },
};

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const auth = {
  register: (email, username, fullName, extra) =>
    post("/api/login/register", {
      email,
      password: extra.password,
      name: extra.name,
      surname: extra.surname,
      dob: extra.dob,
      occupation: extra.occupation,
    }),
  socialLogin: (provider, providerId, email, fullName) =>
    post("/api/auth/social-login", { provider, providerId, email, fullName }),
  trackSearch: (userId, searchTerm, filter) =>
    post("/api/auth/search", { userId, searchTerm, filter }, { skipRetry: true, suppressAuthRedirect: true }),
  getUserSearches: (userId) => get(`/api/auth/user/${userId}/searches`),
  sendComparisonEmail: (cars) => post("/api/auth/send-comparison-email", { cars }),
  getCurrentUser: () => get("/api/auth/me", { cache: false }),
  updateProfile: (userId, profileData) => put(`/api/auth/user/${userId}`, profileData),
  changePassword: (userId, oldPassword, newPassword) =>
    post("/api/auth/change-password", { userId, oldPassword, newPassword }),
  logout: () => {
    clearCache();
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    return post("/api/auth/logout", {});
  },
};

export default api;