import Booking from "../models/BookingModel.js";
import Vehicle from "../models/vehicleModel.js";

/**
 * Validates and sanitizes date input
 * @param {any} date - Date to validate
 * @param {string} fieldName - Name of the field for error messages
 * @returns {Date} Validated Date object
 */
function validateAndSanitizeDate(date, fieldName) {
  if (!date) {
    throw new Error(`${fieldName} is required`);
  }

  // Convert to Date object if it's a string
  let dateObj;
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    throw new Error(`${fieldName} must be a valid date`);
  }

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    throw new Error(`${fieldName} must be a valid date`);
  }

  return dateObj;
}

/**
 * Validates that pickup date is before drop-off date
 * @param {Date} pickupDate - Validated pickup date
 * @param {Date} dropOffDate - Validated drop-off date
 */
function validateDateRange(pickupDate, dropOffDate) {
  if (pickupDate >= dropOffDate) {
    throw new Error("Pickup date must be before drop-off date");
  }

  // Optional: Validate that dates are not too far in the past
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  if (pickupDate < oneDayAgo) {
    throw new Error("Pickup date cannot be more than 1 day in the past");
  }
}

/**
 * Creates a secure query object for booking searches
 * @param {Date} sanitizedPickupDate - Validated pickup date
 * @param {Date} sanitizedDropOffDate - Validated drop-off date
 * @param {string} status - Status to search for
 * @returns {Object} Secure query object
 */
function createSecureBookingQuery(sanitizedPickupDate, sanitizedDropOffDate, status) {
  // Create new Date objects to ensure complete isolation from user input
  const safePickupDate = new Date(sanitizedPickupDate.getTime());
  const safeDropOffDate = new Date(sanitizedDropOffDate.getTime());
  
  // Build query with explicit operators and safe date objects
  return {
    status: { $eq: status },
    pickupDate: { $lt: safeDropOffDate },
    dropOffDate: { $gt: safePickupDate },
  };
}

/**
 * Creates a secure query object for completed trips
 * @param {Date} sanitizedPickupDate - Validated pickup date
 * @param {Date} sanitizedDropOffDate - Validated drop-off date
 * @returns {Object} Secure query object
 */
function createSecureCompletedTripsQuery(sanitizedPickupDate, sanitizedDropOffDate) {
  // Create new Date objects to ensure complete isolation from user input
  const safePickupDate = new Date(sanitizedPickupDate.getTime());
  const safeDropOffDate = new Date(sanitizedDropOffDate.getTime());
  
  // Predefined allowed statuses - not user controlled
  const ALLOWED_STATUSES = ["tripCompleted", "canceled", "notBooked"];
  
  // Build query with explicit operators and safe values
  return {
    status: { $in: ALLOWED_STATUSES },
    pickupDate: { $lt: safeDropOffDate },
    dropOffDate: { $gt: safePickupDate },
  };
}

/**
 * Creates a secure query object for vehicle searches
 * @param {Array} bookedVehicleIds - Array of booked vehicle IDs
 * @param {Array} availableVehicleIds - Array of available vehicle IDs
 * @returns {Object} Secure query object
 */
function createSecureVehicleQuery(bookedVehicleIds, availableVehicleIds) {
  // Build query with explicit operators
  return {
    isDeleted: { $ne: true },
    $or: [
      { _id: { $nin: bookedVehicleIds } },
      { _id: { $in: availableVehicleIds } },
    ],
  };
}

/**
 * Returns vehicles that are available for booking in the selected date range
 * @param {Date} pickupDate - Start date for the booking
 * @param {Date} dropOffDate - End date for the booking
 * @returns {Promise<Array>} Array of available vehicles
 */
export async function availableAtDate(pickupDate, dropOffDate) {
  try {
    // Validate and sanitize input parameters
    const sanitizedPickupDate = validateAndSanitizeDate(pickupDate, "Pickup date");
    const sanitizedDropOffDate = validateAndSanitizeDate(dropOffDate, "Drop-off date");
    
    // Validate date range
    validateDateRange(sanitizedPickupDate, sanitizedDropOffDate);

    // Create secure query using helper function - completely isolated from user input
    const existingBookingsQuery = createSecureBookingQuery(
      sanitizedPickupDate, 
      sanitizedDropOffDate, 
      "booked"
    );

    const existingBookings = await Booking.find(
      existingBookingsQuery,
      { vehicleId: 1, _id: 0 }
    ).lean();

    // Extract unique vehicle IDs that are already booked
    const bookedVehicleIds = [...new Set(existingBookings.map(booking => booking.vehicleId))];

    // Create secure query for completed trips using helper function
    const completedTripsQuery = createSecureCompletedTripsQuery(
      sanitizedPickupDate, 
      sanitizedDropOffDate
    );

    const availableFromCompletedTrips = await Booking.find(
      completedTripsQuery,
      { vehicleId: 1, _id: 0 }
    ).lean();

    const availableVehicleIds = availableFromCompletedTrips.map(booking => booking.vehicleId);

    // Create secure vehicle query using helper function
    const vehicleQuery = createSecureVehicleQuery(bookedVehicleIds, availableVehicleIds);

    const availableVehicles = await Vehicle.find(vehicleQuery).lean();

    return availableVehicles;

  } catch (error) {
    console.error('Error in availableAtDate:', error.message);
    throw new Error(`Failed to fetch available vehicles: ${error.message}`);
  }
}

/**
 * Alternative version using aggregation pipeline for maximum security
 * This version uses MongoDB aggregation which provides better isolation
 */
