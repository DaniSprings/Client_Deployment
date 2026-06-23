import {
  getBrandAutoCorrect,
  getBrandModels,
  getCatalogBrands,
  getModelAutoCorrect,
} from "./brandModelCatalog.js";

export const normalizeLookupValue = (value = "") =>
  value.trim().replace(/\s+/g, " ").toLowerCase();

export const levenshteinDistance = (source, target) => {
  const rows = source.length + 1;
  const cols = target.length + 1;
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let row = 0; row < rows; row += 1) {
    matrix[row][0] = row;
  }

  for (let col = 0; col < cols; col += 1) {
    matrix[0][col] = col;
  }

  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const cost = source[row - 1] === target[col - 1] ? 0 : 1;
      matrix[row][col] = Math.min(
        matrix[row - 1][col] + 1,
        matrix[row][col - 1] + 1,
        matrix[row - 1][col - 1] + cost,
      );
    }
  }

  return matrix[rows - 1][cols - 1];
};

export const rankOptionSuggestions = (query, options, limit = 12) => {
  const normalizedQuery = normalizeLookupValue(query);

  if (!normalizedQuery) {
    return options.slice(0, limit);
  }

  return options
    .map((option) => {
      const normalizedOption = normalizeLookupValue(option);
      const exact = normalizedOption === normalizedQuery;
      const startsWith = normalizedOption.startsWith(normalizedQuery);
      const includes = normalizedOption.includes(normalizedQuery);
      const distance = levenshteinDistance(normalizedQuery, normalizedOption);

      return {
        option,
        exact,
        startsWith,
        includes,
        distance,
      };
    })
    .filter(
      ({ exact, startsWith, includes, distance }) =>
        exact ||
        startsWith ||
        includes ||
        distance <= Math.max(2, Math.floor(normalizedQuery.length / 2)),
    )
    .sort((left, right) => {
      const leftRank = left.exact
        ? 0
        : left.startsWith
          ? 1
          : left.includes
            ? 2
            : 3;
      const rightRank = right.exact
        ? 0
        : right.startsWith
          ? 1
          : right.includes
            ? 2
            : 3;

      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }

      if (left.distance !== right.distance) {
        return left.distance - right.distance;
      }

      return left.option.localeCompare(right.option);
    })
    .slice(0, limit)
    .map(({ option }) => option);
};

export const getBestOptionMatch = (query, options) => {
  const suggestions = rankOptionSuggestions(query, options, 1);
  return suggestions[0] || "";
};

export const resolveBrandName = (brandName, liveBrands = []) => {
  const candidateBrands =
    liveBrands.length > 0 ? liveBrands : getCatalogBrands();
  const exactMatch = candidateBrands.find(
    (option) =>
      normalizeLookupValue(option) === normalizeLookupValue(brandName),
  );

  if (exactMatch) {
    return exactMatch;
  }

  return (
    getBestOptionMatch(brandName, candidateBrands) ||
    getBrandAutoCorrect(brandName)
  );
};

export const getLookupModelOptions = (brandName, liveModels = []) => {
  const catalogModels = getBrandModels(brandName);
  return [...new Set([...liveModels, ...catalogModels])].sort((left, right) =>
    left.localeCompare(right),
  );
};

export const mapVehicleDetails = (vehicleData, fallbackCar = {}) => ({
  id: vehicleData?.id ?? fallbackCar.id,
  brand: vehicleData?.brand || fallbackCar.brand || "",
  model: vehicleData?.model || fallbackCar.model || "",
  price: vehicleData?.price ?? null,
  priceStatus: vehicleData?.priceStatus || "",
  priceExclEmissionsTax: vehicleData?.priceExclEmissionsTax ?? null,
  engine: vehicleData?.engine || "",
  cylinders: vehicleData?.cylinders || "",
  power: vehicleData?.power || "",
  torque: vehicleData?.torque || "",
  topSpeed: vehicleData?.topSpeed || "",
  acceleration: vehicleData?.acceleration || "",
  fuelConsumption: vehicleData?.fuelConsumption || "",
  fuelRange: vehicleData?.fuelRange || "",
  length: vehicleData?.length || "",
  widthExclMirrorsInclMirrors:
    vehicleData?.widthExclMirrorsInclMirrors || vehicleData?.width || "",
  height: vehicleData?.height || "",
  wheelbase: vehicleData?.wheelbase || "",
  groundClearance: vehicleData?.groundClearance || "",
});

export const resolveVehicleDetailsForSelection = async ({
  brand,
  model,
  liveModels = [],
  fetchVehicleRecord,
  fallbackId,
}) => {
  const exactMatch = await fetchVehicleRecord(brand, model);

  if (exactMatch) {
    return {
      status: "loaded",
      resolvedBrand: exactMatch.brand || brand,
      resolvedModel: exactMatch.model || model,
      details: mapVehicleDetails(exactMatch, { id: fallbackId, brand, model }),
    };
  }

  const fallbackModels = getLookupModelOptions(brand, liveModels);
  const fallbackMatch =
    getBestOptionMatch(model, fallbackModels) ||
    getModelAutoCorrect(brand, model);

  if (
    !fallbackMatch ||
    normalizeLookupValue(fallbackMatch) === normalizeLookupValue(model)
  ) {
    return {
      status: "not-found",
      message: "No database match found for this selection.",
      details: null,
    };
  }

  const fallbackDetails = await fetchVehicleRecord(brand, fallbackMatch);

  if (fallbackDetails) {
    const resolvedBrand = fallbackDetails.brand || brand;
    const resolvedModel = fallbackDetails.model || fallbackMatch;

    return {
      status: "loaded",
      resolvedBrand,
      resolvedModel,
      message: `Matched live model ${resolvedModel}.`,
      details: mapVehicleDetails(fallbackDetails, {
        id: fallbackId,
        brand: resolvedBrand,
        model: resolvedModel,
      }),
    };
  }

  return {
    status: "not-found",
    message: "No database match found for this selection.",
    details: null,
  };
};
