const SERVER_URL = "http://localhost:5000";

export function getImageUrl(imagePath) {
  if (!imagePath) {
    return null;
  }

  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  if (imagePath.startsWith("/")) {
    return `${SERVER_URL}${imagePath}`;
  }

  return `${SERVER_URL}/${imagePath}`;
}