/* Site behaviour. Plain JS, no dependencies, works from file:// or a server. */
(function () {
  "use strict";

  var SITE = window.SITE || {};
  var PRODUCTS = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];

  /* ---------- helpers ---------------------------------------------------- */

  // Always build DOM with textContent, never innerHTML, so a product name or
  // description containing < or & can never break the page or inject markup.
  function el(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text !== undefined && text !== null) n.textContent = String(text);
    return n;
  }

  function fillText(selector, value) {
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) {
      if (value) nodes[i].textContent = value;
    }
  }

  function formatPrice(price) {
    if (price === null || price === undefined || price === "") return null;
    var n = Number(price);
    if (!isFinite(n)) return null;
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: SITE.currency || "USD"
      }).format(n);
    } catch (e) {
      return "$" + n.toFixed(2);
    }
  }

  /* ---------- product images --------------------------------------------
     process_photos.py writes <base>.webp and <base>.jpg into images/products/.
     <picture> prefers webp; if neither file exists yet (content not added),
     onerror swaps in a labelled placeholder rather than a broken-image icon. */

  function productImage(product, altText) {
    if (!product.image) return placeholder();

    var base = "images/products/" + product.image;
    var picture = document.createElement("picture");

    var webp = document.createElement("source");
    webp.type = "image/webp";
    webp.srcset = base + ".webp";
    picture.appendChild(webp);

    var img = document.createElement("img");
    img.src = base + ".jpg";
    img.alt = altText;
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("error", function () {
      var ph = placeholder();
      if (picture.parentNode) picture.parentNode.replaceChild(ph, picture);
    });
    picture.appendChild(img);
    return picture;

    function placeholder() {
      var box = el("span", "card__media--empty");
      box.appendChild(el("span", null, "Photo coming soon"));
      return box;
    }
  }

  /* ---------- product grid ----------------------------------------------- */

  function renderProducts(mountId, limit) {
    var mount = document.getElementById(mountId);
    if (!mount) return;

    var items = PRODUCTS.slice(0, limit || PRODUCTS.length);

    if (items.length === 0) {
      var empty = el("div", "empty-state");
      empty.appendChild(el("p", null, "No items listed yet — check back soon."));
      mount.appendChild(empty);
      return;
    }

    var list = el("ul", "grid");

    items.forEach(function (p, index) {
      var li = el("li", "card");

      // Media is a real <button> so it is keyboard reachable and announced.
      var media = el("button", "card__media");
      media.type = "button";
      media.setAttribute("aria-label", "View details for " + (p.name || "item"));
      media.appendChild(productImage(p, p.name || "Product photo"));

      if (p.status === "sold") {
        media.appendChild(el("span", "badge badge--sold", "Sold"));
      } else if (p.status === "made-to-order") {
        media.appendChild(el("span", "badge", "Made to order"));
      }

      media.addEventListener("click", function () { openModal(index); });
      li.appendChild(media);

      var body = el("div", "card__body");
      body.appendChild(el("h3", "card__name", p.name || "Untitled"));
      if (p.blurb) body.appendChild(el("p", "card__blurb", p.blurb));

      var foot = el("div", "card__foot");
      var priceText = formatPrice(p.price);
      foot.appendChild(
        priceText
          ? el("span", "card__price", priceText)
          : el("span", "card__price--ask", "Enquire for price")
      );

      var more = el("button", "link-btn", "Details");
      more.type = "button";
      more.addEventListener("click", function () { openModal(index); });
      foot.appendChild(more);

      body.appendChild(foot);
      li.appendChild(body);
      list.appendChild(li);
    });

    mount.appendChild(list);
  }

  /* ---------- detail modal ------------------------------------------------ */

  var dialog = null;
  var lastFocused = null;

  function ensureDialog() {
    if (dialog) return dialog;

    dialog = document.createElement("dialog");
    dialog.className = "modal";
    dialog.setAttribute("aria-label", "Item details");

    dialog.addEventListener("close", function () {
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    });
    // Click on the backdrop (outside the content) closes.
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) closeModal();
    });

    document.body.appendChild(dialog);
    return dialog;
  }

  function closeModal() {
    if (!dialog) return;
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    else dialog.removeAttribute("open");
  }

  function openModal(index) {
    var p = PRODUCTS[index];
    if (!p) return;

    lastFocused = document.activeElement;
    var d = ensureDialog();

    while (d.firstChild) d.removeChild(d.firstChild);

    var close = el("button", "modal__close", "×");
    close.type = "button";
    close.setAttribute("aria-label", "Close");
    close.addEventListener("click", closeModal);
    d.appendChild(close);

    var grid = el("div", "modal__grid");

    var media = el("div", "modal__media");
    media.appendChild(productImage(p, p.name || "Product photo"));
    grid.appendChild(media);

    var body = el("div", "modal__body");
    body.appendChild(el("h2", null, p.name || "Untitled"));

    var priceText = formatPrice(p.price);
    body.appendChild(
      priceText
        ? el("p", "card__price", priceText)
        : el("p", "card__price--ask", "Enquire for price")
    );

    if (p.description) body.appendChild(el("p", null, p.description));

    if (Array.isArray(p.details) && p.details.length) {
      var ul = el("ul", "detail-list");
      p.details.forEach(function (d2) { ul.appendChild(el("li", null, d2)); });
      body.appendChild(ul);
    }

    if (p.status !== "sold") {
      var email = SITE.contact && SITE.contact.email;
      var enquire;
      if (email && email.indexOf("@") !== -1) {
        enquire = el("a", "btn", "Enquire about this item");
        enquire.href =
          "mailto:" + email +
          "?subject=" + encodeURIComponent("Enquiry: " + (p.name || "item"));
      } else {
        enquire = el("a", "btn", "Contact us about this item");
        enquire.href = "contact.html";
      }
      body.appendChild(enquire);
    }

    grid.appendChild(body);
    d.appendChild(grid);

    // showModal() gives focus trapping and Esc-to-close for free.
    if (typeof d.showModal === "function") d.showModal();
    else d.setAttribute("open", "");
    close.focus();
  }

  /* ---------- contact form ------------------------------------------------ */

  function initForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;

    var status = document.getElementById("form-status");

    function setFieldError(input, message) {
      var field = input.closest(".field");
      if (!field) return;
      var existing = field.querySelector(".error");
      if (existing) existing.remove();
      if (message) {
        field.classList.add("field--invalid");
        input.setAttribute("aria-invalid", "true");
        field.appendChild(el("p", "error", message));
      } else {
        field.classList.remove("field--invalid");
        input.removeAttribute("aria-invalid");
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = form.elements.name;
      var email = form.elements.email;
      var message = form.elements.message;
      var ok = true;

      setFieldError(name, null);
      setFieldError(email, null);
      setFieldError(message, null);

      if (!name.value.trim()) { setFieldError(name, "Please enter your name."); ok = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        setFieldError(email, "Please enter a valid email address."); ok = false;
      }
      if (!message.value.trim()) { setFieldError(message, "Please enter a message."); ok = false; }

      // Honeypot: real people leave this hidden field empty. Bots fill it.
      if (form.elements.company && form.elements.company.value) return;

      if (!ok) {
        var firstBad = form.querySelector(".field--invalid input, .field--invalid textarea");
        if (firstBad) firstBad.focus();
        return;
      }

      if (SITE.formEndpoint) {
        submitToEndpoint(form, status, name, email, message);
      } else {
        // No backend configured yet — hand off to the visitor's email client.
        var to = (SITE.contact && SITE.contact.email) || "";
        var subject = "Website enquiry from " + name.value.trim();
        var bodyText =
          name.value.trim() + " <" + email.value.trim() + ">\n\n" + message.value.trim();
        window.location.href =
          "mailto:" + to +
          "?subject=" + encodeURIComponent(subject) +
          "&body=" + encodeURIComponent(bodyText);
        setStatus(status, "ok", "Opening your email app to send the message…");
      }
    });
  }

  function submitToEndpoint(form, status, name, email, message) {
    var button = form.querySelector('button[type="submit"]');
    if (button) button.disabled = true;
    setStatus(status, "", "Sending…");

    fetch(SITE.formEndpoint, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form)
    })
      .then(function (response) {
        if (!response.ok) throw new Error("Request failed: " + response.status);
        form.reset();
        setStatus(status, "ok", "Thank you — your message has been sent.");
      })
      .catch(function () {
        var to = (SITE.contact && SITE.contact.email) || "";
        setStatus(
          status, "err",
          "Sorry, that did not send." + (to ? " Please email " + to + " instead." : "")
        );
      })
      .finally(function () {
        if (button) button.disabled = false;
      });
  }

  function setStatus(node, state, text) {
    if (!node) return;
    node.setAttribute("data-state", state || "");
    node.textContent = text;
  }

  /* ---------- shared chrome ------------------------------------------------ */

  function initChrome() {
    fillText("[data-site-name]", SITE.name);
    fillText("[data-site-tagline]", SITE.tagline);
    fillText("[data-site-intro]", SITE.intro);

    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());

    var title = document.querySelector("title");
    if (title && SITE.name && title.textContent.indexOf("{{name}}") !== -1) {
      title.textContent = title.textContent.replace("{{name}}", SITE.name);
    }

    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("primary-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.getAttribute("data-open") === "true";
        nav.setAttribute("data-open", String(!open));
        toggle.setAttribute("aria-expanded", String(!open));
      });
    }

    // Mark the current page in the nav.
    var path = window.location.pathname.split("/").pop() || "index.html";
    var links = document.querySelectorAll("#primary-nav a");
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute("href") === path) {
        links[i].setAttribute("aria-current", "page");
      }
    }
  }

  function init() {
    initChrome();
    renderProducts("featured-grid", 3);
    renderProducts("shop-grid");
    renderAbout();
    renderContact();
    initForm();
  }

  function renderAbout() {
    var mount = document.getElementById("about-body");
    if (!mount || !SITE.about) return;
    var heading = document.getElementById("about-heading");
    if (heading && SITE.about.heading) heading.textContent = SITE.about.heading;
    (SITE.about.body || []).forEach(function (para) {
      mount.appendChild(el("p", null, para));
    });
  }

  function renderContact() {
    var mount = document.getElementById("contact-details");
    if (!mount) return;
    var c = SITE.contact || {};

    function row(label, value, href) {
      if (!value) return;
      var li = document.createElement("li");
      li.appendChild(el("span", "label", label));
      if (href) {
        var a = el("a", null, value);
        a.href = href;
        if (/^https?:/.test(href)) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
        li.appendChild(a);
      } else {
        li.appendChild(document.createTextNode(value));
      }
      mount.appendChild(li);
    }

    if (c.email && c.email.indexOf("@") !== -1) row("Email", c.email, "mailto:" + c.email);
    if (c.phone) row("Phone", c.phone, "tel:" + c.phone.replace(/[^\d+]/g, ""));
    if (c.location) row("Where", c.location, null);
    if (c.instagram) row("Instagram", c.instagram, c.instagram);
    if (c.facebook) row("Facebook", c.facebook, c.facebook);
    if (c.etsy) row("Etsy", c.etsy, c.etsy);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
