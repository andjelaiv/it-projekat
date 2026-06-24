import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import ProjectCard from "../components/ProjectCard";
import "./Favorites.css";

function Favorites() {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchFavorites = () => {
    if (!token) {
      navigate("/prijava-potrebna");
      return;
    }

    setLoading(true);

    axios
      .get("http://localhost:5000/api/favorites/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setFavorites(response.data);
      })
      .catch((error) => {
        console.error("Greška pri učitavanju favorita:", error);
        setMessage("Došlo je do greške pri učitavanju favorita.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = (projectId) => {
    axios
      .delete(`http://localhost:5000/api/favorites/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        setMessage("Projekat je uklonjen iz favorita.");
        fetchFavorites();
      })
      .catch((error) => {
        console.error("Greška pri uklanjanju favorita:", error);
        setMessage("Došlo je do greške pri uklanjanju favorita.");
      });
  };

  if (loading) {
    return (
      <section className="favorites-page">
        <div className="favorites-message-card">Učitavanje favorita...</div>
      </section>
    );
  }

  return (
    <section className="favorites-page">
      <div className="favorites-hero">
        <span className="favorites-sticker">♡ omiljeno</span>

        <h1>Moji favoriti</h1>

        <p>
          Ovdje čuvaš projekte koji su ti zapali za oko, da ih kasnije lako
          pronađeš i napraviš.
        </p>
      </div>

      {message && <p className="favorites-message">{message}</p>}

      {favorites.length === 0 ? (
        <div className="favorites-empty">
          <div className="favorites-empty-icon">♡</div>

          <h2>Još nema favorita</h2>

          <p>
            Kad pronađeš projekat koji ti se sviđa, klikni na srce i pojaviće se
            ovdje.
          </p>

          <Link to="/projekti">Istraži projekte</Link>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map((project) => (
            <div key={project.id} className="favorite-item">
              <ProjectCard project={project} />

              <button
                type="button"
                className="remove-favorite-button"
                onClick={() => handleRemoveFavorite(project.id)}
              >
                Ukloni iz favorita
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Favorites;