import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

const employerSchema = yup.object({
    companyName: yup.string().required("Company name is required").min(2).max(100),
    companyDescription: yup.string().required("Company description is required"),
    position: yup.string().required("Position is required"),
});

export default function EmployerProfile() {
    const { user } = useAuth();
    const [employerId, setEmployerId] = useState(null);
    const [loading, setLoading] = useState(true);

    const uid = user?.userId || user?.id;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(employerSchema),
        defaultValues: { companyName: "", companyDescription: "", position: "" },
    });

    useEffect(() => {
        if (!uid) {
            setLoading(false);
            return;
        }
        axiosClient
            .get(`/employers/by-user/${uid}`)
            .then(({ data }) => {
                setEmployerId(data.employerId || data.id);
                reset({
                    companyName: data.companyName,
                    companyDescription: data.companyDescription,
                    position: data.position,
                });
            })
            .catch(() => {
                // ignore
            })
            .finally(() => setLoading(false));
    }, [uid, reset]);

    const onSubmit = (values) => {
        const payload = { ...values, userId: uid };

        if (employerId) {
            axiosClient
                .put(`/employers/update/${employerId}`, payload)
                .then(() => alert("Employer profile updated successfully."))
                .catch((err) =>
                    alert(err.response?.data?.message || "Failed to update Employer profile")
                );
        } else {
            axiosClient
                .post("/employers/create", payload)
                .then(({ data }) => {
                    setEmployerId(data.employerId || data.id);
                    alert("Employer profile created successfully.");
                })
                .catch((err) =>
                    alert(err.response?.data?.message || "Failed to create Employer profile")
                );
        }
    };

    if (loading) return <div>Loading your profile…</div>;
    if (!uid) return <div>Please log in to access your profile.</div>;

    return (
        <div className="container mt-4" style={{ maxWidth: "600px" }}>
            <h2>My Employer Profile</h2>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="mb-3">
                    <label className="form-label">Company Name</label>
                    <input
                        className={`form-control ${errors.companyName ? "is-invalid" : ""}`}
                        {...register("companyName")}
                    />
                    <div className="invalid-feedback">{errors.companyName?.message}</div>
                </div>
                <div className="mb-3">
                    <label className="form-label">Company Description</label>
                    <textarea
                        className={`form-control ${errors.companyDescription ? "is-invalid" : ""
                            }`}
                        {...register("companyDescription")}
                        rows={4}
                    />
                    <div className="invalid-feedback">
                        {errors.companyDescription?.message}
                    </div>
                </div>
                <div className="mb-3">
                    <label className="form-label">Position</label>
                    <input
                        className={`form-control ${errors.position ? "is-invalid" : ""}`}
                        {...register("position")}
                    />
                    <div className="invalid-feedback">{errors.position?.message}</div>
                </div>
                <button disabled={isSubmitting} className="btn btn-primary w-100">
                    {employerId ? "Update Profile" : "Create Profile"}
                </button>
            </form>
        </div>
    );
}
