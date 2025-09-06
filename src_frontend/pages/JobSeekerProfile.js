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
    const { user, logout } = useAuth();
    const [jobSeekerId, setJobSeekerId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState(null);

    // Delete confirmation modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteEmail, setDeleteEmail] = useState("");
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteError, setDeleteError] = useState("");

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
                setProfileData(data);
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
                setEditMode(false);
                setDeleteEmail(user?.email || "");
            })
            .catch(() => {
                // No profile found → enter create mode with empty form
                setJobSeekerId(null);
                setProfileData(null);
                reset({
                    fullName: "",
                    gender: "",
                    dateOfBirth: "",
                    email: "",
                    phone: "",
                    address: "",
                    education: "",
                    experience: "",
                    skills: "",
                });
                setEditMode(true); // Show create form automatically
                setDeleteEmail(user?.email || "");
            })
            .finally(() => setLoading(false));
    }, [uid, reset, user]);

    const onSubmit = (values) => {
        const payload = { ...values, userId: uid };
        const method = jobSeekerId ? "put" : "post";
        const url = jobSeekerId ? `/job-seekers/update/${jobSeekerId}` : "/job-seekers/create";

        axiosClient[method](url, payload)
            .then(({ data }) => {
                if (!jobSeekerId) setJobSeekerId(data.jobSeekerId || data.id);
                alert(`JobSeeker profile ${jobSeekerId ? "updated" : "created"} successfully.`);
                setEditMode(false);
                setProfileData(data);
            })
            .catch((err) => {
                alert(err.response?.data?.message || "Failed to save JobSeeker profile");
            });
    };

    const handleDeleteClick = () => {
        setDeleteError("");
        setDeleteEmail(user?.email || "");
        setDeletePassword("");
        setShowDeleteModal(true);
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setDeleteError("");
    };

    const confirmDelete = async () => {
        if (!deleteEmail || !deletePassword) {
            setDeleteError("Email and password are required");
            return;
        }
        try {
            await axiosClient.delete(`/job-seekers/delete/${jobSeekerId}`, {
                params: { email: deleteEmail, password: deletePassword },
            });
            alert("Profile deleted successfully");
            setShowDeleteModal(false);
            logout();
        } catch (err) {
            setDeleteError(err.response?.data || "Delete failed. Check your credentials.");
        }
    };

    if (loading) return <div>Loading your profile…</div>;
    if (!uid) return <div>Please log in to access your profile.</div>;

    return (
        <div className="container mt-4" style={{ maxWidth: "600px" }}>
            <h2>My JobSeeker Profile</h2>

            {!editMode ? (
                <>
                    <p><strong>Full Name:</strong> {profileData.fullName}</p>
                    <p><strong>Gender:</strong> {profileData.gender}</p>
                    <p><strong>Date of Birth:</strong> {profileData.dateOfBirth?.split("T")[0]}</p>
                    <p><strong>Email:</strong> {profileData.email}</p>
                    <p><strong>Phone:</strong> {profileData.phone}</p>
                    <p><strong>Address:</strong> {profileData.address}</p>
                    <p><strong>Education:</strong> {profileData.education}</p>
                    <p><strong>Experience:</strong> {profileData.experience}</p>
                    <p><strong>Skills:</strong> {profileData.skills}</p>
                    <button className="btn btn-primary me-2" onClick={() => setEditMode(true)}>
                        Edit Profile
                    </button>
                    <button className="btn btn-danger" onClick={handleDeleteClick}>
                        Delete Profile
                    </button>
                </>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    {[
                        { name: "fullName", label: "Full Name", type: "text" },
                        { name: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
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
                                <select className={`form-select ${errors[name] ? "is-invalid" : ""}`} {...register(name)}>
                                    <option value="">Select {label}</option>
                                    {options.map((opt, i) => (
                                        <option key={i} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            ) : type === "textarea" ? (
                                <textarea className={`form-control ${errors[name] ? "is-invalid" : ""}`} rows={3} {...register(name)} />
                            ) : (
                                <input type={type} className={`form-control ${errors[name] ? "is-invalid" : ""}`} {...register(name)} />
                            )}
                            <div className="invalid-feedback">{errors[name]?.message}</div>
                        </div>
                    ))}
                    <button disabled={isSubmitting} className="btn btn-primary w-100">
                        {jobSeekerId ? "Update Profile" : "Create Profile"}
                    </button>
                    <button type="button" className="btn btn-secondary w-100 mt-2" onClick={() => setEditMode(false)}>
                        Cancel
                    </button>
                </form>
            )}

            {showDeleteModal && (
                <div className="modal d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog" role="document">
                        <div className="modal-content p-4">
                            <h5 className="modal-title mb-3">Confirm Profile Deletion</h5>
                            <p>Please enter your email and password to confirm profile deletion.</p>
                            <input
                                type="email"
                                className="form-control mb-2"
                                placeholder="Email"
                                value={deleteEmail}
                                onChange={(e) => setDeleteEmail(e.target.value)}
                            />
                            <input
                                type="password"
                                className="form-control mb-2"
                                placeholder="Password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                            />
                            {deleteError && <div className="text-danger mb-2">{deleteError}</div>}
                            <div className="d-flex justify-content-end">
                                <button className="btn btn-secondary me-2" onClick={cancelDelete}>
                                    Cancel
                                </button>
                                <button className="btn btn-danger" onClick={confirmDelete}>
                                    Delete Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
