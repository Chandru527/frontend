import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

export default function JobSeekerDashboard() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [jobSeekerId, setJobSeekerId] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        (async () => {
            try {
                const { data } = await axiosClient.get("/job-listings/getall");
                setJobs(data);
            } catch (err) {
                console.error("Error fetching jobs:", err.response?.data || err.message);
            }
        })();
    }, []);


    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const jobSeekerIdValue = user.userId || user.id;

        (async () => {
            try {
                const { data } = await axiosClient.get(`/job-seekers/by-user/${jobSeekerIdValue}`);
                setJobSeekerId(data.jobSeekerId || data.id);
            } catch (err) {
                console.warn("No JobSeeker profile found:", err.response?.data || err.message);
                setJobSeekerId(null);
            } finally {
                setLoading(false);
            }
        })();
    }, [user]);


    const applyForJob = async (jobListingId) => {
        if (!jobSeekerId) {
            alert("Please complete your profile first!");
            return;
        }

        try {
            // 1. Fetch current resume for the job seeker
            const { data: resumeData } = await axiosClient.get(`/resumes/by-user/${jobSeekerId}`);
            const filePath = resumeData?.filePath;

            if (!filePath) {
                alert("Please upload your resume before applying.");
                return;
            }

            // 2. Create application with resume file path included
            const payload = {
                jobSeekerId,
                jobListingId,
                status: "pending",
                applicationDate: new Date().toISOString().slice(0, 10),
                filePath, // attach resume file path here
            };

            await axiosClient.post("/applications/apply", payload);
            alert("Application submitted successfully!");
        } catch (error) {
            if (error.response?.status === 404) {
                alert("Please upload your resume before applying.");
            } else {
                alert(error.response?.data?.message || "Failed to submit application.");
            }
        }
    };


    if (!user) return <div>Loading user info...</div>;
    if (loading) return <div>Loading dashboard...</div>;

    if (!jobSeekerId) {
        return (
            <div className="container mt-4">
                <h3>Job Seeker Dashboard</h3>
                <p>Your profile is not completed yet.</p>
                <a className="btn btn-primary" href="/profile">
                    Create Your Profile
                </a>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h3>Job Seeker Dashboard</h3>
            <ul className="list-group">
                {jobs.map((j) => (
                    <li
                        key={j.jobListingId}
                        className="list-group-item d-flex justify-content-between align-items-center"
                    >
                        <div>
                            <strong>{j.title}</strong> – {j.location} (${j.salary})
                        </div>
                        <button
                            className="btn btn-success btn-sm"
                            onClick={() => applyForJob(j.jobListingId)}
                        >
                            Apply
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
