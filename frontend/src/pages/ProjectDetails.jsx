import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ProjectCard from "../components/ProjectCard";
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
  const [isFavorite, setIsFavorite] = useState(false);
  const [collectionDropdownOpen, setCollectionDropdownOpen] = useState(false);
  const [collectionMessage, setCollectionMessage] = useState("");
  const [projectImages, setProjectImages] = useState([]);
  const [similarProjects, setSimilarProjects] = useState([]);
  const collectionOptions = [
    {
      id: 1,
      label: "Želim napraviti",
      emoji: "♡",
    },
    {
      id: 2,
      label: "U izradi",
      emoji: "🧶",
    },
    {
      id: 3,
      label: "Završeno",
      emoji: "✓",
    },
  ];

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

  const fetchProjectImages = () => {
    return axios
      .get(`http://localhost:5000/api/projects/${id}/images`)
      .then((response) => {
        setProjectImages(response.data);
      })
      .catch((error) => {
        console.error("Greška pri učitavanju galerije:", error);
      });
  };
  const fetchSimilarProjects = () => {
    return axios
      .get(`http://localhost:5000/api/projects/${id}/similar`)
      .then((response) => {
        setSimilarProjects(response.data);
      })
      .catch((error) => {
        console.error("Greška pri učitavanju sličnih projekata:", error);
      });
  };

  const checkIfFavorite = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsFavorite(false);
      return;
    }

    axios
      .get("http://localhost:5000/api/favorites/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const alreadyFavorite = response.data.some(
          (favoriteProject) => Number(favoriteProject.id) === Number(id)
        );

        setIsFavorite(alreadyFavorite);
      })
      .catch((error) => {
        console.error("Greška pri provjeri favorita:", error);
      });
  };

  useEffect(() => {
    setLoading(true);

    Promise.all([
      fetchProject(),
      fetchReviews(),
      fetchProjectImages(),
      fetchSimilarProjects(),
    ]).finally(() => {
      checkIfFavorite();
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
  const handleFavoriteToggle = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/prijava-potrebna");
      return;
    }

    if (isFavorite) {
      axios
        .delete(`http://localhost:5000/api/favorites/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => {
          setIsFavorite(false);
        })
        .catch((error) => {
          console.error("Greška pri uklanjanju iz favorita:", error);
        });
      return;
    }

    axios
      .post(
        "http://localhost:5000/api/favorites",
        {
          project_id: Number(id),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        setIsFavorite(true);
      })
      .catch((error) => {
        const message = error.response?.data?.message || "";

        if (
          message.toLowerCase().includes("već") ||
          message.toLowerCase().includes("already")
        ) {
          setIsFavorite(true);
          return;
        }

        console.error("Greška pri dodavanju u favorite:", error);
      });
  };

  const handleCollectionSelect = (statusId, statusLabel) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/prijava-potrebna");
      return;
    }

    setCollectionMessage("");

    axios
      .post(
        "http://localhost:5000/api/collection",
        {
          project_id: Number(id),
          status_id: statusId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        setCollectionDropdownOpen(false);
        setCollectionMessage(`Projekat je dodat u kolekciju: ${statusLabel}.`);
      })
      .catch((error) => {
        const message = error.response?.data?.message || "";

        if (
          message.toLowerCase().includes("već") ||
          message.toLowerCase().includes("vec") ||
          message.toLowerCase().includes("already") ||
          error.response?.status === 409
        ) {
          axios
            .put(
              `http://localhost:5000/api/collection/${id}`,
              {
                status_id: statusId,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            )
            .then(() => {
              setCollectionDropdownOpen(false);
              setCollectionMessage(
                `Status u kolekciji je promijenjen: ${statusLabel}.`
              );
            })
            .catch((updateError) => {
              console.error("Greška pri izmjeni statusa:", updateError);
              setCollectionMessage(
                "Došlo je do greške pri izmjeni statusa u kolekciji."
              );
            });

          return;
        }

        console.error("Greška pri dodavanju u kolekciju:", error);
        setCollectionMessage("Došlo je do greške pri dodavanju u kolekciju.");
      });
  };

  const handleDeleteProject = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/prijava-potrebna");
      return;
    }

    const confirmDelete = window.confirm(
      "Da li sigurno želiš da obrišeš ovaj projekat? Ova akcija se ne može poništiti."
    );

    if (!confirmDelete) {
      return;
    }

    axios
      .delete(`http://localhost:5000/api/projects/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        navigate("/projekti");
      })
      .catch((error) => {
        console.error("Greška pri brisanju projekta:", error);
        setCollectionMessage(
          error.response?.data?.message ||
          "Došlo je do greške pri brisanju projekta."
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

  const getGalleryImageUrl = (imagePath) => {
    if (!imagePath) {
      return null;
    }

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    return `http://localhost:5000${imagePath}`;
  };

  const getGalleryImageLabel = (imageType, index) => {
    if (imageType === "progress") {
      return `Proces ${index + 1}`;
    }

    if (imageType === "finished") {
      return "Gotovo";
    }

    if (imageType === "detail") {
      return "Detalj";
    }

    return `Slika ${index + 1}`;
  };

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

  const currentUserId = Number(
    currentUser?.id || currentUser?.user_id || currentUser?.userId
  );

  const projectAuthorId = Number(project.author_id);

  const canDeleteProject =
    currentUser &&
    (currentUser.role === "admin" || currentUserId === projectAuthorId);

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
              onClick={handleFavoriteToggle}
              className={isFavorite ? "favorite-details-active" : ""}
            >
              {isFavorite ? "♥ Projekat u favoritima" : "♡ Dodaj u favorite"}
            </button>

            <div className="collection-dropdown">
              <button
                type="button"
                className="secondary-action"
                onClick={() => {
                  if (!currentUser) {
                    navigate("/prijava-potrebna");
                    return;
                  }

                  setCollectionDropdownOpen(!collectionDropdownOpen);
                }}
              >
                Dodaj u kolekciju ▾
              </button>

              {collectionDropdownOpen && (
                <div className="collection-dropdown-menu">
                  {collectionOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleCollectionSelect(option.id, option.label)}
                    >
                      <span>{option.emoji}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {canDeleteProject && (
              <button
                type="button"
                className="edit-project-button"
                onClick={() => navigate(`/uredi-projekat/${id}`)}
              >
                Uredi projekat
              </button>
            )}

            {canDeleteProject && (
              <button
                type="button"
                className="delete-project-button"
                onClick={handleDeleteProject}
              >
                Obriši projekat
              </button>
            )}
          </div>
          {collectionMessage && (
            <p className="collection-message">{collectionMessage}</p>
          )}
        </div>
      </div>

      {projectImages.length > 0 && (
        <section className="project-process-gallery">
          <div className="process-gallery-heading">
            <span>✿</span>

            <div>
              <h2>Galerija izrade</h2>
              <p>Proces, detalji i finalni izgled projekta.</p>
            </div>
          </div>

          <div className="process-gallery-grid">
            {projectImages.slice(0, 4).map((image, index) => {
              const galleryImageUrl = getGalleryImageUrl(image.image_url);

              return (
                <div className="process-gallery-card" key={image.id || index}>
                  <img
                    src={galleryImageUrl}
                    alt={getGalleryImageLabel(image.image_type, index)}
                  />

                  <span>{getGalleryImageLabel(image.image_type, index)}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

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
            {similarProjects.length > 0 && (
        <section className="similar-projects-section">
          <div className="similar-projects-heading">
            <div>
              <p>Još malo inspiracije</p>
              <h2>Možda ti se svidi i...</h2>
            </div>

            <span>♡</span>
          </div>

          <div className="similar-projects-grid">
            {similarProjects.slice(0, 3).map((similarProject) => (
              <ProjectCard key={similarProject.id} project={similarProject} />
            ))}
          </div>
        </section>
      )}

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