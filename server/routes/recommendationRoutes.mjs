import express from 'express';
import Property from '../models/propertyModel.mjs';
import requireAuth from '../middlewares/requireAuth.mjs';  // Updated import

const router = express.Router();

// Helper function to calculate property similarity score
const calculateSimilarityScore = (property, filters) => {
  let score = 0;

  // Location similarity (highest weight)
  if (filters.location && property.location.toLowerCase().includes(filters.location.toLowerCase())) {
    score += 5;
  }

  // Property type match
  if (filters.propertyType && property.propertyType.toLowerCase() === filters.propertyType.toLowerCase()) {
    score += 3;
  }

  // Gender preference match
  if (filters.gender && property.preferedGender.toLowerCase() === filters.gender.toLowerCase()) {
    score += 2;
  }

  // Price range match
  if (filters.pricerange) {
    const [minPrice, maxPrice] = filters.pricerange.split("-");
    if (maxPrice === "infinite") {
      if (property.totalRent >= parseInt(minPrice)) {
        score += 2;
      }
    } else if (
      property.totalRent >= parseInt(minPrice) &&
      property.totalRent <= parseInt(maxPrice)
    ) {
      score += 2;
    }
  }

  // Bedroom count match
  if (filters.bedrooms) {
    const requestedBedrooms = parseInt(filters.bedrooms);
    if (requestedBedrooms === property.totalRooms) {
      score += 2;
    }
  }

  return score;
};

// Get property recommendations
router.get("/", requireAuth, async (req, res) => {
  try { 
    const { location, propertyType, gender, bedrooms, pricerange, excludeIds = [] } = req.query;

    // Base query to exclude already displayed properties
    const baseQuery = {
      _id: { $nin: excludeIds },
      isActive: true,
    };

    // Fetch all available properties
    const allProperties = await Property.find(baseQuery)
      .sort({ createdAt: -1 })
      .limit(50); // Limit to recent 50 properties for better performance

    // Calculate similarity scores for each property
    const scoredProperties = allProperties.map(property => ({
      property,
      score: calculateSimilarityScore(property, {
        location,
        propertyType,
        gender,
        bedrooms,
        pricerange
      })
    }));

    // Sort properties by similarity score
    const recommendations = scoredProperties
      .sort((a, b) => b.score - a.score)
      .map(item => item.property)
      .slice(0, 4); 

    res.json({
      success: true,
      recommendations
    });

  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching recommendations",
      error: error.message
    });
  }
});

// Need to change the export to match ES modules
export default router;
