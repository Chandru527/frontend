import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

const schema = yup.object({
    fullName: yup.string().required("Full Name is required").min(2),
    education: yup.string().required("Education details are required"),
    experience: yup.string().required("Experience details are required"),
    skills: yup.string().required("Skills are required"),
});

export default function Profile() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [jobSeekerId, setJobSeekerId] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            fullName: "",
            education: "",
            experience: "",
            skills: "",
        },
    });

    // ✅ Log user for debugging
    console.log("Logged-in user:", user);

    useEffect(() => {
        if (!user) {
            setLoading(false); // User not yet loaded
            return;
        }
        (async () => {
            try {
                const { data } = await axiosClient.get(`/job-seekers/by-user/${user.userId || user.id}`);
                setJobSeekerId(data.jobSeekerId);
                reset({
                    fullName: data.fullName,
                    education: data.education,
                    experience: data.experience,
                    skills: data.skills,
                });
            } catch (error) {
                console.warn("No existing profile found:", error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [user, reset]);

    const onSubmit = async (values) => {
        if (!user) {
            alert("Loading user info, please wait...");
            return;
        }

        const payload = {
            fullName: values.fullName,
            education: values.education,
            experience: values.experience,
            skills: values.skills,
            userId: user.userId || user.id, // ✅ fallback
        };

        console.log("Submitting payload:", payload);

        try {
            if (jobSeekerId) {
                const response = await axiosClient.put(`/job-seekers/update/${jobSeekerId}`, payload);
                console.log("Update response:", response.data);
                alert("Profile updated successfully!");
            } else {
                const response = await axiosClient.post("/job-seekers/create", payload);
                console.log("Create response:", response.data);
                setJobSeekerId(response.data.jobSeekerId); // ✅ set id after creation
                alert("Profile created successfully!");
            }
        } catch (error) {
            console.error("Failed to save profile:", error.response?.data || error.message);
            alert("Failed to save profile: " + (error.response?.data?.message || error.message));
        }
    };

    if (loading) return <div>Loading your profile...</div>;
    if (!user) return <div>Please log in to access your profile.</div>; // ✅ user not available yet

    return (
        <div className="container mt-4" style={{ maxWidth: "600px" }}>
            <h2>My JobSeeker Profile</h2>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                        className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
                        {...register("fullName")}
                    />
                    <div className="invalid-feedback">{errors.fullName?.message}</div>
                </div>

                <div className="mb-3">
                    <label className="form-label">Education</label>
                    <input
                        className={`form-control ${errors.education ? "is-invalid" : ""}`}
                        {...register("education")}
                    />
                    <div className="invalid-feedback">{errors.education?.message}</div>
                </div>

                <div className="mb-3">
                    <label className="form-label">Experience</label>
                    <input
                        className={`form-control ${errors.experience ? "is-invalid" : ""}`}
                        {...register("experience")}
                    />
                    <div className="invalid-feedback">{errors.experience?.message}</div>
                </div>

                <div className="mb-3">
                    <label className="form-label">Skills</label>
                    <input
                        className={`form-control ${errors.skills ? "is-invalid" : ""}`}
                        {...register("skills")}
                    />
                    <div className="invalid-feedback">{errors.skills?.message}</div>
                </div>

                <button disabled={isSubmitting} className="btn btn-primary w-100">
                    {jobSeekerId ? "Update Profile" : "Create Profile"}
                </button>
            </form>
        </div>
    );
}
