import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";


const jobSeekerSchema = yup.object({
    fullName: yup.string().required("Full Name is required").min(2),
    education: yup.string().required("Education is required"),
    experience: yup.string().required("Experience is required"),
    skills: yup.string().required("Skills are required"),
});


const employerSchema = yup.object({
    companyName: yup.string().required("Company name is required").min(2).max(100),
    companyDescription: yup.string().required("Company description is required"),
    position: yup.string().required("Position is required"),
});

export default function Profile() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    const uid = user?.userId || user?.id;
    const roles = user?.roles || [];


    const [jobSeekerId, setJobSeekerId] = useState(null);
    const {
        register: registerJS,
        handleSubmit: handleSubmitJS,
        reset: resetJS,
        formState: { errors: errorsJS, isSubmitting: isSubmittingJS },
    } = useForm({
        resolver: yupResolver(jobSeekerSchema),
        defaultValues: {
            fullName: "",
            education: "",
            experience: "",
            skills: "",
        },
    });


    const [employerId, setEmployerId] = useState(null);
    const {
        register: registerEmp,
        handleSubmit: handleSubmitEmp,
        reset: resetEmp,
        formState: { errors: errorsEmp, isSubmitting: isSubmittingEmp },
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

        let jobSeekerLoaded = false;
        let employerLoaded = false;

        const checkLoading = () => {
            if (
                (!roles.includes("job_seeker") || jobSeekerLoaded) &&
                (!roles.includes("employer") || employerLoaded)
            ) {
                setLoading(false);
            }
        };

        if (roles.includes("job_seeker")) {
            axiosClient
                .get(`/job-seekers/by-user/${uid}`)
                .then(({ data }) => {
                    setJobSeekerId(data.jobSeekerId || data.id);
                    resetJS({
                        fullName: data.fullName,
                        education: data.education,
                        experience: data.experience,
                        skills: data.skills,
                    });
                })
                .catch(() => {

                })
                .finally(() => {
                    jobSeekerLoaded = true;
                    checkLoading();
                });
        } else {
            jobSeekerLoaded = true;
        }

        if (roles.includes("employer")) {
            axiosClient
                .get(`/employers/by-user/${uid}`)
                .then(({ data }) => {
                    setEmployerId(data.employerId || data.id);
                    resetEmp({
                        companyName: data.companyName,
                        companyDescription: data.companyDescription,
                        position: data.position,
                    });
                })
                .catch(() => {

                })
                .finally(() => {
                    employerLoaded = true;
                    checkLoading();
                });
        } else {
            employerLoaded = true;
        }

        checkLoading();
    }, [uid, roles, resetJS, resetEmp]);


    const onSubmitJobSeeker = (values) => {
        const payload = { ...values, userId: uid };
        const method = jobSeekerId ? "put" : "post";
        const url = jobSeekerId ? `/job-seekers/update/${jobSeekerId}` : "/job-seekers/create";

        axiosClient[method](url, payload)
            .then(({ data }) => {
                if (!jobSeekerId) setJobSeekerId(data.jobSeekerId || data.id);
                alert(`JobSeeker profile ${jobSeekerId ? "updated" : "created"} successfully.`);
            })
            .catch((err) => {
                alert(err.response?.data?.message || "Failed to save JobSeeker profile");
            });
    };

    const onSubmitEmployer = (values) => {
        const payload = { ...values, userId: uid };

        if (employerId) {
            axiosClient
                .put(`/employers/update/${employerId}`, payload)
                .then(() => {
                    alert("Employer profile updated successfully.");
                })
                .catch((err) => {
                    alert(err.response?.data?.message || "Failed to update Employer profile");
                });
        } else {
            axiosClient
                .get(`/employers/by-user/${uid}`)
                .then(({ data }) => {
                    if (data && data.employerId) {
                        setEmployerId(data.employerId);
                        axiosClient
                            .put(`/employers/update/${data.employerId}`, payload)
                            .then(() => {
                                alert("Employer profile updated successfully.");
                            })
                            .catch((err) => {
                                alert(err.response?.data?.message || "Failed to update Employer profile");
                            });
                    } else {
                        axiosClient
                            .post("/employers/create", payload)
                            .then(({ data }) => {
                                setEmployerId(data.employerId || data.id);
                                alert("Employer profile created successfully.");
                            })
                            .catch((err) => {
                                alert(err.response?.data?.message || "Failed to create Employer profile");
                            });
                    }
                })
                .catch(() => {
                    axiosClient
                        .post("/employers/create", payload)
                        .then(({ data }) => {
                            setEmployerId(data.employerId || data.id);
                            alert("Employer profile created successfully.");
                        })
                        .catch((err) => {
                            alert(err.response?.data?.message || "Failed to create Employer profile");
                        });
                });
        }
    };

    if (loading) return <div>Loading your profile…</div>;
    if (!uid) return <div>Please log in to access your profile.</div>;

    if (roles.includes("employer")) {
        return (
            <div className="container mt-4" style={{ maxWidth: "600px" }}>
                <h2>My Employer Profile</h2>
                <form onSubmit={handleSubmitEmp(onSubmitEmployer)} noValidate>
                    <div className="mb-3">
                        <label className="form-label">Company Name</label>
                        <input
                            className={`form-control ${errorsEmp.companyName ? "is-invalid" : ""}`}
                            {...registerEmp("companyName")}
                        />
                        <div className="invalid-feedback">{errorsEmp.companyName?.message}</div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Company Description</label>
                        <textarea
                            className={`form-control ${errorsEmp.companyDescription ? "is-invalid" : ""}`}
                            {...registerEmp("companyDescription")}
                            rows={4}
                        />
                        <div className="invalid-feedback">{errorsEmp.companyDescription?.message}</div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Position</label>
                        <input
                            className={`form-control ${errorsEmp.position ? "is-invalid" : ""}`}
                            {...registerEmp("position")}
                        />
                        <div className="invalid-feedback">{errorsEmp.position?.message}</div>
                    </div>

                    <button disabled={isSubmittingEmp} className="btn btn-primary w-100">
                        {employerId ? "Update Profile" : "Create Profile"}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="container mt-4" style={{ maxWidth: "600px" }}>
            <h2>My JobSeeker Profile</h2>
            <form onSubmit={handleSubmitJS(onSubmitJobSeeker)} noValidate>
                {["fullName", "education", "experience", "skills"].map((field) => (
                    <div className="mb-3" key={field}>
                        <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                        <input
                            className={`form-control ${errorsJS[field] ? "is-invalid" : ""}`}
                            {...registerJS(field)}
                        />
                        <div className="invalid-feedback">{errorsJS[field]?.message}</div>
                    </div>
                ))}
                <button disabled={isSubmittingJS} className="btn btn-primary w-100">
                    {jobSeekerId ? "Update Profile" : "Create Profile"}
                </button>
            </form>
        </div>
    );
}
