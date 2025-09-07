// Mock Google Maps service - In production, integrate with Google Maps API

// Calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Get estimated delivery time
const getEstimatedDeliveryTime = async (shopCoords, deliveryCoords) => {
  try {
    const distance = calculateDistance(
      shopCoords.latitude,
      shopCoords.longitude,
      deliveryCoords.latitude,
      deliveryCoords.longitude
    );

    // Mock calculation: 2 km/h average speed + 10 minutes preparation time
    const estimatedMinutes = Math.ceil((distance / 2) * 60) + 10;

    console.log(`🗺️ Mock Maps: ${distance.toFixed(2)}km distance, ${estimatedMinutes} minutes estimated`);

    // In production, use Google Maps Directions API:
    // const response = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${shopCoords.latitude},${shopCoords.longitude}&destination=${deliveryCoords.latitude},${deliveryCoords.longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`);
    // const data = await response.json();
    // const duration = data.routes[0]?.legs[0]?.duration?.value || 1800; // seconds

    return {
      success: true,
      estimatedMinutes,
      distance: distance.toFixed(2)
    };
  } catch (error) {
    console.error('Maps service error:', error);
    return {
      success: false,
      estimatedMinutes: 30, // Default fallback
      distance: 'Unknown'
    };
  }
};

// Geocode address to coordinates
const geocodeAddress = async (address) => {
  try {
    // Mock geocoding - return random coordinates in a city
    const mockCoordinates = {
      latitude: 28.6139 + (Math.random() - 0.5) * 0.1, // Delhi area
      longitude: 77.2090 + (Math.random() - 0.5) * 0.1
    };

    console.log(`🗺️ Mock Geocoding: "${address}" -> ${mockCoordinates.latitude}, ${mockCoordinates.longitude}`);

    // In production, use Google Maps Geocoding API:
    // const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`);
    // const data = await response.json();
    // const location = data.results[0]?.geometry?.location;

    return {
      success: true,
      coordinates: mockCoordinates
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return {
      success: false,
      coordinates: null
    };
  }
};

module.exports = {
  calculateDistance,
  getEstimatedDeliveryTime,
  geocodeAddress
};