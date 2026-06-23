import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ProjectCard from "../components/ProjectCard";
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

function Home() {
  const [stats, setStats] = useState({
    projects_count: 0,
    users_count: 0,
    reviews_count: 0,
  });

  const [featuredProjects, setFeaturedProjects] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/stats/home")
      .then((response) => {
        setStats(response.data);
      })
      .catch((error) => {
        console.error("Greška pri učitavanju statistike:", error);
      });

    axios
      .get("http://localhost:5000/api/projects/featured")
      .then((response) => {
        setFeaturedProjects(response.data);
      })
      .catch((error) => {
        console.error("Greška pri učitavanju izdvojenih projekata:", error);
      });
  }, []);

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

          <Link to="/prijava" className="secondary-button">
            Postani član
          </Link>
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
          src="http://localhost:5000/uploads/1782128316453-bun.jfif"
          alt="Heklani projekat"
        />
      </div>

      <section className="home-section">
        <div className="section-heading">
          <div>
            <h2>Izdvojeni projekti</h2>
            <p>Birano od strane administratora.</p>
          </div>

          <Link to="/projekti" className="view-all-link">
            Pogledaj sve
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