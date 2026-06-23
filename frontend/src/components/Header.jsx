import { Link, NavLink } from "react-router-dom";
import "./Header.css";

function SearchIcon() {
  return (
    <svg
      className="header-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      className="header-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.8 4.6c-1.6-1.7-4.2-1.7-5.8 0L12 7.7 9 4.6c-1.6-1.7-4.2-1.7-5.8 0-1.7 1.8-1.7 4.6 0 6.3L12 20l8.8-9.1c1.7-1.7 1.7-4.5 0-6.3z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      className="login-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function Header() {
  return (
    <header className="site-header">
      <Link to="/" className="logo">
        <span className="logo-circle"></span>
        <span>Kloopko</span>
      </Link>

      <nav className="main-nav">
        <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
          Početna
        </NavLink>

        <NavLink
          to="/projekti"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Projekti
        </NavLink>

        <NavLink
          to="/moja-kolekcija"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Moja kolekcija
        </NavLink>

        <NavLink
          to="/admin"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Admin
        </NavLink>
      </nav>

      <div className="header-actions">
        <Link to="/projekti" className="icon-link" aria-label="Pretraga">
          <SearchIcon />
        </Link>

        <Link to="/favoriti" className="icon-link" aria-label="Favoriti">
          <HeartIcon />
        </Link>

        <Link to="/prijava" className="login-button">
          <UserIcon />
          Prijava
        </Link>
      </div>
    </header>
  );
}

export default Header;