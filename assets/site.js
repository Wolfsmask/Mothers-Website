
(() => {
  const cfg = window.UNTAMED_CONFIG || {};

  // Mobile navigation.
  const menuButton = document.querySelector("[data-menu-button]");
  const navLinks = document.querySelector("[data-nav-links]");
  if (menuButton && navLinks) {
    menuButton.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
    navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    }));
  }

  // Smooth entrance reveals after layout stabilizes.
  const revealItems = [...document.querySelectorAll(".reveal")];
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        }
      }, { threshold: .06, rootMargin: "0px 0px -5% 0px" });
      revealItems.forEach(el => io.observe(el));
    } else {
      revealItems.forEach(el => el.classList.add("visible"));
    }
  }));

  // FAQ accordion.
  document.querySelectorAll(".faq-question").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(other => {
        if (other !== item) {
          other.classList.remove("open");
          other.querySelector(".faq-question")?.setAttribute("aria-expanded", "false");
        }
      });
      item.classList.toggle("open", !wasOpen);
      btn.setAttribute("aria-expanded", String(!wasOpen));
    });
  });

  // Current year.
  document.querySelectorAll("[data-year]").forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // Real contact information only.
  const emailNodes = document.querySelectorAll("[data-business-email]");
  const phoneNodes = document.querySelectorAll("[data-business-phone]");
  if (cfg.email) {
    emailNodes.forEach(el => {
      el.textContent = cfg.email;
      if (el.tagName === "A") el.href = `mailto:${cfg.email}`;
    });
  } else {
    emailNodes.forEach(el => el.closest("[data-optional-contact]")?.setAttribute("hidden",""));
  }
  if (cfg.phone) {
    phoneNodes.forEach(el => {
      el.textContent = cfg.phone;
      if (el.tagName === "A") el.href = `tel:${cfg.phone.replace(/[^+\d]/g,"")}`;
    });
  } else {
    phoneNodes.forEach(el => el.closest("[data-optional-contact]")?.setAttribute("hidden",""));
  }

  // Inquiry form only appears once a real email exists.
  const inquiryForm = document.querySelector("[data-inquiry-form]");
  if (inquiryForm) {
    if (!cfg.email) {
      inquiryForm.setAttribute("hidden","");
      document.querySelector("[data-contact-pending]")?.removeAttribute("hidden");
    } else {
      inquiryForm.addEventListener("submit", e => {
        e.preventDefault();
        const get = id => document.getElementById(id)?.value.trim() || "";
        const subject = `Event Inquiry - ${get("eventType") || "Event"} - ${get("name")}`;
        const body = [
          "Hello Untamed Entertainment!",
          "",
          "I'm interested in getting help with an event.",
          "",
          `NAME: ${get("name")}`,
          `EMAIL: ${get("email")}`,
          `EVENT TYPE: ${get("eventType") || "Not selected"}`,
          `EVENT DATE: ${get("eventDate") || "Not decided yet"}`,
          `LOCATION: ${get("location") || "Not decided yet"}`,
          `SERVICE: ${get("service") || "Not sure yet"}`,
          "",
          "EVENT DETAILS:",
          get("message") || "No additional details provided yet."
        ].join("\n");
        location.href = `mailto:${cfg.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      });
    }
  }

  // Social links: blank URLs never appear.
  const socialMap = {
    facebook: "Facebook",
    instagram: "Instagram",
    pinterest: "Pinterest",
    googleBusinessProfile: "Google"
  };
  document.querySelectorAll("[data-social]").forEach(el => {
    const key = el.dataset.social;
    const url = cfg[key];
    if (!url) {
      el.setAttribute("hidden","");
    } else {
      el.href = url;
      el.setAttribute("aria-label", socialMap[key] || key);
    }
  });

  // Google review CTA appears only when a real review link exists.
  document.querySelectorAll("[data-google-review]").forEach(el => {
    if (cfg.googleReviewUrl) {
      el.href = cfg.googleReviewUrl;
    } else {
      el.setAttribute("hidden","");
    }
  });

  // Real testimonials only.
  const testimonialSection = document.querySelector("[data-testimonials]");
  const testimonialGrid = document.querySelector("[data-testimonial-grid]");
  if (testimonialSection && testimonialGrid) {
    const items = Array.isArray(cfg.testimonials) ? cfg.testimonials.filter(t => t?.quote && t?.name) : [];
    if (!items.length) {
      testimonialSection.setAttribute("hidden","");
    } else {
      testimonialGrid.innerHTML = items.map(t => `
        <article class="testimonial-card card">
          <blockquote>“${escapeHtml(t.quote)}”</blockquote>
          <div class="testimonial-meta"><strong>${escapeHtml(t.name)}</strong>${t.context ? ` • ${escapeHtml(t.context)}` : ""}</div>
        </article>
      `).join("");
    }
  }

  // Real pricing only.
  const pricingSection = document.querySelector("[data-pricing]");
  const pricingGrid = document.querySelector("[data-pricing-grid]");
  if (pricingSection && pricingGrid) {
    const prices = Array.isArray(cfg.startingPrices) ? cfg.startingPrices.filter(p => p?.service && p?.price) : [];
    if (!prices.length) {
      pricingSection.setAttribute("hidden","");
    } else {
      pricingGrid.innerHTML = prices.map(p => `
        <article class="price-card card">
          <h3>${escapeHtml(p.service)}</h3>
          <div class="price">${escapeHtml(p.price)}</div>
          <p>${escapeHtml(p.note || "Starting price")}</p>
        </article>
      `).join("");
    }
  }

  // Real gallery only.
  const gallerySection = document.querySelector("[data-gallery]");
  const galleryGrid = document.querySelector("[data-gallery-grid]");
  if (gallerySection && galleryGrid) {
    const photos = Array.isArray(cfg.gallery) ? cfg.gallery.filter(p => p?.src && p?.alt) : [];
    if (!photos.length) {
      gallerySection.setAttribute("hidden","");
    } else {
      galleryGrid.innerHTML = photos.map(p => `
        <figure class="gallery-item">
          <img loading="lazy" decoding="async" src="${escapeAttr(p.src)}" alt="${escapeAttr(p.alt)}">
        </figure>
      `).join("");
    }
  }

  // Rental catalog. Categories and items come from site-config.js so the
  // inventory can be edited without touching HTML. An item with no photo
  // renders as a plain text entry rather than a broken image, so the page
  // stays presentable while photography is still being done.
  const catalogSection = document.querySelector("[data-rentals]");
  const catalogGrid = document.querySelector("[data-rentals-grid]");
  if (catalogSection && catalogGrid) {
    const groups = Array.isArray(cfg.rentals)
      ? cfg.rentals.filter(g => g && !g.hidden && g.category && Array.isArray(g.items))
      : [];

    if (!groups.length) {
      catalogSection.setAttribute("hidden", "");
    } else {
      catalogGrid.innerHTML = groups.map(group => {
        const items = group.items.filter(i => i && !i.hidden && i.name);
        if (!items.length) return "";

        const rows = items.map(item => {
          const photo = item.image
            ? `<img class="catalog-item__photo" loading="lazy" decoding="async"
                 src="assets/rentals/${escapeAttr(item.image)}.webp"
                 alt="${escapeAttr(item.name)}">`
            : "";
          const detail = item.detail
            ? `<span class="catalog-item__detail">${escapeHtml(item.detail)}</span>`
            : "";
          return `<li class="catalog-item">${photo}
                    <span class="catalog-item__name">${escapeHtml(item.name)}</span>
                    ${detail}
                  </li>`;
        }).join("");

        const blurb = group.blurb
          ? `<p class="catalog-card__blurb">${escapeHtml(group.blurb)}</p>`
          : "";

        return `<article class="catalog-card card reveal">
                  <h3>${escapeHtml(group.category)}</h3>
                  ${blurb}
                  <ul class="catalog-item-list">${rows}</ul>
                </article>`;
      }).join("");

      // Entries built after the observer was set up need registering too, or
      // they stay stuck at the reveal animation's starting opacity.
      catalogGrid.querySelectorAll(".reveal").forEach(el => el.classList.add("visible"));
    }
  }

  // Analytics loads only after a real Measurement ID is configured and the visitor opts in.
  if (cfg.gaMeasurementId) {
    const stored = readConsent();
    if (stored === "allow") loadAnalytics(cfg.gaMeasurementId);
    else if (stored !== "decline") showConsent();
  }

  // Safari private browsing, and any browser set to block site data, make
  // localStorage throw rather than return null. Unguarded that would raise an
  // uncaught error and stop the consent prompt appearing at all, so every read
  // and write goes through these.
  function readConsent() {
    try { return localStorage.getItem("untamed-analytics-consent"); }
    catch (e) { return null; }
  }
  function writeConsent(value) {
    try { localStorage.setItem("untamed-analytics-consent", value); }
    catch (e) { /* choice cannot be remembered; honour it for this visit */ }
  }

  function showConsent() {
    const bar = document.createElement("div");
    bar.className = "cookie-banner";
    bar.innerHTML = `
      <p>We use optional analytics to understand which pages are useful and improve the website. You can allow or decline analytics.</p>
      <div class="cookie-actions">
        <button class="cookie-decline" type="button">No thanks</button>
        <button class="cookie-allow" type="button">Allow analytics</button>
      </div>`;
    document.body.appendChild(bar);
    bar.querySelector(".cookie-allow").addEventListener("click", () => {
      writeConsent("allow");
      bar.remove();
      loadAnalytics(cfg.gaMeasurementId);
    });
    bar.querySelector(".cookie-decline").addEventListener("click", () => {
      writeConsent("decline");
      bar.remove();
    });
  }

  function loadAnalytics(id) {
    if (!id || document.querySelector(`script[data-ga="${id}"]`)) return;
    const script = document.createElement("script");
    script.async = true;
    script.dataset.ga = id;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", id, { anonymize_ip: true });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[c]));
  }
  function escapeAttr(value) { return escapeHtml(value); }
})();
