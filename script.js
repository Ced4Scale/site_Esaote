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
  var videoLightboxCaption = document.getElementById("videoLightboxCaption");
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
  var termBubble = null;
  var esaoteTerms = {
    "True-Motion": "Mode d'imagerie dynamique Esaote utilisé pour observer une articulation en mouvement, par exemple le genou, selon la configuration du système.",
    "True Motion": "Mode d'imagerie dynamique Esaote utilisé pour observer une articulation en mouvement, par exemple le genou, selon la configuration du système.",
    "HyperClarity": "Technologie de reconstruction/traitement d'image par IA Esaote visant à améliorer la netteté perçue et le rapport signal/bruit, selon configuration et indications.",
    "Hyper Clarity": "Technologie de reconstruction/traitement d'image par IA Esaote visant à améliorer la netteté perçue et le rapport signal/bruit, selon configuration et indications.",
    "e-SPADES": "Suite de reconstruction/accélération Esaote assistée par IA, utilisée pour optimiser la qualité d'image et/ou les temps d'acquisition selon configuration.",
    "e-SPADE": "Suite de reconstruction/accélération Esaote assistée par IA, utilisée pour optimiser la qualité d'image et/ou les temps d'acquisition selon configuration.",
    "HyperSpeed": "Technologie Esaote orientée accélération des acquisitions et reconstruction plus rapide, selon séquences et configuration.",
    "SHARC": "Séquence 3D Esaote utilisée notamment en imagerie ostéoarticulaire pour obtenir un volume fin pouvant être relu dans plusieurs plans.",
    "HYCE": "Séquence 3D Esaote dédiée à l'imagerie du rachis/MSK, utile pour naviguer dans un volume et reconstruire des plans de lecture.",
    "MARS": "Technique de réduction des artéfacts métalliques autour du matériel opératoire ou prothétique.",
    "SPED": "Séquence Esaote de type densité de protons rapide, souvent utilisée en MSK pour les structures articulaires.",
    "DPA": "Antenne dédiée Esaote à réseau phasé, conçue pour améliorer le signal sur une anatomie ciblée.",
    "Open-Fauteuil": "Configuration ouverte où le patient est installé assis ou semi-assis, particulièrement adaptée aux extrémités sur O-scan.",
    "Permanent magnet technology": "Technologie d'aimant permanent Esaote : champ magnétique maintenu sans hélium liquide ni cryogénie.",
    "Green MRI": "Positionnement Esaote des IRM sobres : aimant permanent, absence d'hélium, consommation électrique réduite et installation simplifiée.",
    "UniHA": "Union des hôpitaux pour les achats : centrale d'achat hospitalière française, utile pour faciliter certains projets publics."
  };

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

  function termPattern() {
    return new RegExp("\\b(" + Object.keys(esaoteTerms).sort(function (a, b) {
      return b.length - a.length;
    }).map(function (term) {
      return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }).join("|") + ")\\b", "g");
  }

  function canAnnotateNode(node) {
    var parent = node.parentElement;
    if (!parent || !node.nodeValue.trim()) return false;
    if (parent.closest(".term-info, .term-popover, script, style, textarea, select, option, button, a")) return false;
    return true;
  }

  function initTermBubbles(root) {
    if (!root) return;
    var pattern = termPattern();
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        pattern.lastIndex = 0;
        return canAnnotateNode(node) && pattern.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      pattern.lastIndex = 0;
      var fragment = document.createDocumentFragment();
      var text = node.nodeValue;
      var cursor = 0;
      text.replace(pattern, function (match, term, offset) {
        if (offset > cursor) fragment.appendChild(document.createTextNode(text.slice(cursor, offset)));
        var marker = document.createElement("span");
        marker.className = "term-info";
        marker.setAttribute("role", "button");
        marker.setAttribute("tabindex", "0");
        marker.setAttribute("data-term", term);
        marker.setAttribute("aria-label", "Définition : " + term);
        marker.textContent = match;
        fragment.appendChild(marker);
        cursor = offset + match.length;
      });
      if (cursor < text.length) fragment.appendChild(document.createTextNode(text.slice(cursor)));
      node.parentNode.replaceChild(fragment, node);
    });
  }

  function closeTermBubble() {
    if (termBubble) {
      termBubble.remove();
      termBubble = null;
    }
    document.querySelectorAll(".term-info.is-open").forEach(function (item) {
      item.classList.remove("is-open");
      item.setAttribute("aria-expanded", "false");
    });
  }

  function openTermBubble(trigger) {
    var term = trigger.getAttribute("data-term");
    var text = esaoteTerms[term];
    if (!text) return;
    closeTermBubble();
    trigger.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    termBubble = document.createElement("div");
    termBubble.className = "term-popover";
    termBubble.setAttribute("role", "dialog");
    termBubble.innerHTML = '<button type="button" class="term-popover__close" aria-label="Fermer">×</button>' +
      '<strong>' + term + '</strong><p>' + text + '</p>';
    document.body.appendChild(termBubble);
    var rect = trigger.getBoundingClientRect();
    var bubbleRect = termBubble.getBoundingClientRect();
    var left = Math.max(12, Math.min(window.innerWidth - bubbleRect.width - 12, rect.left + (rect.width / 2) - (bubbleRect.width / 2)));
    var top = rect.bottom + 10;
    if (top + bubbleRect.height > window.innerHeight - 12) top = Math.max(12, rect.top - bubbleRect.height - 10);
    termBubble.style.left = left + "px";
    termBubble.style.top = top + "px";
    termBubble.querySelector(".term-popover__close").addEventListener("click", closeTermBubble);
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
    var caption = "";
    var videoItem = video.closest(".modal__video-list > div");
    var captionEl = videoItem ? videoItem.querySelector("[data-video-caption]") : null;
    if (captionEl) caption = captionEl.textContent;
    var clone = iframe.cloneNode(true);
    clone.setAttribute("loading", "eager");
    clone.setAttribute("allowfullscreen", "");
    clone.setAttribute("webkitallowfullscreen", "");
    clone.setAttribute("mozallowfullscreen", "");

    videoLightboxTitle.textContent = title;
    if (videoLightboxCaption) {
      videoLightboxCaption.textContent = caption;
      videoLightboxCaption.hidden = !caption;
    }
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
      if (videoLightboxCaption) {
        videoLightboxCaption.textContent = "";
        videoLightboxCaption.hidden = true;
      }
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
    initTermBubbles(scroll);
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

  initTermBubbles(document.body);
  initImageCarousels(document);

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest(".term-info");
    if (trigger) {
      e.preventDefault();
      e.stopPropagation();
      if (trigger.classList.contains("is-open")) closeTermBubble();
      else openTermBubble(trigger);
      return;
    }
    if (termBubble && !e.target.closest(".term-popover")) closeTermBubble();
  });

  document.addEventListener("keydown", function (e) {
    var trigger = e.target.closest(".term-info");
    if (trigger && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      if (trigger.classList.contains("is-open")) closeTermBubble();
      else openTermBubble(trigger);
    }
    if (e.key === "Escape") closeTermBubble();
  });

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
  if (videoLightboxCaption) videoLightboxCaption.addEventListener("click", function (e) { e.stopPropagation(); });
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
