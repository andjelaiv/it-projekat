import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import {
  getUserById,
  getUserCollection,
  getUserFavorites,
  getUserProjects,
} from "../api";
import "./Profile.css";

function Profile() {
  const { id } = useParams();

  const [profileUser, setProfileUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [collection, setCollection] = useState([]);

  const [activeTab, setActiveTab] = useState("projects");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setMessage("");

      try {
        const [
          userData,
          projectsData,
          favoritesData,
          collectionData,
        ] = await Promise.all([
          getUserById(id),
          getUserProjects(id),
          getUserFavorites(id),
          getUserCollection(id),
        ]);

        const projectsWithAuthor = projectsData.map((project) => ({
          ...project,
          author: project.author || userData.username,
          author_id: project.author_id || userData.id,
        }));

        setProfileUser(userData);
        setProjects(projectsWithAuthor);
        setFavorites(favoritesData);
        setCollection(collectionData);
      } catch (error) {
        console.error("Greška pri učitavanju profila:", error);

        setMessage(
          error.response?.data?.message ||
            "Došlo je do greške pri učitavanju profila."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const getCollectionStatusLabel = (statusName) => {
    if (statusName === "want_to_make") {
      return "Želi napraviti";
    }

    if (statusName === "in_progress") {
      return "U izradi";
    }

    if (statusName === "finished") {
      return "Završeno";
    }

    return statusName || "U kolekciji";
  };

  if (loading) {
    return (
      <section className="profile-page">
        <div className="profile-message">Učitavanje profila...</div>
      </section>
    );
  }

  if (message) {
    return (
      <section className="profile-page">
        <div className="profile-message">{message}</div>
      </section>
    );
  }

  if (!profileUser) {
    return (
      <section className="profile-page">
        <div className="profile-message">Korisnik nije pronađen.</div>
      </section>
    );
  }

  return (
    <section className="profile-page">
      <Link to="/projekti" className="back-link">
        ← Nazad na projekte
      </Link>

      <div className="profile-hero">
        <div className="profile-avatar">
          {profileUser.username?.charAt(0).toUpperCase() || "K"}
        </div>

        <div className="profile-info">
          <p>Kloopko član</p>
          <h1>@{profileUser.username}</h1>

          <div className="profile-stats">
            <div>
              <span>Objavljeni projekti</span>
              <strong>{projects.length}</strong>
            </div>

            <div>
              <span>Favoriti</span>
              <strong>{favorites.length}</strong>
            </div>

            <div>
              <span>Kolekcija</span>
              <strong>{collection.length}</strong>
            </div>

            <div>
              <span>Uloga</span>
              <strong>{profileUser.role || "user"}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          type="button"
          className={activeTab === "projects" ? "active" : ""}
          onClick={() => setActiveTab("projects")}
        >
          Objavljeni projekti
        </button>

        <button
          type="button"
          className={activeTab === "favorites" ? "active" : ""}
          onClick={() => setActiveTab("favorites")}
        >
          Favoriti
        </button>

        <button
          type="button"
          className={activeTab === "collection" ? "active" : ""}
          onClick={() => setActiveTab("collection")}
        >
          Kolekcija
        </button>
      </div>

      {activeTab === "projects" && (
        <>
          <div className="profile-projects-heading">
            <div>
              <p>Heklani kutak korisnika</p>
              <h2>Objavljeni projekti</h2>
            </div>

            <span>✿</span>
          </div>

          {projects.length > 0 ? (
            <div className="profile-projects-grid">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="profile-empty">
              <h2>Još nema objavljenih projekata</h2>
              <p>Ovaj korisnik još nije podijelio nijedan heklani projekat.</p>
            </div>
          )}
        </>
      )}

      {activeTab === "favorites" && (
        <>
          <div className="profile-projects-heading">
            <div>
              <p>Omiljeni projekti korisnika</p>
              <h2>Favoriti</h2>
            </div>

            <span>♡</span>
          </div>

          {favorites.length > 0 ? (
            <div className="profile-projects-grid">
              {favorites.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="profile-empty">
              <h2>Nema favorita</h2>
              <p>Ovaj korisnik još nije dodao projekte u favorite.</p>
            </div>
          )}
        </>
      )}

      {activeTab === "collection" && (
        <>
          <div className="profile-projects-heading">
            <div>
              <p>Lična heklana polica</p>
              <h2>Kolekcija</h2>
            </div>

            <span>🧶</span>
          </div>

          {collection.length > 0 ? (
            <div className="profile-projects-grid">
              {collection.map((project) => (
                <div key={project.id} className="profile-collection-item">
                  <ProjectCard project={project} />

                  <div className="profile-collection-status">
                    {getCollectionStatusLabel(project.status_name)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="profile-empty">
              <h2>Kolekcija je prazna</h2>
              <p>Ovaj korisnik još nije dodao projekte u kolekciju.</p>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default Profile;