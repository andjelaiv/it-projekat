import { Link } from "react-router-dom";
import "./ProjectCard.css";

function formatRating(rating) {
  const value = Number(rating);

  if (!value) {
    return "Nema ocjena";
  }

  return value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
}

function ProjectCard({ project }) {
  const imageUrl = project.cover_image
    ? `http://localhost:5000${project.cover_image}`
    : null;

  return (
    <Link to={`/projekti/${project.id}`} className="project-card">
      <div className="project-image-wrapper">
        {project.is_featured === 1 && (
          <span className="featured-badge">★ Izdvojeno</span>
        )}

        <button
          type="button"
          className="favorite-card-button"
          aria-label="Dodaj u favorite"
          onClick={(event) => {
            event.preventDefault();
          }}
        >
          ♡
        </button>

        {imageUrl ? (
          <img src={imageUrl} alt={project.title} className="project-image" />
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

        <p className="project-author">@{project.author || "autor"}</p>

        <div className="project-rating">
          <span>★</span>
          <span>{formatRating(project.average_rating)}</span>

          {project.review_count > 0 && (
            <span className="review-count">({project.review_count})</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default ProjectCard;