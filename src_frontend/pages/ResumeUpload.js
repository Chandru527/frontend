import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

export default function ResumeUpload() {
    const { user } = useAuth();
    const [selectedFile, setSelectedFile] = useState(null);
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(true);
    const [jobSeekerId, setJobSeekerId] = useState(null);

    const uid = user?.userId || user?.id;

    useEffect(() => {
        if (!uid) return setLoading(false);

        axiosClient
            .get(`/job-seekers/by-user/${uid}`)
            .then(({ data }) => {
                setJobSeekerId(data.jobSeekerId || data.id);


                return axiosClient.get(`/resumes/by-user/${data.jobSeekerId || data.id}`);
            })
            .then(({ data }) => setResume(data))
            .catch((err) => {
                if (err.response?.status === 404) {
                    setResume(null);
                } else {
                    console.error("Error fetching resume or job seeker:", err);
                }
            })
            .finally(() => setLoading(false));
    }, [uid]);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0] || null);
    };

    const uploadResume = (e) => {
        e.preventDefault();
        if (!selectedFile) return alert("Select a file first");
        if (!jobSeekerId) return alert("Job Seeker ID is unavailable");

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("jobSeekerId", jobSeekerId);

        axiosClient
            .post("/resumes/upload", formData, { headers: { "Content-Type": "multipart/form-data" } })
            .then(({ data }) => {
                setResume(data);
                alert("Resume uploaded successfully");
                setSelectedFile(null);
            })
            .catch((err) => {
                alert(err.response?.data || "Upload failed");
            });
    };

    const downloadResume = async () => {
        if (!resume?.filePath) return;

        try {
            const response = await axiosClient.get(`/resumes/download?` +
                `path=${encodeURIComponent(resume.filePath)}`, {
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;


            const fileName = resume.filePath.split(/[\\/]/).pop();
            link.setAttribute("download", fileName);

            document.body.appendChild(link);
            link.click();


            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert("Failed to download resume.");
            console.error("Download error:", error);
        }
    };

    const deleteResume = () => {
        if (!resume?.resumeId) return;
        axiosClient
            .delete(`/resumes/delete/${resume.resumeId}`)
            .then(() => {
                setResume(null);
                alert("Resume deleted successfully");
            })
            .catch(() => alert("Failed to delete resume."));
    };

    if (loading) return <div>Loading...</div>;
    if (!uid) return <div>Please log in to manage your resume.</div>;

    return (
        <div className="container" style={{ maxWidth: "600px" }}>
            <h2>My Resume</h2>

            {resume ? (
                <div className="card mb-3">
                    <div className="card-body">
                        <p>
                            <strong>Uploaded On:</strong> {resume.uploadDate}
                        </p>
                        <button className="btn btn-outline-primary me-2" onClick={downloadResume}>
                            Download
                        </button>
                        <button className="btn btn-outline-danger" onClick={deleteResume}>
                            Delete
                        </button>
                    </div>
                </div>
            ) : (
                <div className="alert alert-info">No resume uploaded yet</div>
            )}

            <form onSubmit={uploadResume}>
                <div className="mb-3">
                    <label htmlFor="resumeFile" className="form-label">
                        Upload New Resume
                    </label>
                    <input
                        id="resumeFile"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="form-control"
                        onChange={handleFileChange}
                    />
                </div>
                <button className="btn btn-success" disabled={!selectedFile}>
                    {resume ? "Replace Resume" : "Upload Resume"}
                </button>
            </form>
        </div>
    );
}
