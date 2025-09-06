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
    const { user, logout } = useAuth();
    const [employerId, setEmployerId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState(null);

    // Delete modal state
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
        resolver: yupResolver(employerSchema),
        defaultValues: {
            companyName: "",
            companyDescription: "",
            position: "",
        },
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
                setProfileData(data);
                reset({
                    companyName: data.companyName,
                    companyDescription: data.companyDescription,
                    position: data.position,
                });
                setEditMode(false);
                setDeleteEmail(user?.email || "");
            })
            .catch(() => {
                // No profile found → switch to create mode with empty form
                setEmployerId(null);
                setProfileData(null);
                reset({
                    companyName: "",
                    companyDescription: "",
                    position: "",
                });
                setEditMode(true); // Automatically enter create mode for new users
                setDeleteEmail(user?.email || "");
            })
            .finally(() => setLoading(false));
    }, [uid, reset, user]);

    const onSubmit = (values) => {
        const payload = { ...values, userId: uid };
        const method = employerId ? "put" : "post";
        const url = employerId ? `/employers/update/${employerId}` : "/employers/create";

        axiosClient[method](url, payload)
            .then(({ data }) => {
                if (!employerId) setEmployerId(data.employerId || data.id);
                alert(`Employer profile ${employerId ? "updated" : "created"} successfully.`);
                setEditMode(false);
                setProfileData(data);
            })
            .catch((err) => {
                alert(err.response?.data?.message || "Failed to save Employer profile");
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
            await axiosClient.delete(`/employers/delete/${employerId}`, {
                params: {
                    email: deleteEmail,
                    password: deletePassword,
                },
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
        <div className="profile-page">
            <div className="profile-card container mt-4" style={{ maxWidth: "600px" }}>
                <h2>My Employer Profile</h2>

                {!editMode ? (
                    <div className="profile-fields">
                        {[
                            { label: "Company Name", value: profileData?.companyName },
                            { label: "Company Description", value: profileData?.companyDescription },
                            { label: "Position", value: profileData?.position },
                        ].map((field, idx) => (
                            <div key={idx} className="profile-row">
                                <div className="profile-label">{field.label}:</div>
                                <div className="profile-value">{field.value}</div>
                            </div>
                        ))}

                        <div className="profile-actions">
                            <button className="btn btn-primary" onClick={() => setEditMode(true)}>
                                Edit Profile
                            </button>
                            <button className="btn btn-danger" onClick={handleDeleteClick}>
                                Delete Profile
                            </button>
                        </div>
                    </div>

                ) : (
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
                                className={`form-control ${errors.companyDescription ? "is-invalid" : ""}`}
                                {...register("companyDescription")}
                                rows={4}
                            />
                            <div className="invalid-feedback">{errors.companyDescription?.message}</div>
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
                        <button type="button" className="btn btn-secondary w-100 mt-2" onClick={() => setEditMode(false)}>
                            Cancel
                        </button>
                    </form>
                )}

                {/* Delete Confirmation Modal */}
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
        </div>
    );
}
