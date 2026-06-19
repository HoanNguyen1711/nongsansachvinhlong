"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, Leaf, Globe, ChevronDown } from "lucide-react";
import { getLanguage, getTranslation, getLocalizedHref, getLanguageFromPathname, LanguageCode } from "@/lib/i18n";

interface NavbarProps {
  phone?: string;
  lang?: LanguageCode;
}

const formatPhone = (phoneStr: string) => {
  if (phoneStr.length === 10) {
    return `${phoneStr.slice(0, 4)} ${phoneStr.slice(4, 7)} ${phoneStr.slice(7)}`;
  }
  return phoneStr;
};

interface CategoryItem {
  category: string;
  category_en: string;
  category_zh: string;
}

export const Navbar: React.FC<NavbarProps> = ({ phone = "0901234567", lang: initialLang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<LanguageCode>(initialLang || "vi");
  const [langOpen, setLangOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [mobileStoriesOpen, setMobileStoriesOpen] = useState(false);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  
  useEffect(() => {
    const active = getLanguageFromPathname(pathname);
    setLang(active);
  }, [pathname]);

  // Fetch unique blog categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/blogs/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to fetch blog categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedOutsideDesktop = !desktopDropdownRef.current || !desktopDropdownRef.current.contains(target);
      const clickedOutsideMobile = !mobileDropdownRef.current || !mobileDropdownRef.current.contains(target);
      
      if (clickedOutsideDesktop && clickedOutsideMobile) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getLocalizedCategory = (cat: CategoryItem, currentLang: string) => {
    if (currentLang === "en") return cat.category_en || cat.category;
    if (currentLang === "zh") return cat.category_zh || cat.category;
    return cat.category;
  };

  const t = getTranslation(lang);
  
  const navItems = [
    { name: t.home, path: "/" },
    { name: t.products, path: "/products" },
    { name: t.story, path: "/stories" },
    { name: t.about, path: "/about-us" },
    { name: t.contact, path: "/contact" },
  ];

  const languages = [
    { code: "vi", label: "Tiếng Việt" },
    { code: "en", label: "English" },
    { code: "zh", label: "中文" },
  ];

  const handleLangChange = (code: string) => {
    // 1. Update cookie for next direct visit redirect
    const d = new Date();
    d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000);
    document.cookie = `lang=${code};path=/;expires=${d.toUTCString()}`;
    
    setLangOpen(false);
    
    // 2. Perform path switch
    const segments = pathname.split("/"); // e.g. ["", "en", "san-pham"]
    if (segments[1] === "vi" || segments[1] === "en" || segments[1] === "zh") {
      segments[1] = code;
    } else {
      segments.splice(1, 0, code);
    }
    const newPath = segments.join("/");
    window.location.href = newPath;
  };

  const activeLangLabel = languages.find(l => l.code === lang)?.label || "Tiếng Việt";

  const getStrippedPathname = (path: string) => {
    const segments = path.split("/");
    if (segments[1] === "vi" || segments[1] === "en" || segments[1] === "zh") {
      segments.splice(1, 1);
    }
    return segments.join("/") || "/";
  };

  const isActive = (path: string) => getStrippedPathname(pathname) === path;

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={getLocalizedHref("/", lang)} className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-emerald-600/20 bg-white shadow-sm transition-transform duration-300 group-hover:scale-105">
              <img src="/logo.jpg" alt="Vinh Long Viet Nam Logo" className="h-full w-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-sans text-sm font-black leading-tight text-emerald-800 dark:text-emerald-400 tracking-wider uppercase transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                {t.companyName}
              </span>
              <span className="text-[9px] font-bold leading-none text-foreground/50 tracking-widest uppercase mt-0.5">
                {lang === 'vi' ? 'NÔNG SẢN SẠCH XUẤT KHẨU' : lang === 'en' ? 'CLEAN AGRI EXPORT' : '清洁农产品出口'}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              if (item.path === "/stories") {
                return (
                  <div key={item.path} className="relative group py-2">
                    <button
                      className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary cursor-pointer focus:outline-none ${
                        isActive(item.path) ? "text-primary font-semibold border-b-2 border-primary pb-0.5" : "text-foreground/75"
                      }`}
                    >
                      <span>{item.name}</span>
                      <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
                    </button>
                    
                    {/* Hover Dropdown */}
                    <div className="absolute left-1/2 -translate-x-1/2 mt-1 hidden group-hover:block w-max min-w-[10rem] max-w-[15rem] rounded-2xl border border-border bg-background p-1.5 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 duration-150 z-50">
                      {categories.map((cat, idx) => {
                        const localizedName = getLocalizedCategory(cat, lang);
                        const href = `${getLocalizedHref("/stories", lang)}?category=${encodeURIComponent(cat.category)}`;
                        return (
                          <Link
                            key={idx}
                            href={href}
                            className="flex w-full items-center justify-center rounded-xl px-4 py-2 text-center text-xs font-medium text-foreground/75 hover:bg-accent hover:text-primary transition-colors"
                          >
                            {localizedName}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              return (
                <Link
                  key={item.path}
                  href={getLocalizedHref(item.path, lang)}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(item.path) ? "text-primary border-b-2 border-primary pb-1" : "text-foreground/75"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Switcher */}
            <div className="relative" ref={desktopDropdownRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 rounded-full border border-border bg-background/50 px-3 py-1.5 text-xs font-semibold text-foreground/80 hover:bg-accent transition-colors"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{activeLangLabel}</span>
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-2 w-36 rounded-2xl border border-border bg-background p-1 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => handleLangChange(l.code)}
                      className={`flex w-full items-center rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-accent ${
                        l.code === lang ? "bg-accent text-primary font-bold" : "text-foreground/80"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop CTA Button */}
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-105 active:scale-95"
            >
              <Phone className="h-4 w-4" />
              <span>{formatPhone(phone)}</span>
            </a>
          </div>

          {/* Mobile Menu & Language Toggle */}
          <div className="flex items-center gap-3 md:hidden">
            {/* Language Button Mobile */}
            <div className="relative" ref={mobileDropdownRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 rounded-full border border-border bg-background/50 p-2 text-xs font-semibold text-foreground/80 hover:bg-accent transition-colors"
                aria-label="Change Language"
              >
                <Globe className="h-4 w-4" />
                <span className="text-[10px] uppercase font-bold">{lang}</span>
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-2xl border border-border bg-background p-1 shadow-lg ring-1 ring-black/5 z-50">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => handleLangChange(l.code)}
                      className={`flex w-full items-center rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-accent ${
                        l.code === lang ? "bg-accent text-primary font-bold" : "text-foreground/80"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-lg p-2 text-foreground hover:bg-accent focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-4 space-y-3">
          {navItems.map((item) => {
            if (item.path === "/stories") {
              return (
                <div key={item.path} className="space-y-1">
                  <button
                    onClick={() => setMobileStoriesOpen(!mobileStoriesOpen)}
                    className={`flex w-full items-center justify-between rounded-lg px-4 py-2 text-base font-medium hover:bg-accent hover:text-primary ${
                      isActive(item.path) ? "bg-accent/50 text-primary font-semibold" : "text-foreground/75"
                    }`}
                  >
                    <span>{item.name}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${mobileStoriesOpen ? "rotate-180" : ""}`} />
                  </button>
                  
                  {mobileStoriesOpen && (
                    <div className="pl-4 border-l border-slate-100 ml-4 space-y-1">
                      {categories.map((cat, idx) => {
                        const localizedName = getLocalizedCategory(cat, lang);
                        const href = `${getLocalizedHref("/stories", lang)}?category=${encodeURIComponent(cat.category)}`;
                        return (
                          <Link
                            key={idx}
                            href={href}
                            onClick={() => setIsOpen(false)}
                            className="block rounded-lg px-4 py-1.5 text-sm font-medium text-foreground/60 hover:bg-accent hover:text-primary"
                          >
                            {localizedName}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={item.path}
                href={getLocalizedHref(item.path, lang)}
                onClick={() => setIsOpen(false)}
                className={`block rounded-lg px-4 py-2 text-base font-medium hover:bg-accent hover:text-primary ${
                  isActive(item.path) ? "bg-accent text-primary" : "text-foreground/75"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          <a
            href={`tel:${phone}`}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-center text-base font-semibold text-primary-foreground"
          >
            <Phone className="h-5 w-5" />
            <span>{formatPhone(phone)}</span>
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
