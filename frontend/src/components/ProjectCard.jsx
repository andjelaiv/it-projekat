import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  addFavorite,
  getMyFavorites,
  removeFavorite,
} from "../api";
import "./ProjectCard.css";
import { getImageUrl } from "../utils/imageUrl";

function formatRating(rating) {
  const value = Number(rating);

  if (!value) {
    return "Nema ocjena";
  }

  return value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
}

function ProjectCard({ project }) {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  const imageUrl = getImageUrl(project.cover_image);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsFavorite(false);
        return;
      }

      try {
        const favorites = await getMyFavorites();

        const alreadyFavorite = favorites.some(
          (favoriteProject) =>
            Number(favoriteProject.id) === Number(project.id)
        );

        setIsFavorite(alreadyFavorite);
      } catch (error) {
        console.error("Greška pri provjeri favorita:", error);
      }
    };

    checkFavoriteStatus();
  }, [project.id]);

  const handleFavoriteClick = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/prijava-potrebna");
      return;
    }

    if (isFavorite) {
      try {
        await removeFavorite(project.id);
        setIsFavorite(false);
      } catch (error) {
        console.error("Greška pri uklanjanju iz favorita:", error);
      }

      return;
    }

    try {
      await addFavorite(project.id);
      setIsFavorite(true);
    } catch (error) {
      const message = error.response?.data?.message || "";

      if (
        message.toLowerCase().includes("već") ||
        message.toLowerCase().includes("vec") ||
        message.toLowerCase().includes("already")
      ) {
        setIsFavorite(true);
        return;
      }

      console.error("Greška pri dodavanju u favorite:", error);
    }
  };

  return (
    <Link to={`/projekti/${project.id}`} className="project-card">
      <div className="project-image-wrapper">
        {project.is_featured === 1 && (
          <span className="featured-badge">★ Izdvojeno</span>
        )}

        <button
          type="button"
          className={`favorite-card-button ${isFavorite ? "active" : ""}`}
          onClick={handleFavoriteClick}
          aria-label={
            isFavorite ? "Ukloni iz favorita" : "Dodaj u favorite"
          }
          title={isFavorite ? "Ukloni iz favorita" : "Dodaj u favorite"}
        >
          {isFavorite ? "♥" : "♡"}
        </button>

        {imageUrl ? (
          <img
            className="project-image"
            src={imageUrl}
            alt={project.title}
          />
        ) : (
          <div className="project-image-placeholder">Nema slike</div>
        )}
      </div>

      <div className="project-card-content">
        <div className="project-meta">
          <span className="category-pill">{project.category}</span>
          <span>·</span>
          <span>{project.difficulty}</span>
        </div>

        <h3>{project.title}</h3>

        <p className="project-author">@{project.author}</p>

        <div className="project-rating">
          <span>★</span>
          <span>{formatRating(project.average_rating)}</span>

          {Number(project.review_count) > 0 && (
            <span className="review-count">
              ({project.review_count})
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default ProjectCard;