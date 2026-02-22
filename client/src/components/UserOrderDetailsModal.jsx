import { useDispatch, useSelector } from "react-redux";
import { setIsOrderModalOpen } from "../redux/user/userSlice";

const UserOrderDetailsModal = () => {
  const { isOrderModalOpen, singleOrderDetails: cur } = useSelector(
    (state) => state.user
  );
  const dispatch = useDispatch();
  
  // Verificación de datos y manejo de errores
  if (!cur || !cur.bookingDetails || !cur.vehicleDetails) {
    return null;
  }
  
  const pickupDate = new Date(cur.bookingDetails.pickupDate);
  const dropOffDate = new Date(cur.bookingDetails.dropOffDate);
  
  // Función para formatear fecha
  const formatDate = (date) => {
    if (isNaN(date.getTime())) {
      return "Fecha inválida";
    }
    return `${date.getDate()}:${date.getMonth() + 1}:${date.getFullYear()}`;
  };
  
  // Función para formatear tiempo
  const formatTime = (date) => {
    if (isNaN(date.getTime())) {
      return "Tiempo inválido";
    }
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  const closeModal = () => {
    dispatch(setIsOrderModalOpen(false));
  };
  
  // Manejo del click en el overlay para cerrar modal
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };
  
  // Manejo de tecla Escape
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };
  
  if (!isOrderModalOpen) {
    return null;
  }
  
  return (
    <div
      className="fixed inset-0 z-[999] grid h-screen w-screen place-items-center bg-black bg-opacity-60 opacity-100 backdrop-blur-sm transition duration-300 ease-in-out overflow-scroll"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
    >
      <div className="relative m-4 mx-auto min-w-[300px] md:min-w-[500px] max-w-[40%] rounded-lg bg-white font-sans text-base font-light leading-relaxed text-blue-gray-500 antialiased shadow-2xl">
        <div className="relative pt-10 p-4 antialiased capitalize font-medium text-[10px] md:text-[16px]">
          <div className="mb-4">
            <div id="modal-title" className="mb-2 font-bold">Booking Details</div>
            <hr />
            <div className="mb-4 mt-2">
              <div className="flex items-center justify-between">
                <div>Booking Id</div>
                <div>{cur.bookingDetails._id}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>Monto Total</div>
                <div>{cur.bookingDetails.totalPrice}</div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div>Pickup Location</div>
                <div>{cur.bookingDetails.pickUpLocation}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>Pickup Date</div>
                <div>{formatDate(pickupDate)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>Pickup Time</div>
                <div>{formatTime(pickupDate)}</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>Dropoff Location</div>
              <div>{cur.bookingDetails.dropOffLocation}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Dropoff Date</div>
              <div>{formatDate(dropOffDate)}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Dropoff Time</div>
              <div>{formatTime(dropOffDate)}</div>
            </div>
          </div>
          
          <div className="mt-4 font-bold">Vehicle Details</div>
          <hr className="mt-4 mb-4" />
          <div className="flex items-center justify-between">
            <div>Vehicle Number</div>
            <div>{cur.vehicleDetails.registeration_number}</div>
          </div>
          <div className="flex items-center justify-between">
            <div>Model</div>
            <div>{cur.vehicleDetails.model}</div>
          </div>
          <div className="flex items-center justify-between">
            <div>Company</div>
            <div>{cur.vehicleDetails.company}</div>
          </div>
          <div className="flex items-center justify-between">
            <div>Vehicle Type</div>
            <div>{cur.vehicleDetails.car_type}</div>
          </div>
          <div className="flex items-center justify-between">
            <div>Seats</div>
            <div>{cur.vehicleDetails.seats}</div>
          </div>
          <div className="flex items-center justify-between">
            <div>Fuel Type</div>
            <div>{cur.vehicleDetails.fuel_type}</div>
          </div>
          <div className="flex items-center justify-between">
            <div>Transmission</div>
            <div>{cur.vehicleDetails.transmition}</div>
          </div>
          <div className="flex items-center justify-between">
            <div>Manufacturing Year</div>
            <div>{cur.vehicleDetails.year_made}</div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-end p-4 shrink-0 text-blue-gray-500">
          <button
            type="button"
            className="middle none center rounded-lg bg-gradient-to-tr from-green-600 to-green-400 py-3 px-6 font-sans text-xs font-bold uppercase text-white shadow-md shadow-green-500/20 transition ease-in-out duration-300 hover:shadow-lg hover:shadow-green-500/40 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none animate-bounce hover:animate-none"
            onClick={closeModal}
            autoFocus
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserOrderDetailsModal;