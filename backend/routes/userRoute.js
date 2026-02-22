import express from "express";
import { verifyToken } from "../utils/verifyUser.js";

// User controller imports
import { 
  updateUser, 
  deleteUser, 
  signOut 
} from "../controllers/userControllers/userController.js";

// Vehicle controller imports
import { 
  listAllVehicles, 
  showVehicleDetails 
} from "../controllers/userControllers/userAllVehiclesController.js";

// Profile controller imports
import { editUserProfile } from "../controllers/userControllers/userProfileController.js";

// Booking controller imports
import { 
  BookCar, 
  razorpayOrder, 
  getVehiclesWithoutBooking, 
  filterVehicles, 
  showOneofkind, 
  showAllVariants, 
  findBookingsOfUser, 
  sendBookingDetailsEamil, 
  latestbookings, 
  findBookingsForVendor, 
  findAllBookingsForAdmin, 
  updateExistingStatuses 
} from "../controllers/userControllers/userBookingController.js";

const router = express.Router();

// User management routes
router.post('/update/:id', updateUser);
router.delete('/delete/:id', verifyToken, deleteUser);
router.get('/signout', signOut);
router.post('/editUserProfile/:id', editUserProfile);

// Vehicle listing routes
router.get('/listAllVehicles', listAllVehicles);
router.post('/showVehicleDetails', showVehicleDetails);
router.post('/filterVehicles', filterVehicles);

// Vehicle availability routes
router.post('/getVehiclesWithoutBooking', getVehiclesWithoutBooking, showAllVariants);
router.post('/showSingleofSameModel', getVehiclesWithoutBooking, showOneofkind);

// Booking management routes
router.post('/razorpay', verifyToken, razorpayOrder);
router.post('/bookCar', BookCar);
router.post('/findBookingsOfUser', findBookingsOfUser);
router.post('/findBookingsForVendor', findBookingsForVendor);
router.post('/findAllBookingsForAdmin', findAllBookingsForAdmin);
router.post('/updateExistingStatuses', updateExistingStatuses);
router.post('/latestbookings', latestbookings);
router.post('/sendBookingDetailsEamil', sendBookingDetailsEamil);

export default router;