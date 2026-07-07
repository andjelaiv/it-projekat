import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// POČETNA STRANICA

export async function getHomeStats() {
  const response = await api.get("/stats/home");
  return response.data;
}

export async function getFeaturedProjects() {
  const response = await api.get("/projects/featured");
  return response.data;
}

// PROJEKTI

export async function getProjects(params = {}) {
  const response = await api.get("/projects", {
    params,
  });

  return response.data;
}

export async function getProjectById(id) {
  const response = await api.get(`/projects/${id}`);
  return response.data;
}

export async function getProjectImages(id) {
  const response = await api.get(`/projects/${id}/images`);
  return response.data;
}

export async function getSimilarProjects(id) {
  const response = await api.get(`/projects/${id}/similar`);
  return response.data;
}

export async function createProject(projectData) {
  const response = await api.post("/projects", projectData);
  return response.data;
}

export async function updateProject(projectId, projectData) {
  const response = await api.put(`/projects/${projectId}`, projectData);
  return response.data;
}

export async function uploadProjectCover(projectId, coverImage) {
  const formData = new FormData();
  formData.append("cover", coverImage);

  const response = await api.post(
    `/projects/${projectId}/cover`,
    formData
  );

  return response.data;
}

export async function uploadProjectImages(
  projectId,
  images,
  imageType = "progress"
) {
  const formData = new FormData();

  images.forEach((image) => {
    formData.append("images", image);
  });

  formData.append("image_type", imageType);

  const response = await api.post(
    `/projects/${projectId}/images`,
    formData
  );

  return response.data;
}

export async function deleteProject(id) {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
}

// FILTERI

export async function getCategories() {
  const response = await api.get("/categories");
  return response.data;
}

export async function getDifficultyLevels() {
  const response = await api.get("/difficulty-levels");
  return response.data;
}

export async function getMaterials() {
  const response = await api.get("/materials");
  return response.data;
}

export async function getTags() {
  const response = await api.get("/tags");
  return response.data;
}

// RECENZIJE

export async function getProjectReviews(projectId) {
  const response = await api.get(`/reviews/${projectId}`);
  return response.data;
}

export async function createReview(projectId, rating, comment) {
  const response = await api.post("/reviews", {
    project_id: Number(projectId),
    rating,
    comment,
  });

  return response.data;
}

export async function deleteReview(reviewId) {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
}

// FAVORITI

export async function getMyFavorites() {
  const response = await api.get("/favorites/me");
  return response.data;
}

export async function addFavorite(projectId) {
  const response = await api.post("/favorites", {
    project_id: Number(projectId),
  });

  return response.data;
}

export async function removeFavorite(projectId) {
  const response = await api.delete(`/favorites/${projectId}`);
  return response.data;
}

// KOLEKCIJA

export async function getMyCollection() {
  const response = await api.get("/collection/me");
  return response.data;
}

export async function addToCollection(projectId, statusId) {
  const response = await api.post("/collection", {
    project_id: Number(projectId),
    status_id: statusId,
  });

  return response.data;
}

export async function updateCollectionStatus(projectId, statusId) {
  const response = await api.put(`/collection/${projectId}`, {
    status_id: statusId,
  });

  return response.data;
}

export async function removeFromCollection(projectId) {
  const response = await api.delete(`/collection/${projectId}`);
  return response.data;
}

// PROFIL KORISNIKA

export async function getUserById(userId) {
  const response = await api.get(`/users/${userId}`);
  return response.data;
}

export async function getUserProjects(userId) {
  const response = await api.get(`/users/${userId}/projects`);
  return response.data;
}

export async function getUserFavorites(userId) {
  const response = await api.get(`/users/${userId}/favorites`);
  return response.data;
}

export async function getUserCollection(userId) {
  const response = await api.get(`/users/${userId}/collection`);
  return response.data;
}
// AUTENTIFIKACIJA

export async function loginUser(loginData) {
  const response = await api.post("/auth/login", loginData);
  return response.data;
}

export async function registerUser(registerData) {
  const response = await api.post("/auth/register", registerData);
  return response.data;
}
// ADMIN PANEL

export async function getAdminStats() {
  const response = await api.get("/admin/stats");
  return response.data;
}

export async function getAdminUsers() {
  const response = await api.get("/admin/users");
  return response.data;
}

export async function updateProjectFeatured(projectId, isFeatured) {
  const response = await api.put(`/projects/${projectId}/featured`, {
    is_featured: isFeatured,
  });

  return response.data;
}

export async function updateUserRole(userId, roleId) {
  const response = await api.put(`/admin/users/${userId}/role`, {
    role_id: roleId,
  });

  return response.data;
}

export async function deleteUser(userId) {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
}
export default api;