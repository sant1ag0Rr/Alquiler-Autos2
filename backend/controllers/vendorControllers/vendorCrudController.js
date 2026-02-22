import { errorHandler } from "../../utils/error.js";
import vehicle from "../../models/vehicleModel.js";
import { uploader } from "../../utils/cloudinaryConfig.js";
import { base64Converter } from "../../utils/multer.js";
import mongoose from 'mongoose';

// Función para validar ObjectId de MongoDB
const validateObjectId = (id, fieldName = 'ID') => {
  if (!id || typeof id !== 'string') {
    throw new Error(`Invalid ${fieldName}: must be a non-empty string`);
  }
  
  const trimmedId = id.trim();
  
  if (!mongoose.Types.ObjectId.isValid(trimmedId)) {
    throw new Error(`Invalid ${fieldName}: must be a valid MongoDB ObjectId`);
  }
  
  return trimmedId;
};

// Función para validar string requerido
const validateRequiredString = (value, fieldName) => {
  if (!value || typeof value !== 'string' || !value.trim()) {
    throw new Error(`${fieldName} is required and must be a non-empty string`);
  }
  return value.trim();
};

// Función para sanitizar datos del formulario
const sanitizeVehicleData = (data) => {
  const requiredFields = [
    'registeration_number', 'company', 'name', 'model', 'title',
    'base_package', 'price', 'year_made', 'fuel_type', 'description',
    'seat', 'transmition_type', 'car_type', 'location', 'district'
  ];
  
  const sanitized = {};
  
  for (const field of requiredFields) {
    if (data[field] !== undefined) {
      if (typeof data[field] === 'string') {
        sanitized[field] = data[field].trim();
      } else {
        sanitized[field] = data[field];
      }
    }
  }
  
  return sanitized;
};

// vendor add vehicle
export const vendorAddVehicle = async (req, res, next) => {
  console.log("🚗 VEHICLE ADD REQUEST RECEIVED");
  console.log("📝 Body:", req.body);
  console.log("📁 Files:", req.files);
  
  try {
    if (!req.body) {
      return next(errorHandler(500, "body cannot be empty"));
    }
    if (!req.files || req.files.length === 0) {
      return next(errorHandler(500, "image cannot be empty"));
    }

    // Sanitizar datos de entrada
    const sanitizedData = sanitizeVehicleData(req.body);
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
      addedBy,
    } = sanitizedData;

    // Validar addedBy como ObjectId
    let validatedAddedBy;
    try {
      validatedAddedBy = validateObjectId(addedBy, 'addedBy');
    } catch (error) {
      return next(errorHandler(400, error.message));
    }

    const uploadedImages = [];
    if (req.files) {
      //converting the buffer to base64
      const encodedFiles = base64Converter(req);
      try {
        //mapping over encoded files and uploading to cloudinary
        await Promise.all(
          encodedFiles.map(async (cur) => {
            try {
              const result = await uploader.upload(cur.data, {
                public_id: cur.filename,
              });
              uploadedImages.push(result.secure_url);
            } catch (error) {
              console.log("Error uploading individual file to cloudinary:", error);
              throw error; // Re-throw to be caught by outer catch
            }
          })
        );
        try {
          if (uploadedImages.length > 0) {
            const addVehicle = new vehicle({
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
              isAdminAdded: "false",
              addedBy: validatedAddedBy,
              isAdminApproved: false,
            });
            await addVehicle.save();
            res.status(200).json({
              message: "product added to mb & cloudninary successfully",
            });
          }
        } catch (error) {
          if (error.code === 11000) {
            return next(errorHandler(409, "product already exists"));
          }
          console.log("Error saving vehicle to database:", error);
          next(errorHandler(500, "product not uploaded"));
        }
      } catch (error) {
        console.log("Error uploading images to cloudinary:", error);
        next(errorHandler(500, `could not upload image to cloudinary: ${error.message}`));
      }
    }
  } catch (error) {
    console.log("General error in vendorAddVehicle:", error);
    next(errorHandler(400, "vehicle failed to add"));
  }
};

