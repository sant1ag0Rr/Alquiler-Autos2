import Vehicle from "../../models/vehicleModel.js";
import { errorHandler } from "../../utils/error.js";

// Fetch vendor vehicle requests
export const fetchVendorVehilceRequests = async (req, res, next) => {
  try {
    const vendorRequests = await Vehicle.aggregate([
      {
        $match: {
          isAdminApproved: false,
          isDeleted: false, // Changed from string "false" to boolean
          isRejected: false,
          isAdminAdded: false,
        },
      },
    ]);

    // Check if array is empty instead of falsy
    if (vendorRequests.length === 0) {
      return next(
        errorHandler(404, "No pending vendor requests found")
      );
    }

    res.status(200).json({
      message: "Vendor requests fetched successfully",
      data: vendorRequests,
      count: vendorRequests.length
    });

  } catch (error) {
    console.error('Error fetching vendor requests:', error.message);
    next(errorHandler(500, "Error while fetching vendor vehicle requests"));
  }
};

// Approve vendor request
export const approveVendorVehicleRequest = async (req, res, next) => {
  try {
    const { _id } = req.body;

    // Improved validation
    if (!_id) {
      return next(errorHandler(400, "Vehicle ID is required"));
    }

    const approvedVendor = await Vehicle.findByIdAndUpdate(
      _id,
      { 
        isAdminApproved: true,
        approvedAt: new Date(),
        updatedAt: new Date()
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!approvedVendor) {
      return next(errorHandler(404, "Vehicle request not found"));
    }

    res.status(200).json({
      message: "Vendor vehicle request approved successfully",
      data: approvedVendor
    });

  } catch (error) {
    console.error('Error approving vendor request:', error.message);
    next(errorHandler(500, "Error while approving vendor request"));
  }
};

// Reject vendor vehicle request
export const rejectVendorVehicleRequest = async (req, res, next) => {
  try {
    const { _id, rejectionReason } = req.body;

    // Improved validation
    if (!_id) {
      return next(errorHandler(400, "Vehicle ID is required"));
    }

    const updateData = {
      isRejected: true,
      rejectedAt: new Date(),
      updatedAt: new Date()
    };

    // Add rejection reason if provided
    if (rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const rejectedVendor = await Vehicle.findByIdAndUpdate(
      _id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!rejectedVendor) {
      return next(errorHandler(404, "Vehicle request not found"));
    }

    res.status(200).json({
      message: "Vendor vehicle request rejected successfully",
      data: rejectedVendor
    });

  } catch (error) {
    console.error('Error rejecting vendor request:', error.message);
    next(errorHandler(500, "Error while rejecting vendor request"));
  }
};