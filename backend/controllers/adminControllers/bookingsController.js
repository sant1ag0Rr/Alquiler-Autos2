import Booking from "../../models/BookingModel.js";
import { errorHandler } from "../../utils/error.js";

export const allBookings = async (req, res, next) => {
  try {
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

    // Verificar si el array está vacío en lugar de null/undefined
    if (bookings.length === 0) {
      return next(errorHandler(404, "No bookings found"));
    }

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error in allBookings:', error.message);
    next(errorHandler(500, "Error retrieving bookings"));
  }
};

// Change bookings status
export const changeStatus = async (req, res, next) => {
  try {
    const { id, status } = req.body;

    // Validación mejorada
    if (!id || !status) {
      return next(errorHandler(400, "Booking ID and status are required"));
    }

    const statusChanged = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!statusChanged) {
      return next(errorHandler(404, "Booking not found or status not changed"));
    }

    res.status(200).json({ 
      message: "Status changed successfully",
      booking: statusChanged 
    });
  } catch (error) {
    console.error('Error in changeStatus:', error.message);
    next(errorHandler(500, "Error updating booking status"));
  }
};