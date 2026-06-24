import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import ProjectCard from "../components/ProjectCard";
import "./Collection.css";

const statusGroups = [
  {
    id: 1,
    key: "want_to_make",
    title: "Želim napraviti",
    emoji: "♡",
  },
  {
    id: 2,
    key: "in_progress",
    title: "U izradi",
    emoji: "🧶",
  },
  {
    id: 3,
    key: "finished",
    title: "Završeno",
    emoji: "✓",
  },
];

function normalizeStatus(item) {
  return (
    item.status ||
    item.status_name ||
    item.collection_status ||
    item.collection_status_name ||
    item.name ||
    "want_to_make"
  );
}

function Collection() {
  const navigate = useNavigate();

  const [collection, setCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [openStatusMenu, setOpenStatusMenu] = useState(null);

  const token = localStorage.getItem("token");

  const fetchCollection = () => {
    if (!token) {
      navigate("/prijava-potrebna");
      return;
    }

    setLoading(true);

    axios
      .get("http://localhost:5000/api/collection/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setCollection(response.data);
      })
      .catch((error) => {
        console.error("Greška pri učitavanju kolekcije:", error);
        setMessage("Došlo je do greške pri učitavanju kolekcije.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCollection();
  }, []);

  const handleRemoveFromCollection = (projectId) => {
    const confirmRemove = window.confirm(
      "Da li sigurno želiš da ukloniš ovaj projekat iz kolekcije?"
    );

    if (!confirmRemove) {
      return;
    }

    axios
      .delete(`http://localhost:5000/api/collection/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        setMessage("Projekat je uklonjen iz kolekcije.");
        fetchCollection();
      })
      .catch((error) => {
        console.error("Greška pri uklanjanju iz kolekcije:", error);
        setMessage("Došlo je do greške pri uklanjanju iz kolekcije.");
      });
  };

  const handleStatusChange = (projectId, statusId, statusTitle) => {
    axios
      .put(
        `http://localhost:5000/api/collection/${projectId}`,
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
        setOpenStatusMenu(null);
        setMessage(`Status je promijenjen u: ${statusTitle}.`);
        fetchCollection();
      })
      .catch((error) => {
        console.error("Greška pri promjeni statusa:", error);
        setMessage("Došlo je do greške pri promjeni statusa.");
      });
  };

  const getProjectsByStatus = (statusKey) => {
    return collection.filter((item) => normalizeStatus(item) === statusKey);
  };

  if (loading) {
    return (
      <section className="collection-page">
        <div className="collection-message-card">Učitavanje kolekcije...</div>
      </section>
    );
  }

  return (
    <section className="collection-page">
      <div className="collection-hero">
        <span className="collection-sticker">moja polica</span>

        <h1>Moja kolekcija</h1>

        <p>
          Ovdje pratiš šta želiš da napraviš, šta je trenutno u izradi i šta je
          već završeno.
        </p>
      </div>

      {message && <p className="collection-message-card">{message}</p>}

      {collection.length === 0 ? (
        <div className="collection-empty">
          <div className="collection-empty-icon">🧶</div>

          <h2>Kolekcija je još prazna</h2>

          <p>
            Kad pronađeš projekat koji želiš da pratiš, dodaj ga u kolekciju i
            izaberi status.
          </p>

          <Link to="/projekti">Istraži projekte</Link>
        </div>
      ) : (
        <div className="collection-sections">
          {statusGroups.map((group) => {
            const projects = getProjectsByStatus(group.key);

            return (
              <section key={group.key} className="collection-status-section">
                <div className="collection-status-heading">
                  <span>{group.emoji}</span>

                  <div>
                    <h2>{group.title}</h2>
                    <p>
                      {projects.length}{" "}
                      {projects.length === 1 ? "projekat" : "projekta"}
                    </p>
                  </div>
                </div>

                {projects.length === 0 ? (
                  <div className="collection-status-empty">
                    Nema projekata u ovoj grupi.
                  </div>
                ) : (
                  <div className="collection-grid">
                    {projects.map((project) => (
                      <div key={project.id} className="collection-item">
                        <ProjectCard project={project} />

                        <div className="collection-item-actions">
                          <div className="collection-status-dropdown">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenStatusMenu(
                                  openStatusMenu === project.id
                                    ? null
                                    : project.id
                                )
                              }
                            >
                              Promijeni status ▾
                            </button>

                            {openStatusMenu === project.id && (
                              <div className="collection-status-menu">
                                {statusGroups.map((status) => (
                                  <button
                                    key={status.id}
                                    type="button"
                                    onClick={() =>
                                      handleStatusChange(
                                        project.id,
                                        status.id,
                                        status.title
                                      )
                                    }
                                  >
                                    <span>{status.emoji}</span>
                                    {status.title}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            className="remove-collection-button"
                            onClick={() =>
                              handleRemoveFromCollection(project.id)
                            }
                          >
                            Ukloni iz kolekcije
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Collection;