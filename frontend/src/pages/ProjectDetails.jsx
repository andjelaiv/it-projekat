import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  const navigate = useNavigate();

  const savedUser = localStorage.getItem("user");
  let currentUser = null;

  try {
    currentUser = savedUser ? JSON.parse(savedUser) : null;
  } catch {
    currentUser = null;
  }

  const [project, setProject] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("pattern");
  const [loading, setLoading] = useState(true);

  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
  });

  const [hoverRating, setHoverRating] = useState(0);
  const [reviewMessage, setReviewMessage] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProject = () => {
    return axios
      .get(`http://localhost:5000/api/projects/${id}`)
      .then((response) => {
        setProject(response.data);
      })
      .catch((error) => {
        console.error("Greška pri učitavanju projekta:", error);
      });
  };

  const fetchReviews = () => {
    return axios
      .get(`http://localhost:5000/api/reviews/${id}`)
      .then((response) => {
        setReviews(response.data);
      })
      .catch((error) => {
        console.error("Greška pri učitavanju komentara:", error);
      });
  };

  useEffect(() => {
    setLoading(true);

    Promise.all([fetchProject(), fetchReviews()]).finally(() => {
      setLoading(false);
    });
  }, [id]);

  const handleReviewSubmit = (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/prijava-potrebna");
      return;
    }

    if (newReview.rating < 1) {
      setReviewMessage("Izaberi ocjenu prije slanja recenzije.");
      return;
    }

    setSubmittingReview(true);
    setReviewMessage("");

    axios
      .post(
        "http://localhost:5000/api/reviews",
        {
          project_id: Number(id),
          rating: newReview.rating,
          comment: newReview.comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        setNewReview({
          rating: 0,
          comment: "",
        });

        setHoverRating(0);
        setReviewMessage("Recenzija je uspješno poslata ✿");

        fetchReviews();
        fetchProject();
      })
      .catch((error) => {
        console.error("Greška pri slanju recenzije:", error);
        setReviewMessage(
          error.response?.data?.message ||
            "Došlo je do greške pri slanju recenzije."
        );
      })
      .finally(() => {
        setSubmittingReview(false);
      });
  };

  const handleDeleteReview = (reviewId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/prijava-potrebna");
      return;
    }

    const confirmDelete = window.confirm(
      "Da li sigurno želiš da obrišeš ovaj komentar?"
    );

    if (!confirmDelete) {
      return;
    }

    axios
      .delete(`http://localhost:5000/api/reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        setReviewMessage("Komentar je obrisan.");
        fetchReviews();
        fetchProject();
      })
      .catch((error) => {
        console.error("Greška pri brisanju komentara:", error);
        setReviewMessage(
          error.response?.data?.message ||
            "Došlo je do greške pri brisanju komentara."
        );
      });
  };

  const getReviewUsername = (review) => {
    return review.username || review.author || review.user_username || "korisnik";
  };

  const canDeleteReview = (review) => {
    if (!currentUser) {
      return false;
    }

    const reviewUserId = Number(
      review.user_id || review.userId || review.author_id || review.authorId
    );

    const currentUserId = Number(
      currentUser.id || currentUser.user_id || currentUser.userId
    );

    return currentUser.role === "admin" || reviewUserId === currentUserId;
  };

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
            <strong>{formatRating(displayRating)}</strong>
            <span>
              ({displayReviewCount}{" "}
              {displayReviewCount === 1 ? "recenzija" : "recenzije"})
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
            <button
              type="button"
              onClick={() =>
                currentUser ? navigate("/favoriti") : navigate("/prijava-potrebna")
              }
            >
              ♡ Dodaj u favorite
            </button>

            <button
              type="button"
              className="secondary-action"
              onClick={() =>
                currentUser
                  ? navigate("/moja-kolekcija")
                  : navigate("/prijava-potrebna")
              }
            >
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
            {project.pattern_text ||
              "Za ovaj projekat još nije dodato uputstvo."}
          </p>
        </div>
      ) : (
        <div className="details-tab-content">
          <h2>Komentari i ocjene</h2>

          <form className="review-form" onSubmit={handleReviewSubmit}>
            <span className="review-sticker-left">🧶</span>
            <span className="review-sticker-right">✿</span>

            <div className="review-form-heading">
              <span>♡</span>
              <div>
                <h3>Ostavi mali review</h3>
                <p>Podijeli koliko ti se svidio pattern ♡</p>
              </div>
            </div>

            <div className="rating-picker">
              <span className="rating-label">Ocjena</span>

              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    className={
                      star <= (hoverRating || newReview.rating) ? "active" : ""
                    }
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() =>
                      setNewReview((previousReview) => ({
                        ...previousReview,
                        rating: star,
                      }))
                    }
                    aria-label={`Ocjena ${star}`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <strong>{newReview.rating || 0}/5</strong>
            </div>

            <div className="review-textarea-wrapper">
              <textarea
                maxLength="500"
                placeholder="Kako ti je išao pattern? ✿"
                value={newReview.comment}
                onChange={(event) =>
                  setNewReview((previousReview) => ({
                    ...previousReview,
                    comment: event.target.value,
                  }))
                }
              ></textarea>

              <span>{newReview.comment.length}/500</span>
            </div>

            {reviewMessage && <p className="review-message">{reviewMessage}</p>}

            <div className="review-form-bottom">
              <div className="review-mini-icons">
                <span>♡</span>
                <span>✿</span>
                <span>🧶</span>
                <span>✦</span>
              </div>

              <button type="submit" disabled={submittingReview}>
                {submittingReview ? "Šalje se..." : "Pošalji ♡"}
              </button>
            </div>
          </form>

          {reviews.length > 0 ? (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <strong>@{getReviewUsername(review)}</strong>

                    <div className="review-actions">
                      <span>★ {review.rating}</span>

                      {canDeleteReview(review) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(review.id)}
                        >
                          Obriši
                        </button>
                      )}
                    </div>
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