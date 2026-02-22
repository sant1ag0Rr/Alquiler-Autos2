import express from "express";

// Authentication and middleware imports
import { signIn } from "../controllers/authController.js";
import { signOut } from "../controllers/userControllers/userController.js";
import { multerUploads } from "../utils/multer.js";

// Admin controller imports
import { adminAuth, adminProfile } from "../controllers/adminControllers/adminController.js";
import { getAllUsers, getDashboardStats } from '../controllers/adminController.js';

// Dashboard controller imports (unified - no more duplicates)
import { 
  addProduct, 
  deleteVehicle, 
  editVehicle, 
  showVehicles 
} from "../controllers/adminControllers/dashboardController.js";

// Master collection controller imports (unified)
import { 
  insertDummyData, 
  getCarModelData 
} from "../controllers/adminControllers/masterCollectionController.js";

// Vendor vehicle requests imports
import { 
  approveVendorVehicleRequest, 
  fetchVendorVehilceRequests, 
  rejectVendorVehicleRequest 
} from "../controllers/adminControllers/vendorVehilceRequests.js";

// Bookings controller imports
import { 
  allBookings, 
  changeStatus 
} from "../controllers/adminControllers/bookingsController.js";

const router = express.Router();

// Authentication routes
router.post('/dashboard', signIn, adminAuth);
router.post('/profile', adminProfile);
router.get('/signout', signOut);

// Vehicle management routes
router.post('/addProduct', multerUploads, addProduct);
router.get('/showVehicles', showVehicles);
router.delete('/deleteVehicle/:id', deleteVehicle);
router.put('/editVehicle/:id', editVehicle);

// Master data routes
router.get('/dummyData', insertDummyData);
router.get('/getVehicleModels', getCarModelData);

// Vendor vehicle request routes
router.get('/fetchVendorVehilceRequests', fetchVendorVehilceRequests);
router.post('/approveVendorVehicleRequest', approveVendorVehicleRequest);
router.post('/rejectVendorVehicleRequest', rejectVendorVehicleRequest);

// Booking management routes
router.get('/allBookings', allBookings);
router.post('/changeStatus', changeStatus);

// User management routes
router.get('/getAllUsers', getAllUsers);
router.get('/getDashboardStats', getDashboardStats);

export default router;
