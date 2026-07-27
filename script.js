/* =====================================================================
   Esaote Medical France — interactions
   Modale produits : reprend la mécanique des pages « entreprises » de
   StudApp (overlay plein écran, fermeture croix + clic overlay,
   stopPropagation sur le contenu) + améliorations : touche Échap,
   verrouillage du scroll de fond, fondu à l'ouverture, gestion du focus.
   ===================================================================== */
(function () {
  "use strict";

  /* ------------------------------ Menu mobile ------------------------------ */
  var navToggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ------------------------------ Modale produits ------------------------------ */
  var overlay = document.getElementById("modalOverlay");
  var scroll = document.getElementById("modalScroll");
  var closeBtn = document.getElementById("modalClose");
  var modal = overlay ? overlay.querySelector(".modal") : null;
  var lastTrigger = null;
  var closeTimer = null;

  function getCarouselImages(img) {
    var value = img.getAttribute("data-carousel-images") || "";
    return value.split("|").map(function (src) {
      return src.trim();
    }).filter(function (src, index, list) {
      return src && list.indexOf(src) === index;
    });
  }

  function stopImageCarousels(root) {
    root.querySelectorAll("img[data-carousel-images]").forEach(function (img) {
      if (img._carouselTimer) {
        clearInterval(img._carouselTimer);
        img._carouselTimer = null;
      }
    });
  }

  function initImageCarousels(root) {
    root.querySelectorAll("img[data-carousel-images]").forEach(function (img) {
      stopImageCarousels(img.parentElement || root);
      var images = getCarouselImages(img);
      if (images.length < 2) return;

      images.forEach(function (src) {
        var preload = new Image();
        preload.src = src;
      });

      var current = Math.max(0, images.indexOf(img.getAttribute("src")));
      img._carouselTimer = setInterval(function () {
        current = (current + 1) % images.length;
        img.classList.add("is-fading");
        setTimeout(function () {
          img.setAttribute("src", images[current]);
          img.classList.remove("is-fading");
        }, 220);
      }, 3000);
    });
  }

  function openModal(key, trigger) {
    var tpl = document.getElementById("tpl-" + key);
    if (!tpl || !overlay) return;

    clearTimeout(closeTimer);
    if (scroll) stopImageCarousels(scroll);
    lastTrigger = trigger || null;

    // injecte le contenu du template
    scroll.innerHTML = "";
    scroll.appendChild(tpl.content.cloneNode(true));
    initImageCarousels(scroll);

    // étiquette la modale pour l'accessibilité
    var titleEl = scroll.querySelector(".modal__title");
    if (titleEl) {
      titleEl.id = "modalTitle";
      overlay.setAttribute("aria-labelledby", "modalTitle");
    }

    // montage + fondu (reflow avant l'ajout de la classe pour animer l'opacité)
    overlay.hidden = false;
    overlay.style.display = "flex";
    void overlay.offsetWidth; // force le reflow
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";

    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!overlay || !overlay.classList.contains("is-open")) return;
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";

    var finish = function (e) {
      if (e && e.target !== overlay) return; // ignore les transitions des enfants
      overlay.style.display = "none";
      overlay.hidden = true;
      if (scroll) stopImageCarousels(scroll);
      scroll.innerHTML = "";
      overlay.removeEventListener("transitionend", finish);
      clearTimeout(closeTimer);
      if (lastTrigger && typeof lastTrigger.focus === "function") lastTrigger.focus();
      lastTrigger = null;
    };
    overlay.addEventListener("transitionend", finish);
    closeTimer = setTimeout(finish, 280); // filet de sécurité si transitionend ne se déclenche pas
  }

  // ouverture depuis les cartes produit
  document.querySelectorAll(".product-card[data-product], .range-card[data-product]").forEach(function (card) {
    card.addEventListener("click", function () {
      openModal(card.getAttribute("data-product"), card);
    });
  });

  initImageCarousels(document);

  // deep-link : #produit-<clé> ouvre directement la fiche (comme le ?entreprise= de StudApp)
  function openFromHash() {
    var m = /^#produit-(.+)$/.exec(location.hash || "");
    if (m) {
      var card = document.querySelector('.product-card[data-product="' + m[1] + '"]');
      openModal(m[1], card);
    }
  }
  window.addEventListener("hashchange", openFromHash);
  openFromHash();

  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  // clic sur l'overlay = fermeture ; clic dans la modale = ne ferme pas
  if (overlay) overlay.addEventListener("click", closeModal);
  if (modal) modal.addEventListener("click", function (e) { e.stopPropagation(); });

  // touche Échap
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });

  // piège de focus minimal (maintient le Tab dans la modale)
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Tab" || !overlay || !overlay.classList.contains("is-open")) return;
    var focusables = overlay.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
})();
