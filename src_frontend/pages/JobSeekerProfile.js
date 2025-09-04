import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

const jobSeekerSchema = yup.object({
    fullName: yup.string().required("Full Name is required").min(2),
    gender: yup.string().required("Gender is required"),
    dateOfBirth: yup
        .date()
        .required("Date of Birth is required")
        .max(new Date(), "Date of Birth cannot be in the future"),
    email: yup.string().email("Invalid email format").required("Email is required"),
    phone: yup
        .string()
        .required("Phone number is required")
        .matches(/^\+?[0-9]{7,15}$/, "Invalid phone number"),
    address: yup.string().required("Address is required"),
    education: yup.string().required("Education is required"),
    experience: yup.string().required("Experience is required"),
    skills: yup.string().required("Skills are required"),
});

export default function JobSeekerProfile() {
    const { user } = useAuth();
    const [jobSeekerId, setJobSeekerId] = useState(null);
    const [loading, setLoading] = useState(true);

    const uid = user?.userId || user?.id;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(jobSeekerSchema),
        defaultValues: {
            fullName: "",
            gender: "",
            dateOfBirth: "",
            email: "",
            phone: "",
            address: "",
            education: "",
            experience: "",
            skills: "",
        },
    });

    useEffect(() => {
        if (!uid) {
            setLoading(false);
            return;
        }
        axiosClient
            .get(`/job-seekers/by-user/${uid}`)
            .then(({ data }) => {
                setJobSeekerId(data.jobSeekerId || data.id);
                reset({
                    fullName: data.fullName,
                    gender: data.gender || "",
                    dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split("T")[0] : "",
                    email: data.email || "",
                    phone: data.phone || "",
                    address: data.address || "",
                    education: data.education,
                    experience: data.experience,
                    skills: data.skills,
                });
            })
            .catch(() => {
                // ignore errors quietly
            })
            .finally(() => setLoading(false));
    }, [uid, reset]);

    const onSubmit = (values) => {
        const payload = { ...values, userId: uid };
        const method = jobSeekerId ? "put" : "post";
        const url = jobSeekerId
            ? `/job-seekers/update/${jobSeekerId}`
            : "/job-seekers/create";

        axiosClient[method](url, payload)
            .then(({ data }) => {
                if (!jobSeekerId) setJobSeekerId(data.jobSeekerId || data.id);
                alert(
                    `JobSeeker profile ${jobSeekerId ? "updated" : "created"} successfully.`
                );
            })
            .catch((err) => {
                alert(err.response?.data?.message || "Failed to save JobSeeker profile");
            });
    };

    if (loading) return <div>Loading your profile…</div>;
    if (!uid) return <div>Please log in to access your profile.</div>;

    return (
        <div className="container mt-4" style={{ maxWidth: "600px" }}>
            <h2>My JobSeeker Profile</h2>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {[
                    { name: "fullName", label: "Full Name", type: "text" },
                    {
                        name: "gender",
                        label: "Gender",
                        type: "select",
                        options: ["Male", "Female", "Other"],
                    },
                    { name: "dateOfBirth", label: "Date of Birth", type: "date" },
                    { name: "email", label: "Email", type: "email" },
                    { name: "phone", label: "Phone Number", type: "tel" },
                    { name: "address", label: "Address", type: "textarea" },
                    { name: "education", label: "Education", type: "text" },
                    { name: "experience", label: "Experience", type: "text" },
                    { name: "skills", label: "Skills", type: "text" },
                ].map(({ name, label, type, options }) => (
                    <div className="mb-3" key={name}>
                        <label className="form-label">{label}</label>
                        {type === "select" ? (
                            <select
                                className={`form-select ${errors[name] ? "is-invalid" : ""}`}
                                {...register(name)}
                            >
                                <option value="">Select {label}</option>
                                {options.map((opt, i) => (
                                    <option key={i} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        ) : type === "textarea" ? (
                            <textarea
                                className={`form-control ${errors[name] ? "is-invalid" : ""}`}
                                rows={3}
                                {...register(name)}
                            />
                        ) : (
                            <input
                                type={type}
                                className={`form-control ${errors[name] ? "is-invalid" : ""}`}
                                {...register(name)}
                            />
                        )}
                        <div className="invalid-feedback">{errors[name]?.message}</div>
                    </div>
                ))}

                <button disabled={isSubmitting} className="btn btn-primary w-100">
                    {jobSeekerId ? "Update Profile" : "Create Profile"}
                </button>
            </form>
        </div>
    );
}
