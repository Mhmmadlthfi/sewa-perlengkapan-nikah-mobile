import { BASE_STORAGE_URL } from "../../config";

export const getImageUrl = (path) => {
  if (!path) return null;
  return `${BASE_STORAGE_URL}/${path.replace(/^\/|\/$/g, "")}`;
};
