import { useState } from "react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

export default function ResumeUpload() {
    const { user } = useAuth();
    const [file, setFile] = useState(null);

    const upload = async (e) => {
        e.preventDefault();
        if (!file) return alert("Select a file first");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("jobSeekerId", user?.id);

        try {
            await axiosClient.post("/resumes/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            alert("Resume uploaded!");
        } catch (err) {
            alert("Upload failed: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div>
            <h2>Upload Resume</h2>
            <form onSubmit={upload}>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} className="form-control mb-2" />
                <button className="btn btn-success">Upload</button>
            </form>
        </div>
    );
}
