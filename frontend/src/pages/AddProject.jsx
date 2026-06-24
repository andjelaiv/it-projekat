import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AddProject.css";

function AddProject() {
    const navigate = useNavigate();

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

    const [coverImage, setCoverImage] = useState(null);
    const [processImages, setProcessImages] = useState([]);

    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        axios
            .get("http://localhost:5000/api/categories")
            .then((response) => setCategories(response.data))
            .catch((error) => console.error("Greška pri učitavanju kategorija:", error));

        axios
            .get("http://localhost:5000/api/difficulty-levels")
            .then((response) => setDifficultyLevels(response.data))
            .catch((error) => console.error("Greška pri učitavanju težina:", error));

        axios
            .get("http://localhost:5000/api/materials")
            .then((response) => setMaterials(response.data))
            .catch((error) => console.error("Greška pri učitavanju materijala:", error));

        axios
            .get("http://localhost:5000/api/tags")
            .then((response) => setTags(response.data))
            .catch((error) => console.error("Greška pri učitavanju tagova:", error));
    }, []);

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
                    [fieldName]: [...previousData[fieldName], value],
                };
            }

            return {
                ...previousData,
                [fieldName]: previousData[fieldName].filter((id) => id !== value),
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

        if (!formData.title || !formData.description || !formData.category_id || !formData.difficulty_id) {
            setMessage("Popuni naziv, opis, kategoriju i nivo težine.");
            return;
        }

        try {
            setSubmitting(true);
            setMessage("");

            const projectResponse = await axios.post(
                "http://localhost:5000/api/projects",
                {
                    title: formData.title,
                    description: formData.description,
                    estimated_time: formData.estimated_time,
                    pattern_text: formData.pattern_text,
                    category_id: Number(formData.category_id),
                    difficulty_id: Number(formData.difficulty_id),
                    material_ids: formData.material_ids,
                    tag_ids: formData.tag_ids,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const newProjectId =
                projectResponse.data.projectId ||
                projectResponse.data.id ||
                projectResponse.data.project_id ||
                projectResponse.data.insertId;

            if (!newProjectId) {
                throw new Error("Backend nije vratio ID novog projekta.");
            }

            if (coverImage) {
                const coverFormData = new FormData();
                coverFormData.append("cover", coverImage);

                await axios.post(
                    `http://localhost:5000/api/projects/${newProjectId}/cover`,
                    coverFormData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
            }

            if (processImages.length > 0) {
                const imagesFormData = new FormData();

                processImages.forEach((image) => {
                    imagesFormData.append("images", image);
                });

                imagesFormData.append("image_type", "progress");

                await axios.post(
                    `http://localhost:5000/api/projects/${newProjectId}/images`,
                    imagesFormData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
            }

            setMessage("Projekat je uspješno dodat ✿");

            setTimeout(() => {
                navigate(`/projekti/${newProjectId}`);
            }, 900);
        } catch (error) {
            console.error("Greška pri dodavanju projekta:", error);
            setMessage(
                error.response?.data?.message ||
                "Došlo je do greške pri dodavanju projekta."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="add-project-page">
            <div className="add-project-header">
                <span>🧶</span>

                <div>
                    <p>Novi heklani projekat</p>
                    <h1>Dodaj projekat</h1>
                </div>
            </div>

            <form className="add-project-form" onSubmit={handleSubmit}>
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
                            <option value="">Izaberi kategoriju</option>

                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
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
                                <option key={level.id} value={level.id}>
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
                    Pattern / uputstvo
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
                            <label key={material.id} className="checkbox-pill">
                                <input
                                    type="checkbox"
                                    value={material.id}
                                    checked={formData.material_ids.includes(material.id)}
                                    onChange={(event) =>
                                        handleCheckboxChange(event, "material_ids")
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
                            <label key={tag.id} className="checkbox-pill">
                                <input
                                    type="checkbox"
                                    value={tag.id}
                                    checked={formData.tag_ids.includes(tag.id)}
                                    onChange={(event) => handleCheckboxChange(event, "tag_ids")}
                                />
                                <span>{tag.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="upload-grid">
                    <label className="upload-box">
                        <span>Cover slika</span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => setCoverImage(event.target.files[0])}
                        />
                        <small>{coverImage ? coverImage.name : "Izaberi glavnu sliku"}</small>
                    </label>

                    <label className="upload-box">
                        <span>Process slike</span>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(event) =>
                                setProcessImages(Array.from(event.target.files).slice(0, 4))
                            }
                        />
                        <small>
                            {processImages.length > 0
                                ? `${processImages.length} slike izabrane`
                                : "Izaberi do 4 slike za galeriju"}
                        </small>
                    </label>
                </div>

                {message && <p className="add-project-message">{message}</p>}

                <div className="add-project-actions">
                    <button type="button" onClick={() => navigate("/projekti")}>
                        Odustani
                    </button>

                    <button type="submit" disabled={submitting}>
                        {submitting ? "Čuva se..." : "Sačuvaj projekat ✿"}
                    </button>
                </div>
            </form>
        </section>
    );
}

export default AddProject;