export async function availableAtDateAggregation(pickupDate, dropOffDate) {
  try {
    // Validate and sanitize input parameters
    const sanitizedPickupDate = validateAndSanitizeDate(pickupDate, "Pickup date");
    const sanitizedDropOffDate = validateAndSanitizeDate(dropOffDate, "Drop-off date");
    
    // Validate date range
    validateDateRange(sanitizedPickupDate, sanitizedDropOffDate);

    // Create completely new Date objects to isolate from user input
    const safePickupDate = new Date(sanitizedPickupDate.getTime());
    const safeDropOffDate = new Date(sanitizedDropOffDate.getTime());

    // Use aggregation pipeline for maximum security
    const bookedVehicleIds = await Booking.aggregate([
      {
        $match: {
          status: { $eq: "booked" },
          pickupDate: { $lt: safeDropOffDate },
          dropOffDate: { $gt: safePickupDate }
        }
      },
      {
        $group: {
          _id: null,
          vehicleIds: { $addToSet: "$vehicleId" }
        }
      },
      {
        $project: {
          _id: 0,
          vehicleIds: 1
        }
      }
    ]);

    const bookedIds = bookedVehicleIds.length > 0 ? bookedVehicleIds[0].vehicleIds : [];

    // Get available vehicles from completed/canceled trips
    const availableVehicleIds = await Booking.aggregate([
      {
        $match: {
          status: { $in: ["tripCompleted", "canceled", "notBooked"] },
          pickupDate: { $lt: safeDropOffDate },
          dropOffDate: { $gt: safePickupDate }
        }
      },
      {
        $group: {
          _id: null,
          vehicleIds: { $addToSet: "$vehicleId" }
        }
      },
      {
        $project: {
          _id: 0,
          vehicleIds: 1
        }
      }
    ]);

    const availableIds = availableVehicleIds.length > 0 ? availableVehicleIds[0].vehicleIds : [];

    // Find available vehicles using aggregation
    const availableVehicles = await Vehicle.aggregate([
      {
        $match: {
          isDeleted: { $ne: true },
          $or: [
            { _id: { $nin: bookedIds } },
            { _id: { $in: availableIds } }
          ]
        }
      }
    ]);

    return availableVehicles;

  } catch (error) {
    console.error('Error in availableAtDateAggregation:', error.message);
    throw new Error(`Failed to fetch available vehicles: ${error.message}`);
  }
}

/**
 * Ultra-secure version that builds queries step by step with complete isolation
 */
export async function availableAtDateUltraSecure(pickupDate, dropOffDate) {
  try {
    // Validate and sanitize input parameters
    const sanitizedPickupDate = validateAndSanitizeDate(pickupDate, "Pickup date");
    const sanitizedDropOffDate = validateAndSanitizeDate(dropOffDate, "Drop-off date");
    
    // Validate date range
    validateDateRange(sanitizedPickupDate, sanitizedDropOffDate);

    // Create completely isolated date objects
    const isolatedPickupDate = new Date(sanitizedPickupDate.getTime());
    const isolatedDropOffDate = new Date(sanitizedDropOffDate.getTime());

    // Build query components with explicit types and operators
    const statusOperator = "$eq";
    const lessThanOperator = "$lt"; 
    const greaterThanOperator = "$gt";
    const inOperator = "$in";
    const ninOperator = "$nin";
    const neOperator = "$ne";

    // Build existing bookings query step by step
    const statusCondition = {};
    statusCondition[statusOperator] = "booked";

    const pickupCondition = {};
    pickupCondition[lessThanOperator] = isolatedDropOffDate;

    const dropOffCondition = {};
    dropOffCondition[greaterThanOperator] = isolatedPickupDate;

    const existingBookingsQuery = {
      status: statusCondition,
      pickupDate: pickupCondition,
      dropOffDate: dropOffCondition
    };

    const existingBookings = await Booking.find(
      existingBookingsQuery,
      { vehicleId: 1, _id: 0 }
    ).lean();

    // Extract unique vehicle IDs
    const bookedVehicleIds = [...new Set(existingBookings.map(booking => booking.vehicleId))];

    // Build completed trips query step by step
    const allowedStatuses = ["tripCompleted", "canceled", "notBooked"];
    const statusInCondition = {};
    statusInCondition[inOperator] = allowedStatuses;

    const pickupLtCondition = {};
    pickupLtCondition[lessThanOperator] = isolatedDropOffDate;

    const dropOffGtCondition = {};
    dropOffGtCondition[greaterThanOperator] = isolatedPickupDate;

    const completedTripsQuery = {
      status: statusInCondition,
      pickupDate: pickupLtCondition,
      dropOffDate: dropOffGtCondition
    };

    const availableFromCompletedTrips = await Booking.find(
      completedTripsQuery,
      { vehicleId: 1, _id: 0 }
    ).lean();

    const availableVehicleIds = availableFromCompletedTrips.map(booking => booking.vehicleId);

    // Build vehicle query step by step
    const isDeletedCondition = {};
    isDeletedCondition[neOperator] = true;

    const notBookedCondition = {};
    notBookedCondition[ninOperator] = bookedVehicleIds;

    const availableCondition = {};
    availableCondition[inOperator] = availableVehicleIds;

    const vehicleQuery = {
      isDeleted: isDeletedCondition,
      $or: [
        { _id: notBookedCondition },
        { _id: availableCondition }
      ]
    };

    const availableVehicles = await Vehicle.find(vehicleQuery).lean();

    return availableVehicles;

  } catch (error) {
    console.error('Error in availableAtDateUltraSecure:', error.message);
    throw new Error(`Failed to fetch available vehicles: ${error.message}`);
  }
}