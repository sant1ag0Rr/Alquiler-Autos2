import { errorHandler } from "../../utils/error.js";
import Vehicle from "../../models/vehicleModel.js"; // Un solo import unificado
import { uploader } from "../../utils/cloudinaryConfig.js";
import { dataUri } from "../../utils/multer.js";

// Admin addVehicle
export const addProduct = async (req, res, next) => {
  try {
    if (!req.body) {
      return next(errorHandler(400, "Request body cannot be empty"));
    }
    
    if (!req.files || req.files.length === 0) {
      return next(errorHandler(400, "Image files are required"));
    }

    const {
      registeration_number,
      company,
      name,
      model,
      title,
      base_package,
      price,
      year_made,
      fuel_type,
      description,
      seat,
      transmition_type,
      registeration_end_date,
      insurance_end_date,
      polution_end_date,
      car_type,
      location,
      district,
    } = req.body;

    const uploadedImages = [];
    
    // Converting the buffer to base64
    const fileDataUri = dataUri(req);
    
    try {
      // Upload images to Cloudinary
      await Promise.all(
        fileDataUri.map(async (cur) => {
          try {
            const result = await uploader.upload(cur.data, {
              public_id: cur.filename,
            });
            uploadedImages.push(result.secure_url);
          } catch (uploadError) {
            console.error('Error uploading to Cloudinary:', uploadError.message);
            throw uploadError;
          }
        })
      );

      // Validate successful uploads
      if (uploadedImages.length === 0) {
        throw new Error("No images were uploaded successfully");
      }

      // Create new vehicle
      const addVehicle = new Vehicle({
        registeration_number,
        company,
        name,
        image: uploadedImages,
        model,
        car_title: title,
        car_description: description,
        base_package,
        price,
        year_made,
        fuel_type,
        seats: seat,
        transmition: transmition_type,
        insurance_end: insurance_end_date,
        registeration_end: registeration_end_date,
        pollution_end: polution_end_date,
        car_type,
        created_at: Date.now(),
        location,
        district,
      });

      await addVehicle.save();
      
      res.status(201).json({
        message: "Vehicle added successfully",
        vehicle: addVehicle
      });

    } catch (cloudinaryError) {
      console.error('Cloudinary upload error:', cloudinaryError.message);
      return next(errorHandler(500, "Failed to upload images to cloud storage"));
    }

  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];
      const duplicateValue = error.keyValue ? error.keyValue[duplicateField] : 'unknown';
      return next(errorHandler(409, `${duplicateField} '${duplicateValue}' already exists`));
    }
    
    console.error('Error adding vehicle:', error.message);
    next(errorHandler(500, "Failed to add vehicle"));
  }
};

// Show all vehicles to admin
export const showVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ isDeleted: { $ne: true } });
    
    if (vehicles.length === 0) {
      return next(errorHandler(404, "No vehicles found"));
    }
    
    res.status(200).json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error.message);
    next(errorHandler(500, "Error retrieving vehicles"));
  }
};

// Admin delete vehicle
export const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle_id = req.params.id;
    
    if (!vehicle_id) {
      return next(errorHandler(400, "Vehicle ID is required"));
    }

    const deleted = await Vehicle.findByIdAndUpdate(
      vehicle_id,
      { isDeleted: true },
      { new: true }
    );
    
    if (!deleted) {
      return next(errorHandler(404, "Vehicle not found"));
    }
    
    res.status(200).json({ 
      message: "Vehicle deleted successfully",
      vehicleId: vehicle_id 
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error.message);
    next(errorHandler(500, "Error deleting vehicle"));
  }
};

// Edit vehicle listed by admin
export const editVehicle = async (req, res, next) => {
  try {
    const vehicle_id = req.params.id;
    
    if (!vehicle_id) {
      return next(errorHandler(400, "Vehicle ID cannot be empty"));
    }
    
    if (!req.body?.formData) {
      return next(errorHandler(400, "Form data is required for editing"));
    }

    const {
      registeration_number,
      company,
      name,
      model,
      title,
      base_package,
      price,
      year_made,
      description,
      Seats,
      transmitionType,
      Registeration_end_date,
      insurance_end_date,
      polution_end_date,
      carType,
      fuelType,
      vehicleLocation,
      vehicleDistrict,
    } = req.body.formData;

    const edited = await Vehicle.findByIdAndUpdate(
      vehicle_id,
      {
        registeration_number,
        company,
        name,
        model,
        car_title: title,
        car_description: description,
        base_package,
        price,
        year_made,
        fuel_type: fuelType,
        seats: Seats,
        transmition: transmitionType,
        insurance_end: insurance_end_date,
        registeration_end: Registeration_end_date,
        pollution_end: polution_end_date,
        car_type: carType,
        updated_at: Date.now(),
        location: vehicleLocation,
        district: vehicleDistrict,
      },
      { new: true, runValidators: true }
    );
    
    if (!edited) {
      return next(errorHandler(404, "Vehicle not found"));
    }
    
    res.status(200).json({
      message: "Vehicle updated successfully",
      vehicle: edited
    });
    
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000 && error.keyPattern && error.keyValue) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      const duplicateValue = error.keyValue[duplicateField];
      return next(
        errorHandler(
          409,
          `${duplicateField} '${duplicateValue}' already exists`
        )
      );
    }
    
    console.error('Error editing vehicle:', error.message);
    next(errorHandler(500, "Error updating vehicle"));
  }
};