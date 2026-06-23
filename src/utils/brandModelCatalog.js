import modelNameRows from "../../JSON/TestModelNames.json";

const brandAliases = {
  cherry: "chery",
  "mercedes benz amg": "mercedes amg",
};

const familyStopWords = new Set([
  "a",
  "advanced",
  "azure",
  "black",
  "champion",
  "city",
  "dynamic",
  "edition",
  "elite",
  "hev",
  "hunter",
  "hybrid",
  "mulliner",
  "performance",
  "phev",
  "platinum",
  "premium",
  "q4",
  "quadrifoglio",
  "quattro",
  "s",
  "signature",
  "speed",
  "super",
  "tdi",
  "tfsi",
  "ti",
  "urban",
  "v6",
  "v8",
  "v10",
  "v12",
  "veloce",
  "xdrive",
  "xline",
  "sdrive",
  "line",
  "sport",
]);

const codeLikeModelPattern = /^(?:[a-z]{1,3}\d+[a-z]*|\d+[a-z]*|[a-z]\d)$/i;

function normalizeCatalogValue(value = "") {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function normalizeBrandName(value = "") {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeToken(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, "");
}

function isEngineOrSpecToken(token = "") {
  return /^\d+(?:\.\d+)?[a-z]+$/i.test(token) || /^\d+[a-z]{2,}$/i.test(token);
}

function levenshteinDistance(source, target) {
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
}

function rankCatalogSuggestions(query, options, limit = 12) {
  const normalizedQuery = normalizeCatalogValue(query);

  if (!normalizedQuery) {
    return options.slice(0, limit);
  }

  return options
    .map((option) => {
      const normalizedOption = normalizeCatalogValue(option);
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
}

function getAutoCorrectSuggestion(query, options) {
  const normalizedQuery = normalizeCatalogValue(query);

  if (!normalizedQuery) {
    return "";
  }

  const exactMatch = options.find(
    (option) => normalizeCatalogValue(option) === normalizedQuery,
  );

  if (exactMatch) {
    return exactMatch;
  }

  const suggestions = rankCatalogSuggestions(query, options, 12);

  if (suggestions.length === 0) {
    return "";
  }

  const [bestMatch] = suggestions;
  const normalizedBestMatch = normalizeCatalogValue(bestMatch);
  const isContainedMatch =
    normalizedQuery.length >= 3 &&
    normalizedBestMatch.includes(normalizedQuery);
  const isNearMatch =
    normalizedQuery.length >= 4 &&
    levenshteinDistance(normalizedQuery, normalizedBestMatch) <=
      Math.max(1, Math.floor(normalizedQuery.length / 3));

  if (
    normalizedBestMatch.startsWith(normalizedQuery) ||
    isContainedMatch ||
    isNearMatch
  ) {
    return bestMatch;
  }

  return "";
}

function getModelFamilyLabel(modelName) {
  const tokens = modelName.split(/\s+/).filter(Boolean);

  if (tokens.length === 0) {
    return modelName;
  }

  const [firstToken, secondToken, thirdToken] = tokens;

  if (codeLikeModelPattern.test(firstToken)) {
    if (normalizeToken(secondToken) === "e-tron") {
      return [firstToken, secondToken, thirdToken].filter(Boolean).join(" ");
    }

    return firstToken;
  }

  const familyTokens = [firstToken];

  for (let tokenIndex = 1; tokenIndex < tokens.length; tokenIndex += 1) {
    const token = tokens[tokenIndex];
    const normalizedToken = normalizeToken(token);

    if (!normalizedToken) {
      break;
    }

    if (familyStopWords.has(normalizedToken) || isEngineOrSpecToken(token)) {
      break;
    }

    familyTokens.push(token);

    if (familyTokens.length >= 3) {
      break;
    }
  }

  return familyTokens.join(" ");
}

const modelNamesByBrand = modelNameRows.reduce((accumulator, row) => {
  const brandKey = normalizeBrandName(row.BrandNames);
  const modelName = row.ModelNames?.trim();

  if (!brandKey || !modelName) {
    return accumulator;
  }

  if (!accumulator[brandKey]) {
    accumulator[brandKey] = [];
  }

  if (!accumulator[brandKey].includes(modelName)) {
    accumulator[brandKey].push(modelName);
  }

  return accumulator;
}, {});

const brandNames = [
  ...new Set(
    modelNameRows.map((row) => row.BrandNames?.trim()).filter(Boolean),
  ),
].sort((left, right) => left.localeCompare(right));

export function getCatalogBrands() {
  return [...brandNames];
}

export function searchCatalogBrands(query = "") {
  if (!query.trim()) {
    return getCatalogBrands();
  }

  return rankCatalogSuggestions(query, brandNames);
}

export function getBrandAutoCorrect(query = "") {
  return getAutoCorrectSuggestion(query, brandNames);
}

export function getBrandModels(brandName) {
  const normalizedBrandName = normalizeBrandName(brandName);
  const aliasBrandName = brandAliases[normalizedBrandName];

  return [
    ...(modelNamesByBrand[normalizedBrandName] ||
      modelNamesByBrand[aliasBrandName] ||
      []),
  ].sort((left, right) => left.localeCompare(right));
}

export function searchCatalogModels(brandName, query = "") {
  const models = getBrandModels(brandName);

  if (!query.trim()) {
    return models;
  }

  return rankCatalogSuggestions(query, models);
}

export function getModelAutoCorrect(brandName, query = "") {
  return getAutoCorrectSuggestion(query, getBrandModels(brandName));
}

export function getModelFamilies(modelNames = []) {
  const groupedFamilies = modelNames.reduce((accumulator, modelName) => {
    const familyLabel = getModelFamilyLabel(modelName);

    if (!accumulator[familyLabel]) {
      accumulator[familyLabel] = [];
    }

    accumulator[familyLabel].push(modelName);
    return accumulator;
  }, {});

  return Object.entries(groupedFamilies)
    .map(([familyLabel, models]) => ({
      familyLabel,
      models: [...models].sort((left, right) => left.localeCompare(right)),
    }))
    .sort((left, right) => left.familyLabel.localeCompare(right.familyLabel));
}

export function getBrandModelFamilies(brandName) {
  return getModelFamilies(getBrandModels(brandName));
}
