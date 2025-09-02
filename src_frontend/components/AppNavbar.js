import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AppNavbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-success">
            <div className="container-fluid">
                <NavLink className="navbar-brand" to="/">
                    CareerCrafter
                </NavLink>
                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/jobs">
                                Jobs
                            </NavLink>
                        </li>

                        {user?.roles?.includes("employer") && (
                            <>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/employer/dashboard">
                                        Employer Dashboard
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/employer/profile">
                                        My Profile
                                    </NavLink>
                                </li>
                            </>
                        )}

                        {user?.roles?.includes("job_seeker") && (
                            <>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/jobseeker/dashboard">
                                        JobSeeker Dashboard
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/profile">
                                        My Profile
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/jobseeker/applications">
                                        My Applications
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
                                        className="btn btn-outline-light btn-sm"
                                        onClick={logout}
                                    >
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/login">
                                        Login
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/register">
                                        Register
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
