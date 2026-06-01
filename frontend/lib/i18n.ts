import { translations } from "./translations";

export type LanguageCode = "vi" | "en" | "zh";

/**
 * Resolves the current language. Can be called on the server (passing cookies()) or client.
 */
export function getLanguage(cookieStore?: any): LanguageCode {
  // 1. Server-side check using passed cookie store
  if (cookieStore) {
    try {
      const val = cookieStore.get("lang")?.value;
      if (val === "en" || val === "zh" || val === "vi") {
        return val as LanguageCode;
      }
    } catch (e) {
      // Ignore if called in a context where cookies() is not fully resolved
    }
  }

  // 2. Client-side browser check
  if (typeof window !== "undefined") {
    const match = document.cookie.match(/(?:^|; )lang=([^;]*)/);
    const val = match ? match[1] : null;
    if (val === "en" || val === "zh" || val === "vi") {
      return val as LanguageCode;
    }
  }

  return "vi"; // Default language
}

/**
 * Returns static translations dictionary for specified language.
 */
export function getTranslation(lang: LanguageCode) {
  return translations[lang] || translations.vi;
}

/**
 * Helper to dynamically get a localized field value from a database object.
 * e.g., if obj is product, key is 'name', lang is 'en', returns product.name_en or product.name.
 */
export function getLocalizedValue(obj: any, key: string, lang: LanguageCode): any {
  if (!obj) return "";
  if (lang !== "vi") {
    const localizedKey = `${key}_${lang}`;
    if (obj[localizedKey] !== undefined && obj[localizedKey] !== null && obj[localizedKey] !== "") {
      return obj[localizedKey];
    }
  }
  return obj[key] || "";
}

/**
 * Localizes a category name by looking it up in a category list, or falling back to a static map.
 */
export function getLocalizedCategoryName(categoryName: string, lang: LanguageCode, categories?: any[]): string {
  if (!categoryName) return "";
  if (categories && Array.isArray(categories)) {
    const cat = categories.find(c => c.name === categoryName);
    if (cat) {
      return getLocalizedValue(cat, "name", lang);
    }
  }
  
  // Static fallback map for default categories
  const staticMap: Record<string, Record<string, string>> = {
    "Trái cây tươi": { vi: "Trái cây tươi", en: "Fresh fruits", zh: "新鲜水果" },
    "Hạt dinh dưỡng": { vi: "Hạt dinh dưỡng", en: "Nutritious seeds", zh: "营养坚果" },
    "Đồ uống": { vi: "Đồ uống", en: "Beverages", zh: "饮品" },
    "Rau củ & Gia vị": { vi: "Rau củ & Gia vị", en: "Vegetables & Spices", zh: "蔬菜与香料" },
    "Nông sản chế biến & Đông lạnh": { vi: "Nông sản chế biến & Đông lạnh", en: "Processed & Frozen Products", zh: "加工与冷冻农产品" }
  };
  
  const translations = staticMap[categoryName];
  if (translations) {
    return translations[lang] || categoryName;
  }
  return categoryName;
}

/**
 * Updates the language cookie and reloads the window on the client side.
 */
export function setClientLanguage(lang: LanguageCode) {
  if (typeof window !== "undefined") {
    // Cookie expires in 1 year
    const d = new Date();
    d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000);
    document.cookie = `lang=${lang};path=/;expires=${d.toUTCString()}`;
    window.location.reload();
  }
}

/**
 * Resolves language code from a given pathname.
 */
export function getLanguageFromPathname(pathname: string): LanguageCode {
  if (!pathname) return "vi";
  const segments = pathname.split("/");
  const first = segments[1];
  if (first === "en" || first === "zh" || first === "vi") {
    return first as LanguageCode;
  }
  return "vi";
}

/**
 * Prepends the current language locale prefix to a local href path.
 */
export function getLocalizedHref(path: string, lang: LanguageCode): string {
  if (!path) return "/";
  // Avoid localizing external, anchor, mail, phone links, or admin panel paths
  if (
    path.startsWith("http") ||
    path.startsWith("tel:") ||
    path.startsWith("mailto:") ||
    path.startsWith("#") ||
    path.startsWith("/ns-admin-portal-2026") ||
    path.startsWith("/ns-login-portal-2026")
  ) {
    return path;
  }
  
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  // Strip existing locale prefix to avoid duplication
  const segments = cleanPath.split("/");
  if (segments[1] === "vi" || segments[1] === "en" || segments[1] === "zh") {
    segments.splice(1, 1);
  }
  
  const strippedPath = segments.join("/");
  
  if (strippedPath === "/" || strippedPath === "") {
    return `/${lang}`;
  }
  
  return `/${lang}${strippedPath}`;
}
