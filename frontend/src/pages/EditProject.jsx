import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getCategories,
  getDifficultyLevels,
  getMaterials,
  getProjectById,
  getTags,
  updateProject,
} from "../api";
import "./AddProject.css";

function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();

  const savedUser = localStorage.getItem("user");

  let currentUser = null;

  try {
    currentUser = savedUser ? JSON.parse(savedUser) : null;
  } catch {
    currentUser = null;
  }

  const [categories, setCategories] = useState([]);
  const [difficultyLevels, setDifficultyLevels] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [tags, setTags] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    estimated_time: "",
    pattern_text: "",
    category_id: "",
    difficulty_id: "",
    material_ids: [],
    tag_ids: [],
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/prijava-potrebna");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setMessage("");

        const [
          projectData,
          categoriesData,
          difficultyData,
          materialsData,
          tagsData,
        ] = await Promise.all([
          getProjectById(id),
          getCategories(),
          getDifficultyLevels(),
          getMaterials(),
          getTags(),
        ]);

        const currentUserId = Number(
          currentUser?.id ||
            currentUser?.user_id ||
            currentUser?.userId
        );

        const projectAuthorId = Number(projectData.author_id);

        const canEditProject =
          currentUser &&
          (currentUser.role === "admin" ||
            currentUserId === projectAuthorId);

        if (!canEditProject) {
          navigate("/projekti");
          return;
        }

        setCategories(categoriesData);
        setDifficultyLevels(difficultyData);
        setMaterials(materialsData);
        setTags(tagsData);

        setFormData({
          title: projectData.title || "",
          description: projectData.description || "",
          estimated_time: projectData.estimated_time || "",
          pattern_text: projectData.pattern_text || "",
          category_id: projectData.category_id
            ? String(projectData.category_id)
            : "",
          difficulty_id: projectData.difficulty_id
            ? String(projectData.difficulty_id)
            : "",
          material_ids: Array.isArray(projectData.materials)
            ? projectData.materials.map((material) =>
                Number(material.id)
              )
            : [],
          tag_ids: Array.isArray(projectData.tags)
            ? projectData.tags.map((tag) => Number(tag.id))
            : [],
        });
      } catch (error) {
        console.error(
          "Greška pri učitavanju projekta za uređivanje:",
          error
        );

        setMessage(
          error.response?.data?.message ||
            "Došlo je do greške pri učitavanju projekta."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (event, fieldName) => {
    const value = Number(event.target.value);
    const checked = event.target.checked;

    setFormData((previousData) => {
      if (checked) {
        return {
          ...previousData,
          [fieldName]: [
            ...previousData[fieldName],
            value,
          ],
        };
      }

      return {
        ...previousData,
        [fieldName]: previousData[fieldName].filter(
          (itemId) => itemId !== value
        ),
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/prijava-potrebna");
      return;
    }

    if (
      !formData.title ||
      !formData.description ||
      !formData.category_id ||
      !formData.difficulty_id ||
      !formData.pattern_text
    ) {
      setMessage(
        "Popuni naziv, opis, kategoriju, nivo težine i uputstvo."
      );
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const projectData = {
        title: formData.title,
        description: formData.description,
        estimated_time: formData.estimated_time,
        pattern_text: formData.pattern_text,
        category_id: Number(formData.category_id),
        difficulty_id: Number(formData.difficulty_id),
        material_ids: formData.material_ids,
        tag_ids: formData.tag_ids,
      };

      await updateProject(id, projectData);

      setMessage("Projekat je uspješno izmijenjen ✿");

      setTimeout(() => {
        navigate(`/projekti/${id}`);
      }, 800);
    } catch (error) {
      console.error("Greška pri izmjeni projekta:", error);

      setMessage(
        error.response?.data?.message ||
          "Došlo je do greške pri izmjeni projekta."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="add-project-page">
        <div className="details-message">
          Učitavanje projekta...
        </div>
      </section>
    );
  }

  return (
    <section className="add-project-page">
      <Link to={`/projekti/${id}`} className="back-link">
        ← Nazad na projekat
      </Link>

      <div className="add-project-header">
        <span>✎</span>

        <div>
          <p>Izmjena heklanog projekta</p>
          <h1>Uredi projekat</h1>
        </div>
      </div>

      <form
        className="add-project-form"
        onSubmit={handleSubmit}
      >
        <div className="form-grid">
          <label>
            Naziv projekta *
            <input
              type="text"
              name="title"
              placeholder="npr. Crochet Bunny"
              value={formData.title}
              onChange={handleInputChange}
            />
          </label>

          <label>
            Vrijeme izrade
            <input
              type="text"
              name="estimated_time"
              placeholder="npr. 2 hours"
              value={formData.estimated_time}
              onChange={handleInputChange}
            />
          </label>

          <label>
            Kategorija *
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
            >
              <option value="">
                Izaberi kategoriju
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Nivo težine *
            <select
              name="difficulty_id"
              value={formData.difficulty_id}
              onChange={handleInputChange}
            >
              <option value="">Izaberi nivo</option>

              {difficultyLevels.map((level) => (
                <option
                  key={level.id}
                  value={level.id}
                >
                  {level.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Opis projekta *
          <textarea
            name="description"
            placeholder="Kratko opiši projekat..."
            value={formData.description}
            onChange={handleInputChange}
          ></textarea>
        </label>

        <label>
          Pattern / uputstvo *
          <textarea
            name="pattern_text"
            placeholder="Unesi uputstvo, redove, napomene..."
            value={formData.pattern_text}
            onChange={handleInputChange}
          ></textarea>
        </label>

        <div className="checkbox-section">
          <h2>Materijali</h2>

          <div className="checkbox-list">
            {materials.map((material) => (
              <label
                key={material.id}
                className="checkbox-pill"
              >
                <input
                  type="checkbox"
                  value={material.id}
                  checked={formData.material_ids.includes(
                    Number(material.id)
                  )}
                  onChange={(event) =>
                    handleCheckboxChange(
                      event,
                      "material_ids"
                    )
                  }
                />

                <span>{material.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="checkbox-section">
          <h2>Tagovi</h2>

          <div className="checkbox-list">
            {tags.map((tag) => (
              <label
                key={tag.id}
                className="checkbox-pill"
              >
                <input
                  type="checkbox"
                  value={tag.id}
                  checked={formData.tag_ids.includes(
                    Number(tag.id)
                  )}
                  onChange={(event) =>
                    handleCheckboxChange(event, "tag_ids")
                  }
                />

                <span>{tag.name}</span>
              </label>
            ))}
          </div>
        </div>

        {message && (
          <p className="add-project-message">
            {message}
          </p>
        )}

        <div className="add-project-actions">
          <button
            type="button"
            onClick={() =>
              navigate(`/projekti/${id}`)
            }
          >
            Odustani
          </button>

          <button
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "Čuva se..."
              : "Sačuvaj izmjene ✿"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default EditProject;