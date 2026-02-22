import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { toast } from "sonner";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/getAllUsers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        const errorText = await res.text();
        console.error("Error del servidor:", res.status, errorText);
        toast.error("Error al cargar usuarios");
      }
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      field: "username",
      headerName: "Nombre de Usuario",
      width: 200,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <img
            src={params.row.profilePicture || "https://via.placeholder.com/40"}
            alt={`Foto de perfil de ${params.row.username}`}
            className="w-10 h-10 rounded-full"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/40";
            }}
          />
          <span>{params.row.username}</span>
        </div>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      width: 250,
    },
    {
      field: "role",
      headerName: "Rol",
      width: 150,
      renderCell: (params) => {
        if (params.row.isAdmin) {
          return (
            <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
              Administrador
            </span>
          );
        }
        if (params.row.isVendor) {
          return (
            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              Vendedor
            </span>
          );
        }
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
            Cliente
          </span>
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Fecha de Registro",
      width: 200,
      renderCell: (params) => {
        try {
          return new Date(params.row.createdAt).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        } catch (dateError) {
          console.error("Error al formatear fecha:", dateError);
          return "Fecha inválida";
        }
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="sr-only">Cargando usuarios...</span>
      </div>
    );
  }

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Todos los Usuarios</h1>
        <p className="text-gray-600">Total: {users.length} usuarios</p>
      </div>

      <div className="h-[600px] w-full">
        <DataGrid
          rows={users}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          className="bg-white"
          getRowId={(row) => row._id}
          localeText={{
            noRowsLabel: 'No hay usuarios disponibles',
            footerRowSelected: (count) => `${count} usuarios seleccionados`,
          }}
        />
      </div>
    </div>
  );
};

export default AllUsers;