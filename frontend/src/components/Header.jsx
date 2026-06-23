import { Link } from "react-router-dom";
import "./Header.css";

function HomeIcon() {
  return (
    <svg
      className="home-logo-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

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

function BookmarkIcon() {
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
      <path d="M6 4h12a1 1 0 0 1 1 1v16l-7-4-7 4V5a1 1 0 0 1 1-1z" />
    </svg>
  );
}

function ShieldIcon() {
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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
      <Link to="/" className="logo" aria-label="Početna">
        <span className="logo-circle">
          <HomeIcon />
        </span>
        <span>Kloopko</span>
      </Link>

      <div className="header-actions">
        <Link to="/projekti" className="icon-link" aria-label="Pretraga">
          <SearchIcon />
        </Link>

        <Link to="/favoriti" className="icon-link" aria-label="Favoriti">
          <HeartIcon />
        </Link>

        <Link
          to="/moja-kolekcija"
          className="icon-link"
          aria-label="Moja kolekcija"
        >
          <BookmarkIcon />
        </Link>

        <Link to="/admin" className="icon-link" aria-label="Admin panel">
          <ShieldIcon />
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