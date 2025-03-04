import type { FavoriteUrl } from "@/types/FavoriteUrlTypes";

const FAVORITES_KEY = "favorites";

// Get the list of favorites from localStorage
function getFavorites(): FavoriteUrl[] {
  const storedFavorites = localStorage.getItem(FAVORITES_KEY);
  return storedFavorites ? (JSON.parse(storedFavorites) as FavoriteUrl[]) : [];
}

// Add a URL to the favorites list
function addFavorite(name: string, url: string, records: number) {
  const favorites: FavoriteUrl[] = getFavorites();
  if (!favorites.find((fav) => fav.url === url)) {
    favorites.push({ name, url, records });
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
}

// Remove a URL from the favorites list
function removeFavorite(url: string) {
  let favorites = getFavorites();
  favorites = favorites.filter((fav: FavoriteUrl) => fav.url !== url);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

// Check if a URL is in the favorites list
function isFavorite(url: string) {
  const favorites = getFavorites();
  return favorites.find((fav) => fav.url === url) !== undefined;
}

// Toggle a URL between favorite and non-favorite
function toggleFavorite(name: string, url: string, records: number) {
  if (isFavorite(url)) {
    removeFavorite(url);
  } else {
    addFavorite(name, url, records);
  }
}

export default {
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  toggleFavorite,
};
