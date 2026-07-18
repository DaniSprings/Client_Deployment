/**
 * supabaseVehicleService.js
 *
 * Frontend service layer — bridges CarStats.jsx (and other components)
 * to the Node/Express API, which queries Supabase via vehicleRepository.
 *
 * All methods return plain values; callers never unwrap { data, error }.
 *
 * API response shapes handled:
 *   /api/cars/brands          → string[]  OR  { data: string[] }
 *   /api/cars/models          → string[]  OR  { data: string[] }
 *   /api/cars/details         → object    OR  { data: object }
 *   /api/cars/all             → object[]  OR  { data: object[] }
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',   // send cookies if auth is cookie-based
    ...options,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status} on ${path}: ${body}`);
  }

  return res.json();
}

/** Unwraps { data: T } | T — some endpoints wrap, some don't. */
const unwrap = (payload) =>
  payload && typeof payload === 'object' && 'data' in payload
    ? payload.data
    : payload;

/** Guarantee the result is an array. */
const toArray = (value) => (Array.isArray(value) ? value : []);

// ─── Service ──────────────────────────────────────────────────────────────────

export const supabaseVehicleService = {
  /**
   * All brand name strings.
   * Returns: string[]
   */
  async getAllBrands() {
    try {
      const raw = await apiFetch('/api/cars/brands');
      return toArray(unwrap(raw));
    } catch (err) {
      console.error('[supabaseVehicleService] getAllBrands:', err);
      return [];
    }
  },

  /**
   * Brands with vehicle counts, normalised to { name, count }.
   * CarStats.jsx maps over this with `brand.name`.
   * Returns: { name: string, count: number }[]
   */
  async getBrandsWithCount() {
    try {
      const raw  = await apiFetch('/api/cars/brands');
      const rows = toArray(unwrap(raw));

      if (rows.length === 0) return [];

      // If the endpoint already returns { name, count } objects, pass through.
      // Otherwise it's a plain string array — wrap each entry.
      if (typeof rows[0] === 'object' && rows[0] !== null) {
        return rows.map((item) => ({
          name:
            item.name        ??
            item.BrandNames  ??
            item.brand_names ??
            item.brandName   ??
            '',
          count: item.count ?? item.vehicle_count ?? item.vehicleCount ?? 0,
        }));
      }

      // Plain string array — no counts available from this endpoint
      return rows.map((name) => ({ name: String(name), count: 0 }));
    } catch (err) {
      console.error('[supabaseVehicleService] getBrandsWithCount:', err);
      return [];
    }
  },

  /**
   * Model name strings for a given brand.
   * Returns: string[]
   */
  async getModelsByBrand(brand) {
    if (!brand) return [];
    try {
      const raw = await apiFetch(
        `/api/cars/models?brand=${encodeURIComponent(brand)}`,
      );
      return toArray(unwrap(raw));
    } catch (err) {
      console.error(`[supabaseVehicleService] getModelsByBrand(${brand}):`, err);
      return [];
    }
  },

  /**
   * Filtered model names for autocomplete.
   * Returns: string[]
   */
  async searchModelsByBrand(brand, query) {
    if (!brand) return [];
    try {
      const raw = await apiFetch(
        `/api/cars/models/search?brand=${encodeURIComponent(brand)}&q=${encodeURIComponent(query ?? '')}`,
      );
      return toArray(unwrap(raw));
    } catch (err) {
      console.error('[supabaseVehicleService] searchModelsByBrand:', err);
      return [];
    }
  },

  /**
   * Core vehicle lookup used by CarStats.jsx → resolveVehicleDetailsForSelection.
   *
   * Accepts EITHER:
   *   findVehicleByBrandModel({ brand, model })   ← object (what CarStats passes)
   *   findVehicleByBrandModel(brand, model)        ← two separate args (legacy)
   *
   * Returns the normalised vehicle object (matching mapRow shape), or null.
   */
  async findVehicleByBrandModel(brandOrObj, modelArg) {
    // Normalise both call signatures
    const brand =
      brandOrObj && typeof brandOrObj === 'object'
        ? brandOrObj.brand
        : brandOrObj;
    const model =
      brandOrObj && typeof brandOrObj === 'object'
        ? brandOrObj.model
        : modelArg;

    if (!brand || !model) {
      console.warn('[supabaseVehicleService] findVehicleByBrandModel: missing brand or model', { brand, model });
      return null;
    }

    try {
      const raw  = await apiFetch(
        `/api/cars/details?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`,
      );
      const data = unwrap(raw);

      if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
        return null;
      }

      return data;
    } catch (err) {
      console.error(`[supabaseVehicleService] findVehicleByBrandModel(${brand}, ${model}):`, err);
      return null;
    }
  },

  /**
   * Full search used by CarStats's "Compare Cars" submit path.
   * Returns: vehicle object[] (same shape as mapRow)
   */
  async searchVehicles({ brand, model, limit = 25 } = {}) {
    try {
      const params = new URLSearchParams();
      if (brand) params.set('brand', brand);
      if (model) params.set('model', model);
      params.set('limit', String(limit));

      const raw  = await apiFetch(`/api/cars/all?${params.toString()}`);
      const data = unwrap(raw);
      return toArray(data);
    } catch (err) {
      console.error('[supabaseVehicleService] searchVehicles:', err);
      return [];
    }
  },
};
