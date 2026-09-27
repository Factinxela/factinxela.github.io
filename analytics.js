(() => {
  const measurementId = String(window.FACTINXELA_GA4_ID || "").trim();
  if (!measurementId) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);

  window.gtag("js", new Date());
  window.gtag("config", measurementId, { send_page_view: true });

  const sendEvent = (name, parameters = {}) => {
    window.gtag("event", name, parameters);
  };

  const path = window.location.pathname.replace(/index\.html$/, "").replace(/\/$/, "") || "/";
  if (path === "/demo") sendEvent("demo_view");
  if (path === "/precios") sendEvent("pricing_view");
  if (path === "/facturacion-psicologos") sendEvent("psychologists_landing_view");

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href") || "";
    const absoluteUrl = link.href || href;
    const linkPath = new URL(absoluteUrl, window.location.href).pathname.replace(/\/$/, "") || "/";

    if (linkPath === "/demo") sendEvent("demo_click", { link_url: absoluteUrl });
    if (href.startsWith("mailto:")) sendEvent("email_click", { link_url: href });
    if (absoluteUrl.includes("wa.me/")) sendEvent("whatsapp_click", { link_url: absoluteUrl });
    if (href.includes("#contacto") || linkPath === "/#contacto") {
      sendEvent("contact_click", { link_url: absoluteUrl });
    }
  });
})();
