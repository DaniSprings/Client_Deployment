import { get, models } from "./api";

const applyLimit = (items, limit) => {
  if (!Array.isArray(items)) {
    return [];
  }

  if (limit == null) {
    return items;
  }

  return items.slice(0, limit);
};

const unwrap = async (request) => {
  const response = await request;
  return response?.data ?? [];
};

const sqlCatalogArrays = {
  async getBrandsWithCount() {
    const brands = await unwrap(models.getBrandsWithCount());
    return Array.isArray(brands) ? brands : [];
  },

  async getBrandNames(query = "", options = {}) {
    const trimmedQuery = query.trim();
    const { limit = 51 } = options;

    const brands = trimmedQuery
      ? await unwrap(models.searchModelTableBrands(trimmedQuery))
      : await unwrap(models.getAllBrands());

    return applyLimit(brands, limit);
  },

  async getModelNames({ brandName, query = "", limit = 12 } = {}) {
    if (!brandName) {
      return [];
    }

    const trimmedQuery = query.trim();
    const modelsByBrand = trimmedQuery
      ? await unwrap(models.searchModelTableModels(brandName, trimmedQuery))
      : await unwrap(models.getModelTableModelsByBrand(brandName));

    return applyLimit(modelsByBrand, limit);
  },

  async searchVehicles({ brandName = "", modelName = "", limit = 25 } = {}) {
    const params = new URLSearchParams();

    if (brandName) {
      params.set("brand", brandName);
    }

    if (modelName) {
      params.set("model", modelName);
    }

    const query = params.toString();
    const vehicles = await unwrap(
      get(`/api/models/search${query ? `?${query}` : ""}`),
    );

    return applyLimit(vehicles, limit);
  },
};

export default sqlCatalogArrays;
