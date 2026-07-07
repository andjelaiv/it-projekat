import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import {
  getCategories,
  getFeaturedProjects,
  getHomeStats,
  getProjects,
} from "../api";
import { getImageUrl } from "../utils/imageUrl";
import "./Home.css";

function formatStatNumber(number) {
  const value = Number(number) || 0;

  if (value < 70) {
    return value.toString();
  }

  if (value < 100) {
    return "70+";
  }

  const rounded = Math.floor(value / 50) * 50;
  return `${rounded}+`;
}

function SearchIcon() {
  return (
    <svg
      className="home-search-icon"
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

function Home() {
  const navigate = useNavigate();

  const savedUser = localStorage.getItem("user");

  let currentUser = null;

  try {
    currentUser = savedUser ? JSON.parse(savedUser) : null;
  } catch {
    currentUser = null;
  }

  const [stats, setStats] = useState({
    projects_count: 0,
    users_count: 0,
    reviews_count: 0,
  });

  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    getHomeStats()
      .then((data) => {
        setStats(data);
      })
      .catch((error) => {
        console.error("Greška pri učitavanju statistike:", error);
      });

    getFeaturedProjects()
      .then((data) => {
        setFeaturedProjects(data);
      })
      .catch((error) => {
        console.error("Greška pri učitavanju izdvojenih projekata:", error);
      });

    getCategories()
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => {
        console.error("Greška pri učitavanju kategorija:", error);
      });
  }, []);

  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      getProjects({
        search: searchTerm,
      })
        .then((data) => {
          setSuggestions(data.slice(0, 5));
          setShowSuggestions(true);
        })
        .catch((error) => {
          console.error("Greška pri pretrazi projekata:", error);
        });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const trimmedSearch = searchTerm.trim();

    if (!trimmedSearch) {
      navigate("/projekti");
      return;
    }

    navigate(`/projekti?search=${encodeURIComponent(trimmedSearch)}`);
  };

  const handleSuggestionClick = (projectId) => {
    setSearchTerm("");
    setSuggestions([]);
    setShowSuggestions(false);
    navigate(`/projekti/${projectId}`);
  };

  return (
    <section className="home-page">
      <div className="hero">
        <div className="hero-badge">✣ Zajednica heklara</div>

        <h1 className="hero-title">
          Heklaj. <span>Dijeli.</span>
          <br />
          Inspiriši.
        </h1>

        <p className="hero-text">
          Kloopko je mjesto gdje pronalaziš patterns, čuvaš omiljene projekte i
          pratiš šta želiš sljedeće isheklati.
        </p>

        <div className="hero-actions">
          <Link to="/projekti" className="primary-button">
            Istraži projekte <span>→</span>
          </Link>

          {currentUser ? (
            <Link to="/dodaj-projekat" className="secondary-button">
              Dodaj projekat
            </Link>
          ) : (
            <Link to="/prijava" className="secondary-button">
              Postani član
            </Link>
          )}
        </div>

        <div className="hero-stats">
          <div>
            <strong>{formatStatNumber(stats.projects_count)}</strong>
            <span>patterns</span>
          </div>

          <div>
            <strong>{formatStatNumber(stats.users_count)}</strong>
            <span>heklara</span>
          </div>

          <div>
            <strong>{formatStatNumber(stats.reviews_count)}</strong>
            <span>recenzija</span>
          </div>
        </div>
      </div>

      <div className="hero-image-card">
        <img
          src={getImageUrl("/uploads/1782128316453-bun.jfif")}
          alt="Heklani projekat"
        />
      </div>

      <section className="home-search-section">
        <form className="home-search-bar" onSubmit={handleSearchSubmit}>
          <SearchIcon />

          <input
            type="text"
            placeholder="Pretraži po imenu projekta..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
          />

          <button type="submit">Napredna pretraga →</button>

          {showSuggestions && (
            <div className="search-suggestions">
              {suggestions.length > 0 ? (
                suggestions.map((project) => (
                  <button
                    type="button"
                    key={project.id}
                    className="suggestion-item"
                    onMouseDown={() => handleSuggestionClick(project.id)}
                  >
                    {project.cover_image ? (
                      <img
                        src={getImageUrl(project.cover_image)}
                        alt={project.title}
                      />
                    ) : (
                      <span className="suggestion-placeholder"></span>
                    )}

                    <span>
                      <strong>{project.title}</strong>

                      <small>
                        {project.category} · {project.difficulty}
                      </small>
                    </span>
                  </button>
                ))
              ) : (
                <p className="suggestion-empty">
                  Nema pronađenih projekata.
                </p>
              )}
            </div>
          )}
        </form>

        <div className="home-category-pills">
          {categories.slice(0, 5).map((category) => (
            <Link key={category.id} to={`/projekti?category=${category.id}`}>
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <div>
            <h2>Izdvojeni projekti</h2>
            <p>Birano od strane administratora.</p>
          </div>

          <Link to="/projekti" className="view-all-link">
            Svi projekti →
          </Link>
        </div>

        {featuredProjects.length > 0 ? (
          <div className="projects-grid">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="empty-message">
            Još uvijek nema izdvojenih projekata.
          </div>
        )}
      </section>
    </section>
  );
}

export default Home;