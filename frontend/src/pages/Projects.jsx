import { useEffect, useState } from "react";
import axios from "axios";
import ProjectCard from "../components/ProjectCard";
import "./Projects.css";

function Projects() {
  const [projects, setProjects] = useState([]);

  const [categories, setCategories] = useState([]);
  const [difficultyLevels, setDifficultyLevels] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [tags, setTags] = useState([]);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    difficulty: "",
    material: "",
    tag: "",
    rating: "",
    sort: "newest",
  });

  const [loading, setLoading] = useState(false);

  const fetchProjects = () => {
    setLoading(true);

    const params = {};

    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.difficulty) params.difficulty = filters.difficulty;
    if (filters.material) params.material = filters.material;
    if (filters.tag) params.tag = filters.tag;
    if (filters.rating) params.rating = filters.rating;
    if (filters.sort) params.sort = filters.sort;

    axios
      .get("http://localhost:5000/api/projects", { params })
      .then((response) => {
        setProjects(response.data);
      })
      .catch((error) => {
        console.error("Greška pri učitavanju projekata:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/categories")
      .then((response) => setCategories(response.data))
      .catch((error) => console.error("Greška pri učitavanju kategorija:", error));

    axios
      .get("http://localhost:5000/api/difficulty-levels")
      .then((response) => setDifficultyLevels(response.data))
      .catch((error) =>
        console.error("Greška pri učitavanju nivoa težine:", error)
      );

    axios
      .get("http://localhost:5000/api/materials")
      .then((response) => setMaterials(response.data))
      .catch((error) => console.error("Greška pri učitavanju materijala:", error));

    axios
      .get("http://localhost:5000/api/tags")
      .then((response) => setTags(response.data))
      .catch((error) => console.error("Greška pri učitavanju tagova:", error));
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [
    filters.category,
    filters.difficulty,
    filters.material,
    filters.tag,
    filters.rating,
    filters.sort,
  ]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFilters((previousFilters) => ({
      ...previousFilters,
      [name]: value,
    }));
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    fetchProjects();
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      difficulty: "",
      material: "",
      tag: "",
      rating: "",
      sort: "newest",
    });
  };

  return (
    <section className="projects-page">
      <div className="projects-hero">
        <span className="projects-badge">✣ Istraži inspiraciju</span>

        <h1>Projekti</h1>

        <p>
          Pronađi heklane projekte po kategoriji, materijalu, nivou težine,
          tagovima i ocjenama zajednice.
        </p>
      </div>

      <div className="projects-layout">
        <aside className="filters-panel">
          <div className="filters-header">
            <h2>Filteri</h2>

            <button type="button" onClick={clearFilters}>
              Očisti
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="search-form">
            <label htmlFor="search">Pretraga</label>

            <div className="search-row">
              <input
                id="search"
                type="text"
                name="search"
                placeholder="Naziv projekta..."
                value={filters.search}
                onChange={handleChange}
              />

              <button type="submit">Traži</button>
            </div>
          </form>

          <div className="filter-group">
            <label htmlFor="category">Kategorija</label>

            <select
              id="category"
              name="category"
              value={filters.category}
              onChange={handleChange}
            >
              <option value="">Sve kategorije</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="difficulty">Nivo težine</label>

            <select
              id="difficulty"
              name="difficulty"
              value={filters.difficulty}
              onChange={handleChange}
            >
              <option value="">Svi nivoi</option>

              {difficultyLevels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="material">Materijal</label>

            <select
              id="material"
              name="material"
              value={filters.material}
              onChange={handleChange}
            >
              <option value="">Svi materijali</option>

              {materials.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="tag">Tag</label>

            <select
              id="tag"
              name="tag"
              value={filters.tag}
              onChange={handleChange}
            >
              <option value="">Svi tagovi</option>

              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="rating">Ocjena</label>

            <select
              id="rating"
              name="rating"
              value={filters.rating}
              onChange={handleChange}
            >
              <option value="">Sve ocjene</option>
              <option value="5">5 zvjezdica</option>
              <option value="4">4+ zvjezdice</option>
              <option value="3">3+ zvjezdice</option>
              <option value="2">2+ zvjezdice</option>
              <option value="1">1+ zvjezdica</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort">Sortiranje</label>

            <select
              id="sort"
              name="sort"
              value={filters.sort}
              onChange={handleChange}
            >
              <option value="newest">Najnoviji</option>
              <option value="rating">Najbolje ocijenjeni</option>
              <option value="popular">Najpopularniji</option>
            </select>
          </div>
        </aside>

        <div className="projects-content">
          <div className="projects-topbar">
            <div>
              <h2>Svi projekti</h2>
              <p>
                {loading
                  ? "Učitavanje projekata..."
                  : `${projects.length} pronađenih projekata`}
              </p>
            </div>
          </div>

          {projects.length > 0 ? (
            <div className="projects-grid projects-page-grid">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="empty-message">
              Nema projekata koji odgovaraju izabranim filterima.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Projects;