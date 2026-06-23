import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import "./ProjectDetails.css";

function formatRating(rating) {
  const value = Number(rating);

  if (!value) {
    return "Nema ocjena";
  }

  return value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
}

function ProjectDetails() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("pattern");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/projects/${id}`)
      .then((response) => {
        setProject(response.data);
      })
      .catch((error) => {
        console.error("Greška pri učitavanju projekta:", error);
      })
      .finally(() => {
        setLoading(false);
      });

    axios
      .get(`http://localhost:5000/api/reviews/${id}`)
      .then((response) => {
        setReviews(response.data);
      })
      .catch((error) => {
        console.error("Greška pri učitavanju komentara:", error);
      });
  }, [id]);

  if (loading) {
    return (
      <section className="project-details-page">
        <div className="details-message">Učitavanje projekta...</div>
      </section>
    );
  }

  if (!project) {
    return (
      <section className="project-details-page">
        <div className="details-message">Projekat nije pronađen.</div>
      </section>
    );
  }

  const imageUrl = project.cover_image
    ? `http://localhost:5000${project.cover_image}`
    : null;

  const tags = project.tags || [];
  const materials = project.materials || [];

  const calculatedAverage =
  reviews.length > 0
    ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) /
      reviews.length
    : 0;

const displayRating =
  Number(project.average_rating) > 0
    ? Number(project.average_rating)
    : calculatedAverage;

const displayReviewCount =
  Number(project.review_count) > 0 ? Number(project.review_count) : reviews.length;

  return (
    <section className="project-details-page">
      <Link to="/projekti" className="back-link">
        ← Nazad na projekte
      </Link>

      <div className="project-details-layout">
        <div className="details-image-card">
          {project.is_featured === 1 && (
            <span className="details-featured-badge">★ Izdvojeno</span>
          )}

          {imageUrl ? (
            <img src={imageUrl} alt={project.title} />
          ) : (
            <div className="details-image-placeholder">Nema slike</div>
          )}
        </div>

        <div className="details-info-card">
          <div className="details-meta-row">
            <Link
              to={`/projekti?category=${project.category_id}`}
              className="details-pill"
            >
              {project.category}
            </Link>

            <Link
              to={`/projekti?difficulty=${project.difficulty_id}`}
              className="details-filter-link"
            >
              {project.difficulty}
            </Link>
          </div>

          <h1>{project.title}</h1>

          <p className="details-author">
            Autor:{" "}
            {project.author_id ? (
              <Link to={`/profil/${project.author_id}`}>@{project.author}</Link>
            ) : (
              <span>@{project.author}</span>
            )}
          </p>

          <div className="details-rating">
            <span>★</span>
            <strong>{formatRating(project.average_rating)}</strong>
            <span>
              ({project.review_count || reviews.length}{" "}
              {(project.review_count || reviews.length) === 1
                ? "recenzija"
                : "recenzije"}
              )
            </span>
          </div>

          <p className="details-description">{project.description}</p>

          <div className="details-small-info">
            <div>
              <span>Vrijeme izrade</span>
              <strong>{project.estimated_time || "Nije navedeno"}</strong>
            </div>

            <div>
              <span>Nivo težine</span>
              <strong>{project.difficulty}</strong>
            </div>
          </div>

          <div className="details-actions">
            <button type="button">♡ Dodaj u favorite</button>
            <button type="button" className="secondary-action">
              Dodaj u kolekciju
            </button>
          </div>
        </div>
      </div>

      <div className="details-section-grid">
        <div className="details-box">
          <h2>Materijali</h2>

          {materials.length > 0 ? (
            <div className="chip-list">
              {materials.map((material) => (
                <Link
                  key={material.id || material.name}
                  to={`/projekti?material=${material.id}`}
                >
                  {material.name}
                </Link>
              ))}
            </div>
          ) : (
            <p>Nema dodatih materijala.</p>
          )}
        </div>

        <div className="details-box">
          <h2>Tagovi</h2>

          {tags.length > 0 ? (
            <div className="chip-list">
              {tags.map((tag) => (
                <Link key={tag.id || tag.name} to={`/projekti?tag=${tag.id}`}>
                  {tag.name}
                </Link>
              ))}
            </div>
          ) : (
            <p>Nema dodatih tagova.</p>
          )}
        </div>
      </div>

      <div className="details-tabs">
        <button
          type="button"
          className={activeTab === "pattern" ? "active" : ""}
          onClick={() => setActiveTab("pattern")}
        >
          Pattern / Uputstvo
        </button>

        <button
          type="button"
          className={activeTab === "comments" ? "active" : ""}
          onClick={() => setActiveTab("comments")}
        >
          Komentari
        </button>
      </div>

      {activeTab === "pattern" ? (
        <div className="details-tab-content">
          <h2>Pattern / Uputstvo</h2>

          <p className="pattern-text">
            {project.pattern_text || "Za ovaj projekat još nije dodato uputstvo."}
          </p>
        </div>
      ) : (
        <div className="details-tab-content">
          <h2>Komentari i ocjene</h2>

          {reviews.length > 0 ? (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <strong>@{review.username}</strong>
                    <span>★ {review.rating}</span>
                  </div>

                  <p>{review.comment || "Korisnik nije ostavio komentar."}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>Još uvijek nema komentara za ovaj projekat.</p>
          )}
        </div>
      )}
    </section>
  );
}

export default ProjectDetails;