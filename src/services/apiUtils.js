/**
 * API Utilities - Common patterns and helpers for API interactions
 */

/**
 * Handle API errors and provide user-friendly messages
 * @param {Object} error - Error object from API
 * @returns {Object} Formatted error with message and details
 */
export const handleApiError = (error) => {
  const defaultMessage = "An unexpected error occurred";

  if (!error) {
    return { message: defaultMessage, status: null };
  }

  if (typeof error === "string") {
    return { message: error, status: null };
  }

  const status = error.status || error.response?.status;
  const message = error.message || error.data?.message || defaultMessage;
  const details = error.data?.errors || error.errors || {};

  const errorMessages = {
    400: "Invalid request. Please check your input.",
    401: "Unauthorized. Please log in again.",
    403: "Access forbidden.",
    404: "Resource not found.",
    409: "Conflict. This resource may already exist.",
    422: "Validation failed. Please check your input.",
    429: "Too many requests. Please try again later.",
    500: "Server error. Please try again later.",
    502: "Service unavailable. Please try again later.",
    503: "Service temporarily unavailable.",
    504: "Gateway timeout. Please try again.",
  };

  return {
    status,
    message: errorMessages[status] || message,
    details,
    originalError: error,
  };
};

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxAttempts - Maximum retry attempts
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Result of function
 */
export const retryWithBackoff = async (
  fn,
  maxAttempts = 3,
  baseDelay = 1000,
) => {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

/**
 * Create a debounced API call
 * @param {Function} apiFn - API function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounceApiCall = (apiFn, delay = 500) => {
  let timeoutId = null;

  return (...args) => {
    return new Promise((resolve, reject) => {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        apiFn(...args)
          .then(resolve)
          .catch(reject);
      }, delay);
    });
  };
};

/**
 * Create a throttled API call
 * @param {Function} apiFn - API function to throttle
 * @param {number} limit - Minimum time between calls in milliseconds
 * @returns {Function} Throttled function
 */
export const throttleApiCall = (apiFn, limit = 1000) => {
  let inThrottle = false;
  let lastResult = null;

  return (...args) => {
    if (!inThrottle) {
      inThrottle = true;
      const result = apiFn(...args);
      lastResult = result;

      setTimeout(() => {
        inThrottle = false;
      }, limit);

      return result;
    }

    return lastResult || Promise.resolve(null);
  };
};

/**
 * Batch multiple API requests and execute them together
 * @param {Array<Promise>} requests - Array of API promises
 * @param {Object} options - Batch options
 * @returns {Promise<Array>} Results of all requests
 */
export const batchApiRequests = async (
  requests,
  options = { continueOnError: false },
) => {
  try {
    if (options.continueOnError) {
      const results = await Promise.allSettled(requests);
      return results.map((result) => ({
        status: result.status,
        data: result.value,
        error: result.reason,
      }));
    } else {
      return await Promise.all(requests);
    }
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Paginate API requests
 * @param {Function} apiFn - API function that accepts page parameter
 * @param {number} totalPages - Total number of pages
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>} All paginated results combined
 */
export const paginateApiRequests = async (
  apiFn,
  totalPages,
  options = { delay: 100 },
) => {
  const results = [];

  for (let page = 1; page <= totalPages; page++) {
    try {
      const result = await apiFn(page);
      results.push(...(Array.isArray(result) ? result : [result]));

      if (page < totalPages && options.delay) {
        await new Promise((resolve) => setTimeout(resolve, options.delay));
      }
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
      throw error;
    }
  }

  return results;
};

/**
 * Poll an API endpoint until a condition is met
 * @param {Function} apiFn - API function to poll
 * @param {Function} condition - Condition to check result
 * @param {Object} options - Polling options
 * @returns {Promise} Result when condition is met
 */
export const pollApi = async (
  apiFn,
  condition,
  options = { maxAttempts: 10, interval: 1000 },
) => {
  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    const result = await apiFn();

    if (condition(result)) {
      return result;
    }

    if (attempt < options.maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, options.interval));
    }
  }

  throw new Error("Polling condition not met within max attempts");
};

/**
 * Transform API response data
 * @param {any} data - Response data
 * @param {Function} transformer - Transformation function
 * @returns {any} Transformed data
 */
export const transformData = (data, transformer) => {
  try {
    return transformer(data);
  } catch (error) {
    console.error("Data transformation error:", error);
    return data;
  }
};

/**
 * Validate API response structure
 * @param {Object} data - Response data
 * @param {Array<string>} requiredFields - Required fields
 * @returns {boolean} True if valid
 */
export const validateResponse = (data, requiredFields = []) => {
  if (!data) return false;
  return requiredFields.every((field) => field in data);
};

/**
 * Create abort controller for cancellable requests
 * @returns {Object} Abort controller object
 */
export const createCancellableRequest = () => {
  const controller = new AbortController();

  return {
    controller,
    signal: controller.signal,
    cancel: () => controller.abort(),
    isCancelled: () => controller.signal.aborted,
  };
};

/**
 * Merge multiple API responses
 * @param {Array} responses - Array of response data
 * @param {Function} merger - Custom merge function
 * @returns {any} Merged result
 */
export const mergeResponses = (responses, merger = null) => {
  if (merger && typeof merger === "function") {
    return merger(responses);
  }

  // Default merge for arrays
  if (Array.isArray(responses[0])) {
    return responses.flat();
  }

  // Default merge for objects
  return Object.assign({}, ...responses);
};

/**
 * Create a request interceptor for common headers
 * @param {Object} headers - Headers to add
 * @returns {Function} Interceptor function
 */
export const createHeadersInterceptor = (headers = {}) => {
  return (config) => {
    Object.assign(config.headers, headers);
    return config;
  };
};

/**
 * Format query parameters
 * @param {Object} params - Parameters object
 * @returns {string} Query string
 */
export const formatQueryParams = (params) => {
  return new URLSearchParams(
    Object.entries(params).filter(
      ([, value]) => value !== null && value !== undefined,
    ),
  ).toString();
};

/**
 * Safe JSON parse with fallback
 * @param {string} jsonString - JSON string to parse
 * @param {any} fallback - Fallback value if parsing fails
 * @returns {any} Parsed object or fallback
 */
export const safeJsonParse = (jsonString, fallback = null) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("JSON parse error:", error);
    return fallback;
  }
};

/**
 * Get auth header with token
 * @returns {Object} Authorization header
 */
export const getAuthHeader = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Check if response is successful
 * @param {Object} response - API response
 * @returns {boolean} True if successful
 */
export const isSuccessResponse = (response) => {
  return response?.status >= 200 && response?.status < 300;
};

/**
 * Check if error is network related
 * @param {Object} error - Error object
 * @returns {boolean} True if network error
 */
export const isNetworkError = (error) => {
  return !error.response || error.message === "Network Error";
};

/**
 * Check if error is timeout
 * @param {Object} error - Error object
 * @returns {boolean} True if timeout error
 */
export const isTimeoutError = (error) => {
  return error.code === "ECONNABORTED";
};

export default {
  handleApiError,
  retryWithBackoff,
  debounceApiCall,
  throttleApiCall,
  batchApiRequests,
  paginateApiRequests,
  pollApi,
  transformData,
  validateResponse,
  createCancellableRequest,
  mergeResponses,
  createHeadersInterceptor,
  formatQueryParams,
  safeJsonParse,
  getAuthHeader,
  isSuccessResponse,
  isNetworkError,
  isTimeoutError,
};
