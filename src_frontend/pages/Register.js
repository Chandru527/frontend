import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";

const schema = yup.object({
    name: yup.string().required().min(2),
    email: yup.string().required().email(),
    role: yup.string().oneOf(["job_seeker", "employer"]).required(),
    password: yup.string().required().min(8), // show password rules in UI if you like
    confirm: yup.string().oneOf([yup.ref("password")], "Passwords must match")
});

export default function Register() {
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } =
        useForm({ resolver: yupResolver(schema) });

    const nav = useNavigate();
    const pwd = watch("password");

    const strength = () => {
        if (!pwd) return "—";
        let s = 0;
        if (pwd.length >= 8) s++;
        if (/[A-Z]/.test(pwd)) s++;
        if (/[a-z]/.test(pwd)) s++;
        if (/\d/.test(pwd)) s++;
        if (/[^A-Za-z0-9]/.test(pwd)) s++;
        return ["Weak", "Fair", "OK", "Good", "Strong"][Math.max(0, s - 1)];
    };

    const onSubmit = async (values) => {
        try {
            await axiosClient.post("/auth/register", {
                name: values.name,
                email: values.email,
                password: values.password,
                role: values.role
            });
            // Redirect to login after successful registration
            nav("/login", { replace: true });
        } catch (err) {
            alert(err.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-6">
                <h3 className="mb-3">Create your account</h3>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="mb-3">
                        <label className="form-label">Full Name</label>
                        <input className={`form-control ${errors.name ? 'is-invalid' : ''}`} {...register("name")} />
                        <div className="invalid-feedback">{errors.name?.message}</div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input className={`form-control ${errors.email ? 'is-invalid' : ''}`} {...register("email")} />
                        <div className="invalid-feedback">{errors.email?.message}</div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">I am a</label>
                        <select className={`form-select ${errors.role ? 'is-invalid' : ''}`} {...register("role")}>
                            <option value="">Select</option>
                            <option value="job_seeker">Job Seeker</option>
                            <option value="employer">Employer</option>
                        </select>

                        <div className="invalid-feedback">{errors.role?.message}</div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input type="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`} {...register("password")} />
                        <div className="form-text">Strength: {strength()}</div>
                        <div className="invalid-feedback">{errors.password?.message}</div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Confirm Password</label>
                        <input type="password" className={`form-control ${errors.confirm ? 'is-invalid' : ''}`} {...register("confirm")} />
                        <div className="invalid-feedback">{errors.confirm?.message}</div>
                    </div>

                    <button disabled={isSubmitting} className="btn btn-success w-100">Register</button>
                </form>
            </div>
        </div>
    );
}
