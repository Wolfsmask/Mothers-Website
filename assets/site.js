
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

  // An enquiry that arrives naming the item is the simplest possible record of
  // what people want: it lands in the inbox, needs no analytics account, and
  // can be searched later. The preview's button passes the name in the URL.
  const enquiryItem = (() => {
    try {
      const value = new URLSearchParams(window.location.search).get("item");
      return value ? value.slice(0, 120) : "";
    } catch (e) { return ""; }
  })();

  // Inquiry form only appears once a real email exists.
  const inquiryForm = document.querySelector("[data-inquiry-form]");
  if (inquiryForm) {
    if (!cfg.email) {
      inquiryForm.setAttribute("hidden","");
      document.querySelector("[data-contact-pending]")?.removeAttribute("hidden");
    } else {
      if (enquiryItem) {
        const message = document.getElementById("message");
        if (message && !message.value) {
          message.value = `I'm interested in: ${enquiryItem}\n\n`;
        }
        const note = inquiryForm.querySelector(".form-note");
        if (note) {
          note.textContent = `Asking about: ${enquiryItem}`;
          note.classList.add("form-note--item");
        }
        track("rental_enquiry_started", { item_name: enquiryItem });
      }

      inquiryForm.addEventListener("submit", e => {
        e.preventDefault();
        const get = id => document.getElementById(id)?.value.trim() || "";
        const subject = enquiryItem
          ? `Rental Inquiry - ${enquiryItem} - ${get("name")}`
          : `Event Inquiry - ${get("eventType") || "Event"} - ${get("name")}`;
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
          ...(enquiryItem ? [`RENTAL ITEM: ${enquiryItem}`] : []),
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

  // ---- Analytics helper -------------------------------------------------
  // Does nothing unless Analytics is both configured and allowed by the
  // visitor, so a visitor who declined is never recorded.
  function track(eventName, params) {
    if (typeof window.gtag !== "function") return;
    try { window.gtag("event", eventName, params || {}); } catch (e) { /* never break the page for a stat */ }
  }

  // Which navigation tabs get used. Page views and time on page are recorded
  // by Analytics itself; this adds which link people took to get there.
  document.querySelectorAll("[data-nav-links] a").forEach(link => {
    link.addEventListener("click", () => {
      track("nav_click", {
        link_text: (link.textContent || "").trim().slice(0, 80),
        link_url: link.getAttribute("href") || ""
      });
    });
  });

  // ---- Events dropdown ---------------------------------------------------
  document.querySelectorAll("[data-dropdown]").forEach(dropdown => {
    const toggle = dropdown.querySelector("[data-dropdown-toggle]");
    const menu = dropdown.querySelector("[data-dropdown-menu]");
    if (!toggle || !menu) return;

    const setOpen = open => {
      menu.setAttribute("data-open", String(open));
      toggle.setAttribute("aria-expanded", String(open));
    };
    setOpen(false);

    toggle.addEventListener("click", event => {
      event.stopPropagation();
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      setOpen(!isOpen);
      if (!isOpen) track("nav_click", { link_text: "Events (menu opened)", link_url: "" });
    });

    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setOpen(false)));

    document.addEventListener("click", event => {
      if (!dropdown.contains(event.target)) setOpen(false);
    });
    dropdown.addEventListener("keydown", event => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
  });

  // ---- Rental catalog ----------------------------------------------------
  // Categories and items come from site-config.js so the inventory can be
  // edited without touching HTML. An item with no photo renders as a plain
  // text entry rather than a broken image, so the page stays presentable
  // while photography is still being done. An item WITH photos renders as a
  // button that opens a larger preview.
  const catalogSection = document.querySelector("[data-rentals]");
  const catalogGrid = document.querySelector("[data-rentals-grid]");
  const previewable = [];

  function itemPhotos(item) {
    if (Array.isArray(item.images)) return item.images.filter(Boolean);
    if (item.image) return [item.image];
    return [];
  }

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
          const photos = itemPhotos(item);
          const detail = item.detail
            ? `<span class="catalog-item__detail">${escapeHtml(item.detail)}</span>`
            : "";

          if (!photos.length) {
            return `<li><span class="catalog-item">
                      <span class="catalog-item__name">${escapeHtml(item.name)}</span>
                      ${detail}
                    </span></li>`;
          }

          const index = previewable.length;
          previewable.push({
            name: item.name,
            detail: item.detail || "",
            category: group.category,
            photos: photos
          });

          return `<li><button type="button" class="catalog-item catalog-item--previewable"
                    data-preview="${index}"
                    aria-label="Preview ${escapeAttr(item.name)}">
                    <img class="catalog-item__photo" loading="lazy" decoding="async"
                         src="assets/rentals/${escapeAttr(photos[0])}@400.webp" alt="">
                    <span class="catalog-item__name">${escapeHtml(item.name)}</span>
                    ${detail}
                    <span class="catalog-item__zoom">Preview${photos.length > 1 ? " \u00B7 " + photos.length + " photos" : ""}</span>
                  </button></li>`;
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

      catalogGrid.querySelectorAll("[data-preview]").forEach(button => {
        button.addEventListener("click", () => {
          openPreview(Number(button.dataset.preview), button);
        });
      });
    }
  }

  // ---- Item preview ------------------------------------------------------
  let previewDialog = null;
  let previewReturnFocus = null;

  function buildPreviewDialog() {
    if (previewDialog) return previewDialog;
    previewDialog = document.createElement("dialog");
    previewDialog.className = "preview";
    previewDialog.setAttribute("aria-label", "Item preview");
    previewDialog.addEventListener("close", () => {
      if (previewReturnFocus && typeof previewReturnFocus.focus === "function") {
        previewReturnFocus.focus();
      }
    });
    // A click on the backdrop lands on the dialog element itself.
    previewDialog.addEventListener("click", event => {
      if (event.target === previewDialog) closePreview();
    });
    document.body.appendChild(previewDialog);
    return previewDialog;
  }

  function closePreview() {
    if (!previewDialog) return;
    if (typeof previewDialog.close === "function" && previewDialog.open) previewDialog.close();
    else previewDialog.removeAttribute("open");
  }

  function openPreview(index, sourceButton) {
    const item = previewable[index];
    if (!item) return;

    previewReturnFocus = sourceButton || document.activeElement;
    const dialog = buildPreviewDialog();
    let current = 0;

    const render = () => {
      const thumbs = item.photos.length > 1
        ? `<ul class="preview__thumbs">${item.photos.map((photo, i) => `
             <li><button type="button" class="preview__thumb" data-thumb="${i}"
                   aria-current="${i === current}"
                   aria-label="Photo ${i + 1} of ${item.photos.length}">
                   <img src="assets/rentals/${escapeAttr(photo)}@400.webp" alt=""></button></li>`).join("")}</ul>`
        : "";

      dialog.innerHTML = `
        <button type="button" class="preview__close" aria-label="Close preview">&times;</button>
        <div class="preview__media">
          <img src="assets/rentals/${escapeAttr(item.photos[current])}.webp"
               alt="${escapeAttr(item.name)}">
        </div>
        <div class="preview__body">
          <p class="preview__category">${escapeHtml(item.category)}</p>
          <h2>${escapeHtml(item.name)}</h2>
          ${item.detail ? `<p class="preview__detail">${escapeHtml(item.detail)}</p>` : ""}
          ${thumbs}
          <a class="button gold" href="index.html?item=${encodeURIComponent(item.name)}#contact">Ask about this item &rarr;</a>
        </div>`;

      dialog.querySelector(".preview__close").addEventListener("click", closePreview);
      dialog.querySelectorAll("[data-thumb]").forEach(thumb => {
        thumb.addEventListener("click", () => {
          current = Number(thumb.dataset.thumb);
          render();
        });
      });
    };

    render();

    // showModal gives focus trapping and Escape-to-close for free.
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    dialog.querySelector(".preview__close").focus();

    // Which items people actually open is the signal worth having: it says
    // what to stock more of, which page views alone cannot.
    track("rental_preview", {
      item_name: item.name,
      item_category: item.category
    });
  }

  // Cloudflare Web Analytics counts visitors and pages without cookies or any
  // stored identifier, so there is nothing to ask permission for and no
  // consent prompt appears. It is disclosed in the privacy policy regardless.
  if (cfg.cloudflareToken) {
    const beacon = document.createElement("script");
    beacon.defer = true;
    beacon.src = "https://static.cloudflareinsights.com/beacon.min.js";
    beacon.setAttribute("data-cf-beacon", JSON.stringify({ token: cfg.cloudflareToken }));
    document.head.appendChild(beacon);
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
