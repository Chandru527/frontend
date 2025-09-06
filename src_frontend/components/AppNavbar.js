import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaBriefcase, FaUserTie, FaClipboardList, FaUser, FaFileAlt, FaSignOutAlt, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import "../styles.css"; // make sure to add navbar styles here

export default function AppNavbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="navbar navbar-expand-lg navbar-dark custom-navbar">
            <div className="container-fluid">
                <NavLink className="navbar-brand fw-bold" to="/">
                    CareerCrafter
                </NavLink>
                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/jobs">
                                <FaBriefcase className="me-1" /> Jobs
                            </NavLink>
                        </li>

                        {user?.roles?.includes("employer") && (
                            <>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/employer/dashboard">
                                        <FaUserTie className="me-1" /> Employer Dashboard
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/employer/manage-jobs">
                                        <FaClipboardList className="me-1" /> Manage Jobs
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/employer/applications">
                                        <FaClipboardList className="me-1" /> Applications
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/employer/profile">
                                        <FaUser className="me-1" /> My Profile
                                    </NavLink>
                                </li>
                            </>
                        )}

                        {user?.roles?.includes("job_seeker") && (
                            <>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/profile">
                                        <FaUser className="me-1" /> My Profile
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/resume">
                                        <FaFileAlt className="me-1" /> My Resume
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/jobseeker/applications">
                                        <FaClipboardList className="me-1" /> My Applications
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/recommendations">
                                        <FaBriefcase className="me-1" /> Recommendations
                                    </NavLink>
                                </li>
                            </>
                        )}
                    </ul>

                    <ul className="navbar-nav ms-auto align-items-center">
                        {user ? (
                            <>
                                <li className="nav-item me-3">
                                    <span className="navbar-text text-light">
                                        Hi,&nbsp;<b>{user.name || user.username}</b>
                                    </span>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className="btn btn-light btn-sm logout-btn"
                                        onClick={logout}
                                    >
                                        <FaSignOutAlt className="me-1" /> Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/login">
                                        <FaSignInAlt className="me-1" /> Login
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/register">
                                        <FaUserPlus className="me-1" /> Register
                                    </NavLink>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}
