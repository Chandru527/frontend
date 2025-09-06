import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function JobList() {
    const [jobs, setJobs] = useState([]);
    const [q, setQ] = useState("");
    const [sort, setSort] = useState("latest"); // Added sort state

    useEffect(() => {
        (async () => {
            try {
                const { data } = await axiosClient.get("/job-listings/getall");
                setJobs(data);
            } catch (err) {
                console.error("Error fetching jobs:", err);
            }
        })();
    }, []);

    // Extended filter to search by title, location, and company name
    const filtered = q
        ? jobs.filter(
            (j) =>
                j.title.toLowerCase().includes(q.toLowerCase()) ||
                j.location?.toLowerCase().includes(q.toLowerCase()) ||
                j.companyName?.toLowerCase().includes(q.toLowerCase())
        )
        : jobs;

    // Sort filtered jobs by postedDate
    const sortedJobs = [...filtered].sort((a, b) => {
        const dateA = new Date(a.postedDate);
        const dateB = new Date(b.postedDate);
        if (sort === "latest") {
            return dateB - dateA; // Newest first
        } else {
            return dateA - dateB; // Oldest first
        }
    });

    return (
        <>
            <div className="d-flex gap-2 mb-3 align-items-center">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="form-control"
                    placeholder="Search by title, location or company..."
                />
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="form-select w-auto"
                >
                    <option value="latest">Latest Uploads</option>
                    <option value="oldest">Oldest Uploads</option>
                </select>
            </div>
            <div className="row g-3">
                {sortedJobs.map((j) => (
                    <div className="col-md-6" key={j.jobListingId}>
                        <div className="card h-100">
                            <div className="card-body">
                                <h5>{j.title}</h5>
                                <p className="mb-1">{j.location}</p>
                                <p className="mb-1">
                                    <strong>Company:</strong> {j.companyName || "N/A"}
                                </p>
                                <p className="mb-1">
                                    <strong>Job Type:</strong> {j.jobType || "N/A"}
                                </p>
                                <p className="text-truncate">{j.description}</p>
                                <Link to={`/jobs/${j.jobListingId}`} className="btn btn-sm btn-primary">
                                    View
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
                {!sortedJobs.length && <p className="text-muted">No jobs found.</p>}
            </div>
        </>
    );
}
