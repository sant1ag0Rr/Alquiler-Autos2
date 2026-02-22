import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { setEditData } from "../../../redux/adminSlices/actions";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ModeEditOutlineIcon from "@mui/icons-material/ModeEditOutline";
import { Button } from "@mui/material";
import { Header } from "../components";
import toast, { Toaster } from "react-hot-toast";
import { DataGrid } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import { showVehicles } from "../../../redux/user/listAllVehicleSlice";
import {
  clearAdminVehicleToast,
} from "../../../redux/adminSlices/adminDashboardSlice/StatusSlice";

function AllVehicles() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAddVehicleClicked } = useSelector((state) => state.addVehicle);
  
  // ✅ Corregido: useState desestructurado correctamente
  const [allVehicles, setAllVehicles] = useState([]);

  const { adminEditVehicleSuccess, adminAddVehicleSuccess, adminCrudError } =
    useSelector((state) => state.statusSlice);

  // Show vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch("/api/admin/showVehicles", {
          method: "GET",
        });
        if (res.ok) {
          const data = await res.json();
          setAllVehicles(data);
          dispatch(showVehicles(data));
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    };
    fetchVehicles();
  }, [isAddVehicleClicked, dispatch]);

  // Delete a vehicle
  const handleDelete = async (vehicleId) => {
    try {
      setAllVehicles(allVehicles.filter((cur) => cur._id !== vehicleId));
      const res = await fetch(`/api/admin/deleteVehicle/${vehicleId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Eliminado exitosamente", {
          duration: 800,
          style: {
            color: "white",
            background: "#c48080",
          },
        });
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
    }
  };

  // Edit vehicles
  const handleEditVehicle = (vehicleId) => {
    dispatch(setEditData({ _id: vehicleId }));
    navigate(`/adminDashboard/editProducts?vehicle_id=${vehicleId}`);
  };

  const columns = [
    {
      field: "image",
      headerName: "Imagen",
      width: 150,
      renderCell: (params) => (
        <img
          src={params.value}
          style={{
            width: "50px",
            height: "40px",
            borderRadius: "5px",
            objectFit: "cover",
          }}
          alt="vehicle"
        />
      ),
    },
    {
      field: "registeration_number",
      headerName: "Número de Registro",
      width: 150,
    },
    { field: "company", headerName: "Compañía", width: 150 },
    { field: "name", headerName: "Nombre", width: 150 },
    {
      field: "edit",
      headerName: "Editar",
      width: 100,
      renderCell: (params) => (
        <Button onClick={() => handleEditVehicle(params.row.id)}>
          <ModeEditOutlineIcon />
        </Button>
      ),
    },
    {
      field: "delete",
      headerName: "Eliminar",
      width: 100,
      renderCell: (params) => (
        <Button onClick={() => handleDelete(params.row.id)}>
          <DeleteForeverIcon />
        </Button>
      ),
    },
  ];

  const rows = allVehicles
    .filter(
      (vehicle) => vehicle.isDeleted === "false" && vehicle.isAdminApproved
    )
    .map((vehicle) => ({
      id: vehicle._id,
      image: vehicle.image[0],
      registeration_number: vehicle.registeration_number,
      company: vehicle.company,
      name: vehicle.name,
    }));

  // ✅ Corregido: Toast notifications manejadas de forma más eficiente
  useEffect(() => {
    if (adminEditVehicleSuccess) {
      toast.success("Vehículo editado exitosamente");
    } else if (adminAddVehicleSuccess) {
      toast.success("Vehículo agregado exitosamente");
    } else if (adminCrudError) {
      toast.error("Error en la operación");
    }
  }, [adminEditVehicleSuccess, adminAddVehicleSuccess, adminCrudError]);

  useEffect(() => {
    const clearNotificationsTimeout = setTimeout(() => {
      dispatch(clearAdminVehicleToast());
    }, 3000);
  
    return () => clearTimeout(clearNotificationsTimeout);
  }, [adminEditVehicleSuccess, adminAddVehicleSuccess, adminCrudError, dispatch]);

  // ✅ Corregido: Determinar si mostrar Toaster de forma más eficiente
  const shouldShowToaster = adminEditVehicleSuccess || adminAddVehicleSuccess || adminCrudError;

  return (
    <>
      {shouldShowToaster && <Toaster />}
      
      <div className="max-w-[1000px] d-flex justify-end text-start items-end p-10">
        <Header title="Todos los Vehículos" />
        <Box sx={{ height: "100%", width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 8,
                },
              },
            }}
            pageSizeOptions={[5]}
            checkboxSelection
            disableRowSelectionOnClick
            sx={{
              ".MuiDataGrid-columnSeparator": {
                display: "none",
              },
              "&.MuiDataGrid-root": {
                border: "none",
              },
            }}
          />
        </Box>
      </div>
    </>
  );
}

export default AllVehicles;