//edit vendorVehicles
export const vendorEditVehicles = async (req, res, next) => {
  try {
    //get the id of vehicle to edit through req.params
    const vehicle_id = req.params.id;
    
    // Validar ObjectId del vehículo
    let validatedVehicleId;
    try {
      validatedVehicleId = validateObjectId(vehicle_id, 'Vehicle ID');
    } catch (error) {
      return next(errorHandler(400, error.message));
    }
    
    if (!req.body?.formData) {
      return next(errorHandler(404, "Add data to edit first"));
    }

    // Sanitizar datos del formulario
    const sanitizedFormData = sanitizeVehicleData(req.body.formData);
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
    } = sanitizedFormData;

    try {
      // Usar query object explícito para prevenir NoSQL injection
      const query = { 
        _id: { $eq: new mongoose.Types.ObjectId(validatedVehicleId) }
      };

      const updateData = {
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
        //also resetting adminApproval or rejection when editing data so data request is send again
        isAdminApproved: false,
        isRejected: false,
      };

      const edited = await vehicle.findOneAndUpdate(
        query,
        { $set: updateData },
        { new: true }
      );

      if (!edited) {
        return next(errorHandler(404, "data with this id not found"));
      }
      res.status(200).json(edited);
    } catch (error) {
      if (error.code == 11000 && error.keyPattern && error.keyValue) {
        const duplicateField = Object.keys(error.keyPattern)[0];
        const duplicateValue = error.keyValue[duplicateField];
        return next(
          errorHandler(
            409,
            `${duplicateField} '${duplicateValue}' already exists`
          )
        );
      }
      console.log("Error updating vehicle:", error);
      next(errorHandler(500, `Error updating vehicle: ${error.message}`));
    }
  } catch (error) {
    console.log("General error in vendorEditVehicles:", error);
    next(errorHandler(500, "something went wrong"));
  }
};

//delete vendor Vehicle soft delete
export const vendorDeleteVehicles = async (req, res, next) => {
  try {
    const vehicle_id = req.params.id;
    
    // Validar y sanitizar el ID del vehículo usando la función helper
    let validatedVehicleId;
    try {
      validatedVehicleId = validateObjectId(vehicle_id, 'Vehicle ID');
    } catch (error) {
      return next(errorHandler(400, error.message));
    }
    
    // Usar query object explícito para prevenir NoSQL injection
    const query = { 
      _id: { $eq: new mongoose.Types.ObjectId(validatedVehicleId) }
    };
    
    const updateData = { 
      $set: { isDeleted: "true" }
    };
    
    const softDeleted = await vehicle.findOneAndUpdate(
      query,
      updateData,
      { new: true }
    );

    if (!softDeleted) {
      return next(errorHandler(400, "vehicle not found"));
    }
    
    res.status(200).json({ message: "deleted successfully" });
  } catch (error) {
    console.log("Error in vendorDeleteVehicles:", error);
    next(errorHandler(500, "error while vendorDeleteVehicles"));
  }
};

//show vendor vehicles
export const showVendorVehicles = async (req, res, next) => {
  try {
    if (!req.body) {
      throw errorHandler(400, "User not found");
    }
    const { _id } = req.body;
    
    // Validar y sanitizar el ID del usuario
    let validatedUserId;
    try {
      validatedUserId = validateObjectId(_id, 'User ID');
    } catch (error) {
      return next(errorHandler(400, error.message));
    }
    
    // Usar query object explícito en aggregation pipeline
    const matchStage = {
      $match: {
        isDeleted: { $eq: "false" },
        isAdminAdded: { $eq: false },
        addedBy: { $eq: validatedUserId },
      }
    };
    
    const vendorsVehicles = await vehicle.aggregate([matchStage]);
    
    if (!vendorsVehicles || vendorsVehicles.length === 0) {
      throw errorHandler(400, "No vehicles found");
    }
    
    res.status(200).json(vendorsVehicles);
  } catch (error) {
    console.error("Error in showVendorVehicles:", error);
    next(errorHandler(500, "Error in showVendorVehicles"));
  }
};