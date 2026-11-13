"use client";

/**
 * Shared LocalStorage Helper for Saved / Favorite Places
 */
export function getFavoriteShopSlugs() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('ak_favorite_shops');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function toggleFavoriteShopSlug(slug) {
  if (typeof window === 'undefined' || !slug) return false;
  try {
    const current = getFavoriteShopSlugs();
    let next;
    let isFav = false;
    if (current.includes(slug)) {
      next = current.filter((s) => s !== slug);
      isFav = false;
    } else {
      next = [...current, slug];
      isFav = true;
    }
    localStorage.setItem('ak_favorite_shops', JSON.stringify(next));
    window.dispatchEvent(new Event('ak_favorites_updated'));
    return isFav;
  } catch (e) {
    return false;
  }
}

export function isShopFavorite(slug) {
  if (typeof window === 'undefined' || !slug) return false;
  const current = getFavoriteShopSlugs();
  return current.includes(slug);
}

