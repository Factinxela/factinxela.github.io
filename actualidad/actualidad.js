const articleLinks = [...document.querySelectorAll("[data-article-target]")];
const articlePanels = [...document.querySelectorAll("[data-article-panel]")];
const articleList = document.querySelector(".news-list");

// La publicación más reciente queda arriba aunque en el HTML se añadan
// artículos nuevos al final de la lista.
articleLinks.sort((first, second) => {
  const firstDate = first.querySelector("time")?.dateTime || "";
  const secondDate = second.querySelector("time")?.dateTime || "";
  return secondDate.localeCompare(firstDate);
});
articleLinks.forEach((link) => articleList?.appendChild(link));

const articleCount = document.querySelector(".news-count");
if (articleCount) articleCount.textContent = String(articleLinks.length).padStart(2, "0");

const selectArticle = (id, { updateUrl = true, scrollOnMobile = false } = {}) => {
  const panel = articlePanels.find((item) => item.dataset.articlePanel === id);
  const link = articleLinks.find((item) => item.dataset.articleTarget === id);
  if (!panel || !link) return;

  articlePanels.forEach((item) => item.classList.toggle("is-active", item === panel));
  articleLinks.forEach((item) => {
    const active = item === link;
    item.classList.toggle("is-active", active);
    if (active) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  });

  if (updateUrl && window.history?.replaceState) {
    window.history.replaceState({}, "", `#${id}`);
  }

  if (scrollOnMobile && window.matchMedia("(max-width: 900px)").matches) {
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

articleLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    selectArticle(link.dataset.articleTarget, { scrollOnMobile: true });
  });
});

const initialArticle = window.location.hash.slice(1);
const latestArticle = articleLinks[0]?.dataset.articleTarget || articlePanels[0]?.dataset.articlePanel;
selectArticle(
  articlePanels.some((panel) => panel.dataset.articlePanel === initialArticle)
    ? initialArticle
    : latestArticle,
  { updateUrl: false },
);
