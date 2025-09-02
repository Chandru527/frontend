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
            const payload = {
                jobSeekerId,
                jobListingId,
                status: "pending",
                applicationDate: new Date().toISOString().split("T")[0],
            };

            await axiosClient.post("/applications/apply", payload);
            alert("Application submitted successfully!");
        } catch (err) {
            console.error("Apply failed:", err.response?.data || err.message);
            alert(err.response?.data?.message || "Application failed");
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
