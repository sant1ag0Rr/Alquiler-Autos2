import styles from "../../index";
import { Link, useNavigate } from "react-router-dom";
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from "../../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  email: z
    .string()
    .min(1, { message: "Email requerido" })
    .refine((value) => /\S+@\S+\.\S+/.test(value), {
      message: "Email invalido",
    }),
  password: z
    .string()
    .min(8, { message: "Minimo 8 caracteres" })
    .regex(/[A-Z]/, { message: "Al menos una mayuscula" })
    .regex(/[a-z]/, { message: "Al menos una minuscula" })
    .regex(/[0-9]/, { message: "Al menos un numero" })
    .regex(/[^A-Za-z0-9]/, { message: "Al menos un caracter especial" }),
});

function SignIn() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const { isLoading, isError } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onSubmit = async (formData) => {
    try {
      dispatch(signInStart());

      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || data?.succes === false) {
        dispatch(signInFailure(data));
        return;
      }

      if (data?.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }

      if (data?.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      if (data.isAdmin) {
        dispatch(signInSuccess(data));
        navigate("/adminDashboard");
        return;
      }

      if (data.isUser) {
        dispatch(signInSuccess(data));
        navigate("/");
        return;
      }

      dispatch(signInFailure({ message: "Rol de usuario no permitido" }));
    } catch (error) {
      dispatch(signInFailure({ message: "No se pudo conectar con el servidor" }));
    }
  };

  return (
    <>
      <div
        className={`max-w-[340px] pb-10 md:max-w-md min-h-[500px] mx-auto mt-[70px] md:mt-[80px] rounded-lg overflow-hidden  shadow-2xl`}
      >
        <div
          className={` green px-6 py-2   rounded-t-lg flex justify-between items-center`}
        >
          <h1 className={`${styles.heading2}  text-normal `}>Iniciar Sesion</h1>
          <Link to="/">
            <div className=" px-3  font-bold  hover:bg-green-300 rounded-md  shadow-inner">
              x
            </div>
          </Link>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 pt-10 px-5"
        >
          <div>
            <input
              type="email"
              id="email"
              className="text-black bg-slate-100 p-3 rounded-md w-full"
              placeholder="Email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-[10px]">{errors.email.message}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              id="password"
              className="text-black bg-slate-100 p-3 rounded-md w-full"
              placeholder="Password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-red-500 text-[10px]">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            className={`${styles.button}  disabled:bg-slate-500 text-black disabled:text-white`}
            disabled={isLoading}
          >
            {isLoading ? "Cargando..." : "Iniciar Sesion"}
          </button>
          <div className="flex justify-between">
            <div className="flex justify-between">
              <p className="text-[10px] border-r border-black">
                No tienes cuenta?{" "}
                <span className="text-blue-600 pr-2">
                  <Link to="/signup">Registrarse</Link>
                </span>
              </p>
              <p className="text-[10px] pl-2 text-blue-600">olvide mi contrasena</p>
            </div>

            <p className="text-[10px] text-red-600">
              {isError ? isError.message || "something went wrong" : " "}
            </p>
          </div>
        </form>
      </div>
    </>
  );
}

export default SignIn;
