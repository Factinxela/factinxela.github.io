document.documentElement.classList.add("js");

const translations = window.FACTINXELA_TRANSLATIONS || {};
const supportedLanguages = new Set(["es", "gl", "ca", "en"]);
const languageSwitcher = document.querySelector("[data-language-switcher]");
const languageToggle = document.querySelector("[data-language-toggle]");
const languageMenu = document.querySelector("[data-language-menu]");
const currentLanguageLabel = document.querySelector("[data-current-language]");
const languageOptions = [...document.querySelectorAll("[data-language]")];
const languageUi = {
  es: { toggle: "Cambiar idioma", menu: "Seleccionar idioma" },
  gl: { toggle: "Cambiar idioma", menu: "Seleccionar idioma" },
  ca: { toggle: "Canviar l'idioma", menu: "Seleccionar idioma" },
  en: { toggle: "Change language", menu: "Select language" },
};

const textRecords = [];
const walker = document.createTreeWalker(
  document.documentElement,
  NodeFilter.SHOW_TEXT,
  {
    acceptNode: (node) => {
      const parent = node.parentElement;
      if (!parent || parent.closest("script, style, [data-language-switcher]")) {
        return NodeFilter.FILTER_REJECT;
      }
      return translations[node.nodeValue.trim()]
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    },
  },
);

while (walker.nextNode()) {
  const node = walker.currentNode;
  const source = node.nodeValue.trim();
  const leading = node.nodeValue.match(/^\s*/)?.[0] || "";
  const trailing = node.nodeValue.match(/\s*$/)?.[0] || "";
  textRecords.push({ node, source, leading, trailing });
}

const attributeRecords = [];
const translatedAttributes = ["alt", "aria-label", "title", "placeholder", "content"];
document.querySelectorAll(translatedAttributes.map((name) => `[${name}]`).join(","))
  .forEach((element) => {
    if (element.closest("[data-language-switcher]")) return;
    translatedAttributes.forEach((name) => {
      const source = element.getAttribute(name);
      if (source && translations[source]) {
        attributeRecords.push({ element, name, source });
      }
    });
  });

const closeLanguageMenu = () => {
  languageMenu?.classList.remove("open");
  languageToggle?.setAttribute("aria-expanded", "false");
};

const applyLanguage = (language, { updateUrl = true } = {}) => {
  const selected = supportedLanguages.has(language) ? language : "es";
  textRecords.forEach(({ node, source, leading, trailing }) => {
    node.nodeValue = `${leading}${selected === "es"
      ? source
      : translations[source]?.[selected] || source}${trailing}`;
  });
  attributeRecords.forEach(({ element, name, source }) => {
    element.setAttribute(
      name,
      selected === "es" ? source : translations[source]?.[selected] || source,
    );
  });
  document.documentElement.lang = selected;
  if (currentLanguageLabel) currentLanguageLabel.textContent = selected.toUpperCase();
  languageToggle?.setAttribute("aria-label", languageUi[selected].toggle);
  languageMenu?.setAttribute("aria-label", languageUi[selected].menu);
  languageOptions.forEach((option) => {
    const active = option.dataset.language === selected;
    option.setAttribute("aria-checked", String(active));
  });
  try {
    window.localStorage.setItem("factinxela-language", selected);
  } catch (_error) {
    // La traducción sigue funcionando aunque el navegador bloquee el almacenamiento.
  }
  if (updateUrl && window.history?.replaceState) {
    const url = new URL(window.location.href);
    if (selected === "es") url.searchParams.delete("lang");
    else url.searchParams.set("lang", selected);
    window.history.replaceState({}, "", url);
  }
  closeLanguageMenu();
};

let savedLanguage = "";
try {
  savedLanguage = window.localStorage.getItem("factinxela-language") || "";
} catch (_error) {
  savedLanguage = "";
}
const requestedLanguage = new URLSearchParams(window.location.search).get("lang") || "";
applyLanguage(
  supportedLanguages.has(requestedLanguage)
    ? requestedLanguage
    : supportedLanguages.has(savedLanguage)
      ? savedLanguage
      : "es",
  { updateUrl: false },
);

languageToggle?.addEventListener("click", () => {
  const opening = languageToggle.getAttribute("aria-expanded") !== "true";
  languageToggle.setAttribute("aria-expanded", String(opening));
  languageMenu?.classList.toggle("open", opening);
  if (opening) {
    languageMenu?.querySelector('[aria-checked="true"]')?.focus();
  }
});

languageOptions.forEach((option) => {
  option.addEventListener("click", () => applyLanguage(option.dataset.language));
});

document.addEventListener("click", (event) => {
  if (!languageSwitcher?.contains(event.target)) closeLanguageMenu();
});

const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");

const updateHeader = () => {
  header?.classList.toggle("scrolled", window.scrollY > 18);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const closeNavigation = () => {
  if (!nav || !navToggle) return;
  nav.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("nav-open");
};

navToggle?.addEventListener("click", () => {
  const opening = navToggle.getAttribute("aria-expanded") !== "true";
  nav?.classList.toggle("open", opening);
  navToggle.setAttribute("aria-expanded", String(opening));
  document.body.classList.toggle("nav-open", opening);
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeNavigation);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 900) closeNavigation();
});

// Recoloca los enlaces directos cuando terminan de cargar las capturas.
// Así, abrir index.html#banco o #rectificativas no queda desplazado si una
// imagen cambia de tamaño durante la carga inicial.
if (window.location.hash) {
  window.addEventListener("load", () => {
    const target = document.getElementById(window.location.hash.slice(1));
    if (!target) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const previousBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      target.scrollIntoView({ block: "start" });
      document.documentElement.style.scrollBehavior = previousBehavior;
      updateHeader();
    }));
  }, { once: true });
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealItems = document.querySelectorAll(".reveal");

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("visible"));
} else {
  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      activeObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -45px" });

  revealItems.forEach((item) => observer.observe(item));
}

const lightbox = document.querySelector("[data-lightbox-dialog]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");
const lightboxClose = document.querySelector("[data-lightbox-close]");

const closeLightbox = () => {
  if (!lightbox?.open) return;
  lightbox.close();
};

document.querySelectorAll("[data-lightbox]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    if (!lightbox || !lightboxImage || typeof lightbox.showModal !== "function") {
      window.open(trigger.dataset.lightbox, "_blank", "noopener");
      return;
    }

    const sourceImage = trigger.querySelector("img");
    const figureCaption = trigger.closest("figure")?.querySelector("figcaption");
    lightboxImage.src = trigger.dataset.lightbox;
    lightboxImage.alt = sourceImage?.alt || "Captura ampliada de Factinxela";
    lightboxCaption.textContent = figureCaption?.textContent.trim() || sourceImage?.alt || "";
    lightbox.showModal();
    document.body.classList.add("lightbox-open");
  });
});

lightboxClose?.addEventListener("click", closeLightbox);

lightbox?.addEventListener("click", (event) => {
  const bounds = lightbox.getBoundingClientRect();
  const outside = event.clientX < bounds.left || event.clientX > bounds.right
    || event.clientY < bounds.top || event.clientY > bounds.bottom;
  if (outside) closeLightbox();
});

lightbox?.addEventListener("close", () => {
  document.body.classList.remove("lightbox-open");
  if (lightboxImage) lightboxImage.src = "";
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeLanguageMenu();
  closeNavigation();
  closeLightbox();
});

const year = String(new Date().getFullYear());
document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = year;
});
