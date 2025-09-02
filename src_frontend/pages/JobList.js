import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function JobList() {
    const [jobs, setJobs] = useState([]);
    const [q, setQ] = useState("");

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

    const filtered = q
        ? jobs.filter(j =>
            j.title.toLowerCase().includes(q.toLowerCase()) ||
            j.location?.toLowerCase().includes(q.toLowerCase())
        )
        : jobs;

    return (
        <>
            <div className="d-flex gap-2 mb-3">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="form-control"
                    placeholder="Search by title, location..."
                />
            </div>
            <div className="row g-3">
                {filtered.map((j) => (
                    <div className="col-md-6" key={j.jobListingId}>
                        <div className="card h-100">
                            <div className="card-body">
                                <h5>{j.title}</h5>
                                <p className="mb-1">{j.location}</p>
                                <p className="text-truncate">{j.description}</p>
                                <Link to={`/jobs/${j.jobListingId}`} className="btn btn-sm btn-primary">
                                    View
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
                {!filtered.length && <p className="text-muted">No jobs found.</p>}
            </div>
        </>
    );
}
