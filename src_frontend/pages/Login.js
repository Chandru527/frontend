import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState } from "react";

const schema = yup.object({
    email: yup.string().required().email(),
    password: yup.string().required().min(6),
});

export default function Login() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } =
        useForm({ resolver: yupResolver(schema) });

    const { login } = useAuth();
    const nav = useNavigate();
    const loc = useLocation();

    // New state to toggle password visibility
    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = async (values) => {
        try {
            const { data } = await axiosClient.post("/auth/login", values);
            login(data.token, data.user);
            const dest = loc.state?.from?.pathname || "/";
            nav(dest, { replace: true });
        } catch (err) {
            alert(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-5">
                <h3 className="mb-3">Login</h3>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input className={`form-control ${errors.email ? "is-invalid" : ""}`} {...register("email")} />
                        <div className="invalid-feedback">{errors.email?.message}</div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <div className="input-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                                {...register("password")}
                            />
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <i className="bi bi-eye-slash"></i>
                                ) : (
                                    <i className="bi bi-eye"></i>
                                )}
                            </button>
                        </div>
                        <div className="invalid-feedback">{errors.password?.message}</div>
                    </div>

                    <button disabled={isSubmitting} className="btn btn-primary w-100">Login</button>
                    <div className="mt-3 text-center">
                        <Link to="/forgot">Forgot Password?</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
