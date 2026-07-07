import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import {
  getCategories,
  getDifficultyLevels,
  getMaterials,
  getProjects,
  getTags,
} from "../api";
import "./Projects.css";

function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [projects, setProjects] = useState([]);

  const [categories, setCategories] = useState([]);
  const [difficultyLevels, setDifficultyLevels] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [tags, setTags] = useState([]);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    difficulty: searchParams.get("difficulty") || "",
    material: searchParams.get("material") || "",
    tag: searchParams.get("tag") || "",
    rating: searchParams.get("rating") || "",
    sort: searchParams.get("sort") || "newest",
  });

  const [loading, setLoading] = useState(false);

  const updateUrlParams = (nextFilters) => {
    const params = {};

    if (nextFilters.search) {
      params.search = nextFilters.search;
    }

    if (nextFilters.category) {
      params.category = nextFilters.category;
    }

    if (nextFilters.difficulty) {
      params.difficulty = nextFilters.difficulty;
    }

    if (nextFilters.material) {
      params.material = nextFilters.material;
    }

    if (nextFilters.tag) {
      params.tag = nextFilters.tag;
    }

    if (nextFilters.rating) {
      params.rating = nextFilters.rating;
    }

    if (nextFilters.sort && nextFilters.sort !== "newest") {
      params.sort = nextFilters.sort;
    }

    setSearchParams(params);
  };

  const fetchProjects = async (currentFilters = filters) => {
    setLoading(true);

    const params = {};

    if (currentFilters.search) {
      params.search = currentFilters.search;
    }

    if (currentFilters.category) {
      params.category = currentFilters.category;
    }

    if (currentFilters.difficulty) {
      params.difficulty = currentFilters.difficulty;
    }

    if (currentFilters.material) {
      params.material = currentFilters.material;
    }

    if (currentFilters.tag) {
      params.tag = currentFilters.tag;
    }

    if (currentFilters.rating) {
      params.rating = currentFilters.rating;
    }

    if (currentFilters.sort) {
      params.sort = currentFilters.sort;
    }

    try {
      const data = await getProjects(params);
      setProjects(data);
    } catch (error) {
      console.error("Greška pri učitavanju projekata:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Greška pri učitavanju kategorija:", error);
      }

      try {
        const difficultyData = await getDifficultyLevels();
        setDifficultyLevels(difficultyData);
      } catch (error) {
        console.error("Greška pri učitavanju nivoa težine:", error);
      }

      try {
        const materialsData = await getMaterials();
        setMaterials(materialsData);
      } catch (error) {
        console.error("Greška pri učitavanju materijala:", error);
      }

      try {
        const tagsData = await getTags();
        setTags(tagsData);
      } catch (error) {
        console.error("Greška pri učitavanju tagova:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchProjects(filters);
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

    const nextFilters = {
      ...filters,
      [name]: value,
    };

    setFilters(nextFilters);

    if (name !== "search") {
      updateUrlParams(nextFilters);
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    updateUrlParams(filters);
    fetchProjects(filters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      search: "",
      category: "",
      difficulty: "",
      material: "",
      tag: "",
      rating: "",
      sort: "newest",
    };

    setFilters(emptyFilters);
    setSearchParams({});
    fetchProjects(emptyFilters);
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