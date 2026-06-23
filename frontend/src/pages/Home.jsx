import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
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

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/stats/home")
      .then((response) => {
        setStats(response.data);
      })
      .catch((error) => {
        console.error("Greška pri učitavanju statistike:", error);
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
          src="http://localhost:5000/uploads/bun.jfif"
          alt="Heklani projekat"
        />
      </div>
    </section>
  );
}

export default Home;