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
  var imageLightbox = document.getElementById("imageLightbox");
  var imageLightboxImg = document.getElementById("imageLightboxImg");
  var imageLightboxCaption = document.getElementById("imageLightboxCaption");
  var imageLightboxClose = document.getElementById("imageLightboxClose");
  var imageLightboxPrev = document.getElementById("imageLightboxPrev");
  var imageLightboxNext = document.getElementById("imageLightboxNext");
  var videoLightbox = document.getElementById("videoLightbox");
  var videoLightboxFrame = document.getElementById("videoLightboxFrame");
  var videoLightboxTitle = document.getElementById("videoLightboxTitle");
  var videoLightboxClose = document.getElementById("videoLightboxClose");
  var lastImageTrigger = null;
  var lastVideoTrigger = null;
  var lightboxGallery = [];
  var lightboxIndex = 0;
  var lightboxPointerStartX = 0;
  var lightboxPointerStartY = 0;
  var suppressLightboxClick = false;
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

  function getCarouselKeywords(img) {
    var value = img.getAttribute("data-carousel-keywords") || "";
    return value.split("|").map(function (keyword) {
      return keyword.trim();
    }).filter(function (keyword, index, list) {
      return keyword && list.indexOf(keyword) === index;
    });
  }

  function updateCarouselKeyword(img, keywords) {
    if (!keywords.length) return;
    var media = img.closest(".product-card__media, .modal__media");
    var keyword = media ? media.querySelector(".carousel-keyword") : null;
    if (!keyword && media) {
      keyword = document.createElement("div");
      keyword.className = "carousel-keyword";
      keyword.setAttribute("aria-label", "Arguments clés");
      media.appendChild(keyword);
    }
    if (!keyword) return;
    if (keyword.dataset.arguments === keywords.join("|")) return;
    keyword.dataset.arguments = keywords.join("|");
    var line = keywords.map(function (argument) {
      return "<span>" + argument + "</span>";
    }).join("");
    keyword.innerHTML = '<div class="carousel-keyword__track">' + line + line + "</div>";
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
      var keywords = getCarouselKeywords(img);
      if (images.length < 2) return;

      images.forEach(function (src) {
        var preload = new Image();
        preload.src = src;
      });

      var current = Math.max(0, images.indexOf(img.getAttribute("src")));
      updateCarouselKeyword(img, keywords);
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

  function getImageGallery(img) {
    var grid = img.closest(".modal__exam-grid");
    if (!grid) return [];
    return Array.prototype.slice.call(grid.querySelectorAll(".modal__exam img")).map(function (item) {
      var figure = item.closest(".modal__exam");
      var caption = figure ? figure.querySelector("figcaption") : null;
      return {
        img: item,
        src: item.currentSrc || item.src,
        alt: item.alt || "",
        caption: caption ? caption.textContent.trim() : ""
      };
    }).filter(function (item) {
      return item.src;
    });
  }

  function updateLightboxImage(index) {
    if (!imageLightboxImg || !imageLightboxCaption || !lightboxGallery.length) return;
    lightboxIndex = (index + lightboxGallery.length) % lightboxGallery.length;
    var item = lightboxGallery[lightboxIndex];
    imageLightboxImg.src = item.src;
    imageLightboxImg.alt = item.alt;
    imageLightboxCaption.textContent = item.caption;
    lastImageTrigger = item.img.closest(".modal__exam") || item.img;

    var hasMultipleImages = lightboxGallery.length > 1;
    if (imageLightboxPrev) imageLightboxPrev.hidden = !hasMultipleImages;
    if (imageLightboxNext) imageLightboxNext.hidden = !hasMultipleImages;
  }

  function showPreviousImage() {
    updateLightboxImage(lightboxIndex - 1);
  }

  function showNextImage() {
    updateLightboxImage(lightboxIndex + 1);
  }

  function openImageLightbox(img, trigger) {
    if (!imageLightbox || !imageLightboxImg || !imageLightboxCaption || !img) return;
    lightboxGallery = getImageGallery(img);
    if (!lightboxGallery.length) {
      lightboxGallery = [{ img: img, src: img.currentSrc || img.src, alt: img.alt || "", caption: "" }];
    }
    lightboxIndex = Math.max(0, lightboxGallery.findIndex(function (item) { return item.img === img; }));
    lastImageTrigger = trigger || img;
    updateLightboxImage(lightboxIndex);
    imageLightbox.hidden = false;
    imageLightbox.style.display = "flex";
    void imageLightbox.offsetWidth;
    imageLightbox.classList.add("is-open");
    if (imageLightboxClose) imageLightboxClose.focus();
  }

  function closeImageLightbox() {
    if (!imageLightbox || !imageLightbox.classList.contains("is-open")) return;
    imageLightbox.classList.remove("is-open");
    var finish = function (e) {
      if (e && e.target !== imageLightbox) return;
      imageLightbox.style.display = "none";
      imageLightbox.hidden = true;
      if (imageLightboxImg) {
        imageLightboxImg.src = "";
        imageLightboxImg.alt = "";
      }
      if (imageLightboxCaption) imageLightboxCaption.textContent = "";
      lightboxGallery = [];
      lightboxIndex = 0;
      imageLightbox.removeEventListener("transitionend", finish);
      if (lastImageTrigger && typeof lastImageTrigger.focus === "function") lastImageTrigger.focus();
      lastImageTrigger = null;
    };
    imageLightbox.addEventListener("transitionend", finish);
    setTimeout(finish, 240);
  }

  function initExamImageZoom(root) {
    root.querySelectorAll(".modal__exam").forEach(function (figure) {
      var img = figure.querySelector("img");
      if (!img) return;
      figure.setAttribute("role", "button");
      figure.setAttribute("tabindex", "0");
      figure.setAttribute("aria-label", "Agrandir l'image : " + (img.alt || "examen"));
      figure.addEventListener("click", function () {
        openImageLightbox(img, figure);
      });
      figure.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openImageLightbox(img, figure);
        }
      });
    });
  }

  function openVideoLightbox(video, trigger) {
    var iframe = video ? video.querySelector("iframe") : null;
    if (!videoLightbox || !videoLightboxFrame || !videoLightboxTitle || !iframe) return;

    var title = iframe.getAttribute("title") || "Vidéo Esaote";
    var clone = iframe.cloneNode(true);
    clone.setAttribute("loading", "eager");
    clone.setAttribute("allowfullscreen", "");
    clone.setAttribute("webkitallowfullscreen", "");
    clone.setAttribute("mozallowfullscreen", "");

    videoLightboxTitle.textContent = title;
    videoLightboxFrame.innerHTML = "";
    videoLightboxFrame.appendChild(clone);
    lastVideoTrigger = trigger || video;

    videoLightbox.hidden = false;
    videoLightbox.style.display = "flex";
    void videoLightbox.offsetWidth;
    videoLightbox.classList.add("is-open");
    if (videoLightboxClose) videoLightboxClose.focus();
  }

  function closeVideoLightbox() {
    if (!videoLightbox || !videoLightbox.classList.contains("is-open")) return;
    videoLightbox.classList.remove("is-open");
    var finish = function (e) {
      if (e && e.target !== videoLightbox) return;
      videoLightbox.style.display = "none";
      videoLightbox.hidden = true;
      if (videoLightboxFrame) videoLightboxFrame.innerHTML = "";
      if (videoLightboxTitle) videoLightboxTitle.textContent = "";
      videoLightbox.removeEventListener("transitionend", finish);
      if (lastVideoTrigger && typeof lastVideoTrigger.focus === "function") lastVideoTrigger.focus();
      lastVideoTrigger = null;
    };
    videoLightbox.addEventListener("transitionend", finish);
    setTimeout(finish, 240);
  }

  function initVideoZoom(root) {
    root.querySelectorAll(".modal__video").forEach(function (video) {
      if (!video.querySelector("iframe")) return;
      if (!video.querySelector(".modal__video-zoom")) {
        var zoom = document.createElement("button");
        zoom.className = "modal__video-zoom";
        zoom.type = "button";
        zoom.setAttribute("aria-label", "Agrandir la vidéo");
        video.appendChild(zoom);
      }
      video.setAttribute("role", "button");
      video.setAttribute("tabindex", "0");
      video.setAttribute("aria-label", "Agrandir la vidéo");
      video.querySelector(".modal__video-zoom").addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        openVideoLightbox(video, video);
      });
      video.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openVideoLightbox(video, video);
        }
      });
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
    initExamImageZoom(scroll);
    initVideoZoom(scroll);

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
  if (imageLightboxClose) imageLightboxClose.addEventListener("click", closeImageLightbox);
  if (videoLightboxClose) videoLightboxClose.addEventListener("click", closeVideoLightbox);
  if (imageLightboxPrev) imageLightboxPrev.addEventListener("click", function (e) { e.stopPropagation(); showPreviousImage(); });
  if (imageLightboxNext) imageLightboxNext.addEventListener("click", function (e) { e.stopPropagation(); showNextImage(); });
  if (imageLightbox) imageLightbox.addEventListener("click", function (e) {
    if (suppressLightboxClick) {
      e.preventDefault();
      e.stopPropagation();
      suppressLightboxClick = false;
      return;
    }
    closeImageLightbox();
  });
  if (imageLightboxImg) imageLightboxImg.addEventListener("click", function (e) { e.stopPropagation(); });
  if (imageLightboxCaption) imageLightboxCaption.addEventListener("click", function (e) { e.stopPropagation(); });
  if (videoLightbox) videoLightbox.addEventListener("click", closeVideoLightbox);
  if (videoLightboxFrame) videoLightboxFrame.addEventListener("click", function (e) { e.stopPropagation(); });
  if (videoLightboxTitle) videoLightboxTitle.addEventListener("click", function (e) { e.stopPropagation(); });
  if (imageLightbox) {
    imageLightbox.addEventListener("pointerdown", function (e) {
      lightboxPointerStartX = e.clientX;
      lightboxPointerStartY = e.clientY;
    });

    imageLightbox.addEventListener("pointerup", function (e) {
      if (lightboxGallery.length < 2) return;
      var dx = e.clientX - lightboxPointerStartX;
      var dy = e.clientY - lightboxPointerStartY;
      if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
      e.preventDefault();
      e.stopPropagation();
      suppressLightboxClick = true;
      if (dx < 0) showNextImage();
      else showPreviousImage();
      setTimeout(function () { suppressLightboxClick = false; }, 300);
    });
  }

  // clic sur l'overlay = fermeture ; clic dans la modale = ne ferme pas
  if (overlay) overlay.addEventListener("click", closeModal);
  if (modal) modal.addEventListener("click", function (e) { e.stopPropagation(); });

  // touche Échap
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (videoLightbox && videoLightbox.classList.contains("is-open")) closeVideoLightbox();
    else if (imageLightbox && imageLightbox.classList.contains("is-open")) closeImageLightbox();
    else closeModal();
  });

  document.addEventListener("keydown", function (e) {
    if (!imageLightbox || !imageLightbox.classList.contains("is-open")) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      showPreviousImage();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      showNextImage();
    }
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
