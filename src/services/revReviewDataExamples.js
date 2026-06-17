/**
 * Example usage of RevReviewData API Client
 *
 * This file demonstrates how to use the revReviewDataClient in your application.
 */

import revReviewDataAPI from "./revReviewDataClient";

// Example 1: Test database connection
export async function testDatabaseConnection() {
  try {
    const result = await revReviewDataAPI.testConnection();
    console.log("Database Status:", result);
    return result;
  } catch (error) {
    console.error("Connection test failed:", error);
    throw error;
  }
}

// Example 2: Fetch all brands
export async function getAllBrands() {
  try {
    const brands = await revReviewDataAPI.brands.getAll();
    console.log("All Brands:", brands);
    return brands;
  } catch (error) {
    console.error("Failed to fetch brands:", error);
    throw error;
  }
}

// Example 3: Fetch a specific brand by ID
export async function getBrandById(brandId) {
  try {
    const brand = await revReviewDataAPI.brands.getById(brandId);
    console.log(`Brand ${brandId}:`, brand);
    return brand;
  } catch (error) {
    console.error(`Failed to fetch brand ${brandId}:`, error);
    throw error;
  }
}

// Example 4: Fetch all models with full details
export async function getAllModelsWithDetails() {
  try {
    const models = await revReviewDataAPI.models.getAll();
    console.log("All Models with Details:", models);
    return models;
  } catch (error) {
    console.error("Failed to fetch models:", error);
    throw error;
  }
}

// Example 5: Search for models by name
export async function searchModels(searchTerm) {
  try {
    const results = await revReviewDataAPI.models.search(searchTerm);
    console.log(`Search results for "${searchTerm}":`, results);
    return results;
  } catch (error) {
    console.error("Search failed:", error);
    throw error;
  }
}

// Example 6: Get complete vehicle information by model ID
export async function getCompleteVehicleInfo(modelId) {
  try {
    const model = await revReviewDataAPI.models.getById(modelId);
    console.log("Complete Vehicle Info:", {
      model: model.modelName,
      brand: model.brand?.brandName,
      price: model.price?.priceExclTax,
      engine: model.enginePerformance?.engine,
      power: model.enginePerformance?.power,
      dimensions: {
        length: model.vehicleDimensions?.length,
        width: model.vehicleDimensions?.width,
        height: model.vehicleDimensions?.height,
      },
    });
    return model;
  } catch (error) {
    console.error(`Failed to fetch vehicle info for model ${modelId}:`, error);
    throw error;
  }
}

// Example 7: Get all prices
export async function getAllPrices() {
  try {
    const prices = await revReviewDataAPI.prices.getAll();
    console.log("All Prices:", prices);
    return prices;
  } catch (error) {
    console.error("Failed to fetch prices:", error);
    throw error;
  }
}

// Example 8: Get dimensions for a specific vehicle
export async function getVehicleDimensions(dimId) {
  try {
    const dimensions = await revReviewDataAPI.dimensions.getById(dimId);
    console.log(`Dimensions for DIM_ID ${dimId}:`, dimensions);
    return dimensions;
  } catch (error) {
    console.error(`Failed to fetch dimensions for ${dimId}:`, error);
    throw error;
  }
}

// Example 9: Get engine performance data
export async function getEnginePerformance(performanceId) {
  try {
    const performance =
      await revReviewDataAPI.performance.getById(performanceId);
    console.log(`Performance data for ID ${performanceId}:`, performance);
    return performance;
  } catch (error) {
    console.error(
      `Failed to fetch performance data for ${performanceId}:`,
      error,
    );
    throw error;
  }
}

// Example 10: Get statistics
export async function getDatabaseStatistics() {
  try {
    const [brandsCount, modelsCount] = await Promise.all([
      revReviewDataAPI.brands.getCount(),
      revReviewDataAPI.models.getCount(),
    ]);

    const stats = {
      totalBrands: brandsCount.count,
      totalModels: modelsCount.count,
    };

    console.log("Database Statistics:", stats);
    return stats;
  } catch (error) {
    console.error("Failed to fetch statistics:", error);
    throw error;
  }
}

// Example 11: Complete workflow - Search and get details
export async function searchAndGetDetails(searchTerm) {
  try {
    // Step 1: Search for models
    const searchResults = await revReviewDataAPI.models.search(searchTerm);

    if (searchResults.length === 0) {
      console.log(`No results found for "${searchTerm}"`);
      return null;
    }

    // Step 2: Get detailed info for the first result
    const firstResult = searchResults[0];
    const detailedInfo = await revReviewDataAPI.models.getById(firstResult.id);

    console.log("Detailed Information:", {
      modelName: detailedInfo.modelName,
      brandName: detailedInfo.brand?.brandName,
      price: detailedInfo.price?.priceExclTax,
      priceStatus: detailedInfo.price?.priceStatus,
      engine: {
        type: detailedInfo.enginePerformance?.engine,
        cylinders: detailedInfo.enginePerformance?.cylinders,
        power: detailedInfo.enginePerformance?.power,
        torque: detailedInfo.enginePerformance?.torque,
        topSpeed: detailedInfo.enginePerformance?.topSpeed,
        acceleration: detailedInfo.enginePerformance?.acceleration,
      },
      dimensions: {
        length: detailedInfo.vehicleDimensions?.length,
        width: detailedInfo.vehicleDimensions?.width,
        height: detailedInfo.vehicleDimensions?.height,
        wheelbase: detailedInfo.vehicleDimensions?.wheelbase,
      },
    });

    return detailedInfo;
  } catch (error) {
    console.error("Workflow failed:", error);
    throw error;
  }
}

// Export all examples
export default {
  testDatabaseConnection,
  getAllBrands,
  getBrandById,
  getAllModelsWithDetails,
  searchModels,
  getCompleteVehicleInfo,
  getAllPrices,
  getVehicleDimensions,
  getEnginePerformance,
  getDatabaseStatistics,
  searchAndGetDetails,
};
