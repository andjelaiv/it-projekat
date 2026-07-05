import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Admin.css";

function Admin() {
  const navigate = useNavigate();

  const savedUser = localStorage.getItem("user");
  let currentUser = null;

  try {
    currentUser = savedUser ? JSON.parse(savedUser) : null;
  } catch {
    currentUser = null;
  }

  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState("projects");
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchAdminData = () => {
    setLoading(true);
    setMessage("");

    Promise.all([
      axios.get("http://localhost:5000/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      axios.get("http://localhost:5000/api/projects"),
      axios.get("http://localhost:5000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    ])
      .then(([statsResponse, projectsResponse, usersResponse]) => {
        setStats(statsResponse.data);
        setProjects(projectsResponse.data);
        setUsers(usersResponse.data);
      })
      .catch((error) => {
        console.error("Greška pri učitavanju admin panela:", error);

        setMessage(
          error.response?.data?.message ||
            "Došlo je do greške pri učitavanju admin panela."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!token || currentUser?.role !== "admin") {
      navigate("/prijava-potrebna");
      return;
    }

    fetchAdminData();
  }, []);

  const handleFeaturedToggle = (project) => {
    const newFeaturedValue = project.is_featured === 1 ? 0 : 1;

    axios
      .put(
        `http://localhost:5000/api/projects/${project.id}/featured`,
        {
          is_featured: newFeaturedValue,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        setProjects((previousProjects) =>
          previousProjects.map((item) =>
            item.id === project.id
              ? {
                  ...item,
                  is_featured: newFeaturedValue,
                }
              : item
          )
        );

        setMessage(
          newFeaturedValue === 1
            ? "Projekat je označen kao izdvojen."
            : "Projekat više nije izdvojen."
        );
      })
      .catch((error) => {
        console.error("Greška pri izmjeni featured statusa:", error);

        setMessage(
          error.response?.data?.message ||
            "Došlo je do greške pri izmjeni izdvojenog statusa."
        );
      });
  };

  const handleDeleteProject = (projectId) => {
    const confirmDelete = window.confirm(
      "Da li sigurno želiš da obrišeš ovaj projekat?"
    );

    if (!confirmDelete) {
      return;
    }

    axios
      .delete(`http://localhost:5000/api/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        setProjects((previousProjects) =>
          previousProjects.filter((project) => project.id !== projectId)
        );

        setMessage("Projekat je uspješno obrisan.");
      })
      .catch((error) => {
        console.error("Greška pri brisanju projekta:", error);

        setMessage(
          error.response?.data?.message ||
            "Došlo je do greške pri brisanju projekta."
        );
      });
  };

  const handleRoleChange = (user) => {
    const newRoleId = user.role === "admin" ? 2 : 1;
    const newRoleName = user.role === "admin" ? "user" : "admin";

    const confirmChange = window.confirm(
      `Da li želiš da korisniku @${user.username} promijeniš rolu u ${newRoleName}?`
    );

    if (!confirmChange) {
      return;
    }

    axios
      .put(
        `http://localhost:5000/api/admin/users/${user.id}/role`,
        {
          role_id: newRoleId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        setUsers((previousUsers) =>
          previousUsers.map((item) =>
            item.id === user.id
              ? {
                  ...item,
                  role: newRoleName,
                }
              : item
          )
        );

        setMessage(`Rola korisnika @${user.username} je promijenjena.`);
      })
      .catch((error) => {
        console.error("Greška pri promjeni role:", error);

        setMessage(
          error.response?.data?.message ||
            "Došlo je do greške pri promjeni role korisnika."
        );
      });
  };

  const handleDeleteUser = (user) => {
    const confirmDelete = window.confirm(
      `Da li sigurno želiš da obrišeš korisnika @${user.username}?`
    );

    if (!confirmDelete) {
      return;
    }

    axios
      .delete(`http://localhost:5000/api/admin/users/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        setUsers((previousUsers) =>
          previousUsers.filter((item) => item.id !== user.id)
        );

        setMessage(`Korisnik @${user.username} je obrisan.`);
      })
      .catch((error) => {
        console.error("Greška pri brisanju korisnika:", error);

        setMessage(
          error.response?.data?.message ||
            "Došlo je do greške pri brisanju korisnika."
        );
      });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return null;
    }

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    return `http://localhost:5000${imagePath}`;
  };

  if (loading) {
    return (
      <section className="admin-page">
        <div className="admin-message">Učitavanje admin panela...</div>
      </section>
    );
  }

  return (
    <section className="admin-page">
      <div className="admin-hero">
        <span>🛡️</span>

        <div>
          <p>Kloopko kontrolna tabla</p>
          <h1>Admin panel</h1>
        </div>
      </div>

      {message && <p className="admin-message">{message}</p>}

      {stats && (
        <div className="admin-stats-grid">
          <div>
            <span>Korisnici</span>
            <strong>{stats.users_count}</strong>
          </div>

          <div>
            <span>Projekti</span>
            <strong>{stats.projects_count}</strong>
          </div>

          <div>
            <span>Recenzije</span>
            <strong>{stats.reviews_count}</strong>
          </div>

          <div>
            <span>Favoriti</span>
            <strong>{stats.favorites_count}</strong>
          </div>
        </div>
      )}

      <div className="admin-tabs">
        <button
          type="button"
          className={activeTab === "projects" ? "active" : ""}
          onClick={() => setActiveTab("projects")}
        >
          Projekti
        </button>

        <button
          type="button"
          className={activeTab === "users" ? "active" : ""}
          onClick={() => setActiveTab("users")}
        >
          Korisnici
        </button>
      </div>

      {activeTab === "projects" && (
        <>
          <div className="admin-section-heading">
            <div>
              <p>Upravljanje sadržajem</p>
              <h2>Svi projekti</h2>
            </div>

            <Link to="/dodaj-projekat">+ Dodaj projekat</Link>
          </div>

          <div className="admin-projects-list">
            {projects.map((project) => {
              const imageUrl = getImageUrl(project.cover_image);

              return (
                <article className="admin-project-card" key={project.id}>
                  <div className="admin-project-image">
                    {imageUrl ? (
                      <img src={imageUrl} alt={project.title} />
                    ) : (
                      <span>Nema slike</span>
                    )}
                  </div>

                  <div className="admin-project-info">
                    <div className="admin-project-top">
                      <span>{project.category}</span>
                      <span>{project.difficulty}</span>

                      {project.is_featured === 1 && (
                        <strong>★ Izdvojeno</strong>
                      )}
                    </div>

                    <h3>{project.title}</h3>

                    <p>
                      Autor: <b>@{project.author}</b>
                    </p>

                    <p>
                      Ocjena:{" "}
                      <b>
                        {Number(project.average_rating) > 0
                          ? Number(project.average_rating).toFixed(1)
                          : "Nema ocjena"}
                      </b>{" "}
                      ({project.review_count} recenzije)
                    </p>
                  </div>

                  <div className="admin-project-actions">
                    <button
                      type="button"
                      onClick={() => handleFeaturedToggle(project)}
                    >
                      {project.is_featured === 1
                        ? "Skini izdvojeno"
                        : "Označi kao izdvojeno"}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(`/projekti/${project.id}`)}
                    >
                      Otvori
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(`/uredi-projekat/${project.id}`)}
                    >
                      Uredi
                    </button>

                    <button
                      type="button"
                      className="admin-delete-button"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      Obriši
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      {activeTab === "users" && (
        <>
          <div className="admin-section-heading">
            <div>
              <p>Upravljanje članovima</p>
              <h2>Svi korisnici</h2>
            </div>
          </div>

          <div className="admin-users-list">
            {users.map((user) => (
              <article className="admin-user-card" key={user.id}>
                <div className="admin-user-avatar">
                  {user.username?.charAt(0).toUpperCase() || "K"}
                </div>

                <div className="admin-user-info">
                  <h3>@{user.username}</h3>

                  <p>{user.email}</p>

                  <div className="admin-user-meta">
                    <span>{user.role}</span>
                    <span>
                      Registrovan:{" "}
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "Nije poznato"}
                    </span>
                  </div>
                </div>

                <div className="admin-user-actions">
                  <button type="button" onClick={() => handleRoleChange(user)}>
                    {user.role === "admin"
                      ? "Promijeni u user"
                      : "Promijeni u admin"}
                  </button>

                  <button
                    type="button"
                    className="admin-delete-button"
                    onClick={() => handleDeleteUser(user)}
                  >
                    Obriši korisnika
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default Admin;