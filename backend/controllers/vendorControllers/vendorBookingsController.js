import Booking from '../../models/BookingModel.js';
import { errorHandler } from '../../utils/error.js';

export const vendorBookings = async (req, res, next) => {
  try {
    // Remove unused variable - vendorVehicles was extracted but never used
    const bookings = await Booking.aggregate([
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "vehicleDetails",
        },
      },
      {
        $unwind: {
          path: "$vehicleDetails",
        },
      },
    ]);

    // Check if array is empty instead of falsy
    if (bookings.length === 0) {
      return next(errorHandler(404, "No bookings found"));
    }

    res.status(200).json({
      message: "Vendor bookings retrieved successfully",
      data: bookings,
      count: bookings.length
    });

  } catch (error) {
    console.error('Error in vendorBookings:', error.message);
    next(errorHandler(500, "Error retrieving vendor bookings"));
  }
};