(function () {
      var config = window.CED4SCALE_CASE_VIEWER || {};
      var cases = [];
      var metalAccessKey = config.accessKey || "ced4scale-metal-access";
      var metalAccessDays = config.accessDays || 15;
      var metalAccessHash = config.accessHash || "af64ca7a041078971b1b4993c8c855ba3d1e3a2006a4082decc68d8fb981c6f3";
      var selectedCase = 0;
      var selectedImage = 0;
      var accessPanel = document.getElementById("caseAccess");
      var accessForm = document.getElementById("caseAccessForm");
      var accessCode = document.getElementById("caseAccessCode");
      var accessError = document.getElementById("caseAccessError");
      var accessCancel = document.getElementById("caseAccessCancel");
      var list = document.getElementById("caseList");
      var title = document.getElementById("caseTitle");
      var sequence = document.getElementById("caseSequence");
      var description = document.getElementById("caseDescription");
      var counter = document.getElementById("caseCounter");
      var image = document.getElementById("caseImage");
      var imageButton = document.getElementById("caseImageButton");
      var compare = document.getElementById("caseCompare");
      var slider = document.getElementById("caseSlider");
      var speedSelect = document.getElementById("caseSpeed");
      var windowLevelSlider = document.getElementById("caseWindowLevel");
      var windowLevelValue = document.getElementById("caseWindowLevelValue");
      var windowLevelReset = document.getElementById("caseWindowLevelReset");
      var windowWidthSlider = document.getElementById("caseWindowWidth");
      var windowWidthValue = document.getElementById("caseWindowWidthValue");
      var windowWidthReset = document.getElementById("caseWindowWidthReset");
      var playButton = document.getElementById("casePlay");
      var lightbox = document.getElementById("caseLightbox");
      var lightboxImages = document.getElementById("caseLightboxImages");
      var lightboxCaption = document.getElementById("caseLightboxCaption");
      var lightboxWindowValues = document.getElementById("caseLightboxWindowValues");
      var lightboxControls = document.getElementById("caseLightboxControls");
      var lightboxSlider = document.getElementById("caseLightboxSlider");
      var lightboxSpeedSelect = document.getElementById("caseLightboxSpeed");
      var lightboxWindowLevelSlider = document.getElementById("caseLightboxWindowLevel");
      var lightboxWindowLevelValue = document.getElementById("caseLightboxWindowLevelValue");
      var lightboxWindowWidthSlider = document.getElementById("caseLightboxWindowWidth");
      var lightboxWindowWidthValue = document.getElementById("caseLightboxWindowWidthValue");
      var lightboxZoomSlider = document.getElementById("caseLightboxZoom");
      var lightboxZoomValue = document.getElementById("caseLightboxZoomValue");
      var lightboxCenterButton = document.getElementById("caseLightboxCenter");
      var lightboxAxisControl = document.getElementById("caseLightboxAxisControl");
      var lightboxAxisSelect = document.getElementById("caseLightboxAxis");
      var lightboxCubeControls = document.getElementById("caseLightboxCubeControls");
      var lightboxAxisCube = document.getElementById("caseLightboxAxisCube");
      var lightboxModeCube = document.getElementById("caseLightboxModeCube");
      var lightboxPlayButton = document.getElementById("caseLightboxPlay");
      var lightboxFullscreenButton = document.getElementById("caseLightboxFullscreen");
      var playTimer = null;
      var paneClickTimer = null;
      var lightboxAcquisition = null;
      var lightboxAcquisitions = null;
      var lightboxFocusedIndex = null;
      var lightboxRenderKey = "";
      var lightboxAxisSelections = {};
      var checkedAcquisitions = {};
      var playbackDelay = 700;
      var openingWindowLevel = 100;
      var openingWindowWidth = 100;
      var windowLevel = openingWindowLevel;
      var windowWidth = openingWindowWidth;
      var lightboxZoom = 100;
      var lightboxPans = {};
      var lightboxDrag = null;
      var lightboxPointers = {};
      var lightboxPinch = null;
      var lightboxMprDrag = null;
      var lightboxMprPress = null;
      var mprGuideAngle = 0;
      var mprGuidePosition = 50;
      var mprAxesOption = "__mpr_axes__";
      var lastMprAxisSelections = {};

      function goBack() {
        if (window.history.length > 1) window.history.back();
        else window.location.href = config.backHref || "index.html#produits";
      }

      function normalizeMetalCode(value) {
        var digits = String(value || "").replace(/\D/g, "");
        if (digits.indexOf("0033") === 0) digits = "0" + digits.slice(4);
        if (digits.indexOf("33") === 0 && digits.length === 11) digits = "0" + digits.slice(2);
        return digits;
      }

      function hashText(value) {
        if (!window.crypto || !window.crypto.subtle || !window.TextEncoder) {
          return Promise.resolve(value);
        }
        return window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)).then(function (buffer) {
          return Array.from(new Uint8Array(buffer)).map(function (byte) {
            return byte.toString(16).padStart(2, "0");
          }).join("");
        });
      }

      function storedMetalAccessIsValid() {
        try {
          var value = JSON.parse(window.localStorage.getItem(metalAccessKey) || "null");
          return Boolean(value && value.expiresAt && value.expiresAt > Date.now());
        } catch (error) {
          return false;
        }
      }

      function storeMetalAccess() {
        try {
          window.localStorage.setItem(metalAccessKey, JSON.stringify({
            expiresAt: Date.now() + (metalAccessDays * 24 * 60 * 60 * 1000)
          }));
        } catch (error) {}
      }

      function unlockMetalCases() {
        document.body.classList.remove("case-page--auth-pending");
        if (accessPanel) accessPanel.hidden = true;
        loadMetalCases();
      }

      function loadMetalCases() {
        fetch(config.manifestUrl || "assets/cases/irm-metal/manifest.json?v=20260728-true-mpr")
          .then(function (response) { return response.json(); })
          .then(function (data) {
            cases = data.cases || [];
            renderList();
            update();
          });
      }

      function current() {
        return cases[selectedCase];
      }

      function acquisitionsFor(item) {
        if (item.acquisitions && item.acquisitions.length) return item.acquisitions;
        return [{ label: item.sequence, images: item.images || [] }];
      }

      function maxImages(item) {
        return acquisitionsFor(item).reduce(function (max, acquisition) {
          return Math.max(max, acquisition.images.length);
        }, 0);
      }

      function maxImagesFor(acquisitions) {
        return acquisitions.reduce(function (max, acquisition) {
          return Math.max(max, acquisition.images.length);
        }, 0);
      }

      function mappedIndex(acquisition, maxCount) {
        if (!acquisition.images.length || maxCount <= 1) return 0;
        return Math.round((selectedImage / (maxCount - 1)) * (acquisition.images.length - 1));
      }

      function renderList() {
        list.innerHTML = cases.map(function (item, index) {
          var acquisitions = acquisitionsFor(item);
          var seriesText = acquisitions.length > 1 ? acquisitions.length + " acquisitions" : item.images.length + " coupes";
          return '<button type="button" class="case-viewer__item" data-index="' + index + '">' +
            '<strong>' + item.title + '</strong>' +
            '<span>' + item.sequence + ' · ' + seriesText + '</span>' +
            '</button>';
        }).join("");
        list.querySelectorAll("button").forEach(function (button) {
          button.addEventListener("click", function () {
            selectedCase = Number(button.dataset.index);
            selectedImage = 0;
            lightboxAcquisition = null;
            lightboxAcquisitions = null;
            update();
          });
        });
      }

      function update() {
        var item = current();
        if (!item) return;
        var acquisitions = acquisitionsFor(item);
        var maxCount = maxImages(item);
        selectedImage = Math.max(0, Math.min(selectedImage, maxCount - 1));
        title.textContent = item.title;
        sequence.textContent = item.sequence;
        description.textContent = item.description;
        counter.textContent = (selectedImage + 1) + "/" + maxCount;
        slider.max = Math.max(1, maxCount);
        slider.value = selectedImage + 1;
        lightboxSlider.max = Math.max(1, maxCount);
        lightboxSlider.value = selectedImage + 1;
        if (acquisitions.length > 1) renderCompare(item, acquisitions, maxCount);
        else renderSingle(item, acquisitions[0]);
        list.querySelectorAll("button").forEach(function (button, index) {
          button.classList.toggle("is-active", index === selectedCase);
        });
        if (!lightbox.hidden) updateLightbox();
      }

      function renderSingle(item, acquisition) {
        compare.hidden = true;
        compare.innerHTML = "";
        imageButton.hidden = false;
        lightboxAcquisition = null;
        lightboxAcquisitions = null;
        image.src = acquisition.images[selectedImage];
        image.alt = item.title + " - coupe " + (selectedImage + 1);
      }

      function renderCompare(item, acquisitions, maxCount) {
        imageButton.hidden = true;
        compare.hidden = false;
        var hasPlanes = acquisitions.some(function (acquisition) { return acquisition.plane; });
        var planes = sortedPlanes(acquisitions);
        var shouldGroupByPlane = planes.some(function (plane) {
          return acquisitions.filter(function (acquisition) {
            return (acquisition.plane || "Autres acquisitions") === plane;
          }).length > 1;
        });
        if (hasPlanes && shouldGroupByPlane) {
          compare.classList.add("case-viewer__compare--grouped");
          var structureKey = caseKey() + "|grouped|" + planes.join("|") + "|" + acquisitions.length;
          if (compare.dataset.structureKey !== structureKey) {
            compare.innerHTML = planes.map(function (plane) {
              var panes = acquisitions.map(function (acquisition, index) {
                if ((acquisition.plane || "Autres acquisitions") !== plane) return "";
                return renderPane(item, acquisition, index, maxCount);
              }).join("");
              return '<section class="case-viewer__plane"><h3>' + plane + '</h3><div class="case-viewer__plane-grid">' + panes + '</div></section>';
            }).join("");
            compare.dataset.structureKey = structureKey;
            bindCompareControls(acquisitions);
          }
        } else {
          compare.classList.remove("case-viewer__compare--grouped");
          var flatKey = caseKey() + "|flat|" + acquisitions.length;
          if (compare.dataset.structureKey !== flatKey) {
            compare.innerHTML = acquisitions.map(function (acquisition, index) {
              return { acquisition: acquisition, index: index };
            }).sort(function (a, b) {
              return planeRank(a.acquisition.plane || "") - planeRank(b.acquisition.plane || "");
            }).map(function (entry) {
              var acquisition = entry.acquisition;
              var index = entry.index;
              return renderPane(item, acquisition, index, maxCount);
            }).join("");
            compare.dataset.structureKey = flatKey;
            bindCompareControls(acquisitions);
          }
        }
        updateCompareImages(item, acquisitions, maxCount);
        preloadAround(acquisitions, maxCount);
      }

      function bindCompareControls(acquisitions) {
        compare.querySelectorAll("button").forEach(function (button) {
          button.addEventListener("click", function () {
            var acquisitionIndex = Number(button.dataset.acquisition);
            if (paneClickTimer) window.clearTimeout(paneClickTimer);
            paneClickTimer = window.setTimeout(function () {
              lightboxAcquisition = acquisitions[acquisitionIndex];
              lightboxAcquisitions = null;
              openLightbox();
            }, 220);
          });
          button.addEventListener("dblclick", function (event) {
            event.preventDefault();
            if (paneClickTimer) {
              window.clearTimeout(paneClickTimer);
              paneClickTimer = null;
            }
            openSelectedLightbox();
          });
        });
        compare.querySelectorAll("input").forEach(function (checkbox) {
          checkbox.addEventListener("click", function (event) {
            event.stopPropagation();
          });
          checkbox.addEventListener("change", function () {
            setChecked(Number(checkbox.dataset.acquisition), checkbox.checked);
          });
        });
      }

      function updateCompareImages(item, acquisitions, maxCount) {
        compare.querySelectorAll(".case-viewer__pane").forEach(function (button) {
          var acquisitionIndex = Number(button.dataset.acquisition);
          var acquisition = acquisitions[acquisitionIndex];
          if (!acquisition) return;
          var imageIndex = mappedIndex(acquisition, maxCount);
          var img = button.querySelector("img");
          var label = button.querySelector("span");
          var src = acquisition.images[imageIndex];
          if (img.getAttribute("src") !== src) img.src = src;
          img.alt = item.title + " - " + acquisition.label + " - coupe " + (imageIndex + 1);
          label.textContent = acquisition.label + " · " + (imageIndex + 1) + "/" + acquisition.images.length;
        });
      }

      function sortedPlanes(acquisitions) {
        var planes = [];
        acquisitions.forEach(function (acquisition) {
          var plane = acquisition.plane || "Autres acquisitions";
          if (planes.indexOf(plane) === -1) planes.push(plane);
        });
        return planes.sort(function (a, b) {
          return planeRank(a) - planeRank(b);
        });
      }

      function planeRank(plane) {
        var normalized = plane.toLowerCase();
        if (normalized.indexOf("axial") !== -1) return 1;
        if (normalized.indexOf("sagittal") !== -1) return 2;
        if (normalized.indexOf("coronal") !== -1) return 3;
        if (normalized.indexOf("3d") !== -1 || normalized.indexOf("volume") !== -1) return 4;
        return 5;
      }

      function renderPane(item, acquisition, index, maxCount) {
        var imageIndex = mappedIndex(acquisition, maxCount);
        var checked = checkedIndexes().indexOf(index) !== -1 ? " checked" : "";
        return '<div class="case-viewer__pane-wrap">' +
          '<label class="case-viewer__check">' +
          '<input type="checkbox" data-acquisition="' + index + '"' + checked + ' />' +
          '<span>Comparer</span>' +
          '</label>' +
          '<button class="case-viewer__pane" type="button" data-acquisition="' + index + '">' +
          '<img src="' + acquisition.images[imageIndex] + '" alt="' + item.title + ' - ' + acquisition.label + ' - coupe ' + (imageIndex + 1) + '" />' +
          '<span>' + acquisition.label + ' · ' + (imageIndex + 1) + '/' + acquisition.images.length + '</span>' +
          '</button>' +
          '</div>';
      }

      function caseKey() {
        var item = current();
        return item ? item.slug || item.title : "case";
      }

      function checkedIndexes() {
        return checkedAcquisitions[caseKey()] || [];
      }

      function acquisitionKey(acquisition) {
        return caseKey() + "|" + acquisition.label;
      }

      function visibleCheckedIndexes() {
        return Array.from(compare.querySelectorAll(".case-viewer__check input:checked")).map(function (checkbox) {
          return Number(checkbox.dataset.acquisition);
        });
      }

      function setChecked(index, isChecked) {
        var key = caseKey();
        var indexes = checkedAcquisitions[key] || [];
        if (isChecked && indexes.indexOf(index) === -1) indexes.push(index);
        if (!isChecked) indexes = indexes.filter(function (value) { return value !== index; });
        checkedAcquisitions[key] = indexes;
      }

      function setWindowLevel(value) {
        windowLevel = Math.max(50, Math.min(150, Number(value) || openingWindowLevel));
        document.documentElement.style.setProperty("--case-window-level", windowLevel + "%");
        windowLevelSlider.value = windowLevel;
        lightboxWindowLevelSlider.value = windowLevel;
        windowLevelValue.textContent = windowLevel + "%";
        lightboxWindowLevelValue.textContent = windowLevel + "%";
        updateWindowReadout();
      }

      function setWindowWidth(value) {
        windowWidth = Math.max(50, Math.min(180, Number(value) || openingWindowWidth));
        document.documentElement.style.setProperty("--case-window-width", windowWidth + "%");
        windowWidthSlider.value = windowWidth;
        lightboxWindowWidthSlider.value = windowWidth;
        windowWidthValue.textContent = windowWidth + "%";
        lightboxWindowWidthValue.textContent = windowWidth + "%";
        updateWindowReadout();
      }

      function updateWindowReadout() {
        lightboxWindowValues.textContent = "WL " + windowLevel + "% · WW " + windowWidth + "%";
      }

      function updateZoomTransform() {
        lightboxImages.style.setProperty("--lightbox-zoom", lightboxZoom / 100);
        lightboxImages.querySelectorAll("figure").forEach(function (figure) {
          var pan = lightboxPan(figure.dataset.panKey);
          figure.style.setProperty("--lightbox-pan-x", pan.x + "px");
          figure.style.setProperty("--lightbox-pan-y", pan.y + "px");
        });
        lightboxZoomSlider.value = lightboxZoom;
        lightboxZoomValue.textContent = lightboxZoom + "%";
        lightboxImages.classList.toggle("is-zoomed", lightboxZoom > 100);
      }

      function updateMprGuideStyles(maxCount, hasMprAxes) {
        if (hasMprAxes && maxCount > 1 && !lightboxMprDrag) {
          mprGuidePosition = (selectedImage / (maxCount - 1)) * 100;
        }
        lightboxImages.style.setProperty("--mpr-guide-position", mprGuidePosition.toFixed(2) + "%");
        lightboxImages.style.setProperty("--mpr-guide-angle", mprGuideAngle.toFixed(1) + "deg");
        lightboxImages.classList.toggle("has-active-mpr-guides", Boolean(hasMprAxes));
      }

      function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
      }

      function imageRelativePoint(event, figure) {
        var img = figure.querySelector("img");
        var rect = (img || figure).getBoundingClientRect();
        return {
          rect: rect,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        };
      }

      function startMprGuideDrag(event, figure, action) {
        clearMprLongPress();
        var displayedAcquisitions = displayedLightboxAcquisitions(acquisitionsFor(current()));
        var displayedViews = lightboxDisplayViews(displayedAcquisitions);
        var maxCount = maxImagesFor(displayedViews);
        var point = imageRelativePoint(event, figure);
        var centerX = point.rect.left + (point.rect.width / 2);
        var centerY = point.rect.top + (point.rect.height / 2);
        lightboxMprDrag = {
          id: event.pointerId,
          action: action,
          figure: figure,
          maxCount: maxCount,
          centerX: centerX,
          centerY: centerY,
          startPointerAngle: Math.atan2(event.clientY - centerY, event.clientX - centerX) * 180 / Math.PI,
          startGuideAngle: mprGuideAngle
        };
        lightboxImages.classList.toggle("is-mpr-moving", action === "move");
        lightboxImages.classList.toggle("is-mpr-rotating", action === "rotate");
        moveMprGuideDrag(event);
      }

      function moveMprGuideDrag(event) {
        if (!lightboxMprDrag || lightboxMprDrag.id !== event.pointerId) return;
        if (lightboxMprDrag.action === "rotate") {
          var angle = Math.atan2(event.clientY - lightboxMprDrag.centerY, event.clientX - lightboxMprDrag.centerX) * 180 / Math.PI;
          mprGuideAngle = clamp(lightboxMprDrag.startGuideAngle + angle - lightboxMprDrag.startPointerAngle, -45, 45);
          updateMprGuideStyles(lightboxMprDrag.maxCount, true);
          return;
        }
        var point = imageRelativePoint(event, lightboxMprDrag.figure);
        var ratio = clamp(point.y / point.rect.height, 0, 1);
        mprGuidePosition = ratio * 100;
        if (lightboxMprDrag.maxCount > 1) {
          selectedImage = Math.round(ratio * (lightboxMprDrag.maxCount - 1));
        }
        update();
      }

      function endMprGuideDrag(event) {
        if (!lightboxMprDrag || lightboxMprDrag.id !== event.pointerId) return;
        lightboxMprDrag = null;
        lightboxImages.classList.remove("is-mpr-moving", "is-mpr-rotating");
      }

      function clearMprLongPress() {
        if (lightboxMprPress && lightboxMprPress.timer) {
          window.clearTimeout(lightboxMprPress.timer);
        }
        lightboxMprPress = null;
        lightboxImages.classList.remove("is-mpr-pressing");
      }

      function mprActionFromPoint(event, figure) {
        var point = imageRelativePoint(event, figure);
        var guideY = point.rect.height * (mprGuidePosition / 100);
        var distanceToGuide = Math.abs(point.y - guideY);
        var nearGuide = distanceToGuide <= 24;
        if (!nearGuide) return "";
        var edgeZone = Math.min(72, point.rect.width * .18);
        if (point.x <= edgeZone || point.x >= point.rect.width - edgeZone) return "rotate";
        return "move";
      }

      function scheduleMprLongPress(event, figure, action, panKey) {
        clearMprLongPress();
        lightboxMprPress = {
          id: event.pointerId,
          figure: figure,
          action: action,
          panKey: panKey,
          x: event.clientX,
          y: event.clientY,
          currentX: event.clientX,
          currentY: event.clientY,
          timer: window.setTimeout(function () {
            if (!lightboxMprPress || lightboxMprPress.id !== event.pointerId) return;
            lightboxImages.classList.add(action === "rotate" ? "is-mpr-rotating" : "is-mpr-moving");
            startMprGuideDrag({
              pointerId: event.pointerId,
              clientX: lightboxMprPress.currentX,
              clientY: lightboxMprPress.currentY
            }, figure, action);
          }, 1000)
        };
        lightboxImages.classList.add("is-mpr-pressing");
      }

      function updateMprLongPress(event) {
        if (!lightboxMprPress || lightboxMprPress.id !== event.pointerId || lightboxMprDrag) return;
        lightboxMprPress.currentX = event.clientX;
        lightboxMprPress.currentY = event.clientY;
      }

      function lightboxPan(key) {
        if (!key) key = "default";
        if (!lightboxPans[key]) lightboxPans[key] = { x: 0, y: 0 };
        return lightboxPans[key];
      }

      function resetLightboxPans() {
        lightboxPans = {};
      }

      function setLightboxZoom(value, centerPoint, panKey) {
        var nextZoom = Math.max(100, Math.min(300, Number(value) || 100));
        if (nextZoom === 100) {
          resetLightboxPans();
        } else if (centerPoint && lightboxZoom !== nextZoom) {
          var factor = nextZoom / lightboxZoom;
          var pan = lightboxPan(panKey);
          pan.x = centerPoint.x - ((centerPoint.x - pan.x) * factor);
          pan.y = centerPoint.y - ((centerPoint.y - pan.y) * factor);
        }
        lightboxZoom = nextZoom;
        updateZoomTransform();
      }

      function centerLightboxZoom(panKey) {
        if (panKey) lightboxPans[panKey] = { x: 0, y: 0 };
        else resetLightboxPans();
        updateZoomTransform();
      }

      function pointerList() {
        return Object.keys(lightboxPointers).map(function (key) {
          return lightboxPointers[key];
        });
      }

      function pinchDistance(points) {
        var dx = points[0].x - points[1].x;
        var dy = points[0].y - points[1].y;
        return Math.sqrt((dx * dx) + (dy * dy));
      }

      function pinchCenter(points) {
        var figure = points[0].figure || lightboxImages;
        var rect = figure.getBoundingClientRect();
        return {
          x: ((points[0].x + points[1].x) / 2) - rect.left - (rect.width / 2),
          y: ((points[0].y + points[1].y) / 2) - rect.top - (rect.height / 2)
        };
      }

      function startLightboxPinch() {
        var points = pointerList();
        if (points.length < 2) {
          lightboxPinch = null;
          return;
        }
        lightboxDrag = null;
        lightboxPinch = {
          distance: pinchDistance(points),
          zoom: lightboxZoom,
          panKey: points[0].panKey
        };
      }

      function step(delta) {
        selectedImage += delta;
        update();
      }

      function loopStep() {
        var item = current();
        var maxCount = !lightbox.hidden ? lightboxMaxImages() : (item ? maxImages(item) : 0);
        if (!maxCount) return;
        selectedImage = (selectedImage + 1) % maxCount;
        update();
      }

      function setPlaying(isPlaying) {
        if (playTimer) {
          window.clearInterval(playTimer);
          playTimer = null;
        }
        if (isPlaying) {
          playTimer = window.setInterval(loopStep, playbackDelay);
        }
        playButton.textContent = isPlaying ? "Ⅱ" : "▶";
        lightboxPlayButton.textContent = isPlaying ? "Ⅱ" : "▶";
        playButton.setAttribute("aria-pressed", isPlaying ? "true" : "false");
        lightboxPlayButton.setAttribute("aria-pressed", isPlaying ? "true" : "false");
        playButton.setAttribute("aria-label", isPlaying ? "Mettre en pause" : "Lancer la lecture automatique");
        lightboxPlayButton.setAttribute("aria-label", isPlaying ? "Mettre en pause" : "Lancer la lecture automatique");
      }

      function setPlaybackSpeed(value) {
        playbackDelay = Math.max(120, Number(value) || 700);
        speedSelect.value = String(playbackDelay);
        lightboxSpeedSelect.value = String(playbackDelay);
        if (playTimer) setPlaying(true);
      }

      function fullscreenElement() {
        return document.fullscreenElement || document.webkitFullscreenElement || null;
      }

      function isLightboxFullscreen() {
        return fullscreenElement() === lightbox;
      }

      function updateFullscreenButton() {
        var isFullscreen = isLightboxFullscreen();
        lightboxFullscreenButton.textContent = isFullscreen ? "↙" : "⛶";
        lightboxFullscreenButton.setAttribute("aria-pressed", isFullscreen ? "true" : "false");
        lightboxFullscreenButton.setAttribute("aria-label", isFullscreen ? "Quitter le plein écran" : "Passer en plein écran");
      }

      function requestLightboxFullscreen() {
        if (lightbox.requestFullscreen) return lightbox.requestFullscreen();
        if (lightbox.webkitRequestFullscreen) return lightbox.webkitRequestFullscreen();
        return null;
      }

      function exitLightboxFullscreen() {
        if (document.exitFullscreen) return document.exitFullscreen();
        if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
        return null;
      }

      function toggleLightboxFullscreen() {
        if (isLightboxFullscreen()) exitLightboxFullscreen();
        else requestLightboxFullscreen();
        window.setTimeout(updateFullscreenButton, 60);
      }

      function updateLightbox() {
        var item = current();
        var acquisitions = acquisitionsFor(item);
        var displayedAcquisitions = displayedLightboxAcquisitions(acquisitions);
        setLightboxAxisOptions(displayedAcquisitions);
        updateLightboxCubeControls(displayedAcquisitions);
        var displayedViews = lightboxDisplayViews(displayedAcquisitions);
        var maxCount = maxImagesFor(displayedViews);
        selectedImage = Math.max(0, Math.min(selectedImage, maxCount - 1));
        var renderKey = displayedViews.map(function (view) {
          return view.label + ":" + (view.showMprAxes ? "mpr" : "standard");
        }).join("|");
        lightboxImages.classList.toggle("image-lightbox__images--compare", displayedViews.length > 1);
        var hasMprAxes = displayedViews.some(function (view) { return view.showMprAxes; });
        lightboxImages.classList.toggle("image-lightbox__images--mpr", hasMprAxes);
        lightboxImages.style.setProperty("--lightbox-columns", displayedViews.length);
        if (lightboxRenderKey !== renderKey) {
          lightboxImages.innerHTML = displayedViews.map(function (view, index) {
            var className = view.showMprAxes ? ' class="has-mpr-axes"' : "";
            var panKey = view.label + ":" + index;
            return '<figure' + className + ' data-lightbox-index="' + index + '" data-pan-key="' + panKey + '">' +
              '<span class="image-lightbox__plane-icon"></span>' +
              '<span class="image-lightbox__mpr-axis image-lightbox__mpr-axis--main"></span>' +
              '<span class="image-lightbox__mpr-axis image-lightbox__mpr-axis--cross"></span>' +
              '<span class="image-lightbox__mpr-hit image-lightbox__mpr-hit--move" data-mpr-action="move" aria-hidden="true"><span>↔</span></span>' +
              '<span class="image-lightbox__mpr-hit image-lightbox__mpr-hit--rotate image-lightbox__mpr-hit--rotate-left" data-mpr-action="rotate" aria-hidden="true"><span>↻</span></span>' +
              '<span class="image-lightbox__mpr-hit image-lightbox__mpr-hit--rotate image-lightbox__mpr-hit--rotate-right" data-mpr-action="rotate" aria-hidden="true"><span>↻</span></span>' +
              '<img alt="" /><figcaption></figcaption></figure>';
          }).join("");
          lightboxRenderKey = renderKey;
        }
        lightboxImages.querySelectorAll("figure").forEach(function (figure, index) {
          var acquisition = displayedViews[index];
          figure.classList.toggle("has-mpr-axes", Boolean(acquisition.showMprAxes));
          var imageIndex = mappedIndex(acquisition, maxCount);
          var img = figure.querySelector("img");
          var caption = figure.querySelector("figcaption");
          var planeIcon = figure.querySelector(".image-lightbox__plane-icon");
          var src = acquisition.images[imageIndex];
          if (img.getAttribute("src") !== src) img.src = src;
          img.alt = item.title + " - " + acquisition.label + " - coupe " + (imageIndex + 1);
          caption.textContent = acquisition.label + " · coupe " + (imageIndex + 1) + "/" + acquisition.images.length;
          if (planeIcon) {
            planeIcon.innerHTML = acquisition.showMprAxes ? axisCubeMarkup(acquisition.label) : "";
          }
        });
        lightboxCaption.textContent = item.title + " · " + lightboxCaptionMode(displayedAcquisitions, displayedViews);
        lightboxSlider.max = Math.max(1, maxCount);
        lightboxSlider.value = selectedImage + 1;
        updateMprGuideStyles(maxCount, hasMprAxes);
        updateZoomTransform();
        preloadAround(displayedViews, maxCount);
      }

      function lightboxMaxImages() {
        var acquisitions = acquisitionsFor(current());
        var displayedAcquisitions = displayedLightboxAcquisitions(acquisitions);
        return maxImagesFor(lightboxDisplayViews(displayedAcquisitions));
      }

      function displayedLightboxAcquisitions(acquisitions) {
        var base = lightboxAcquisitions || [lightboxAcquisition || acquisitions[0]];
        if (lightboxAcquisitions && lightboxAcquisitions.length > 1 && lightboxFocusedIndex !== null) {
          return [lightboxAcquisitions[lightboxFocusedIndex]].filter(Boolean);
        }
        return base;
      }

      function lightboxDisplayViews(displayedAcquisitions, ignoreFocus) {
        if (displayedAcquisitions.length === 1 && isMprAxesSelected(displayedAcquisitions[0])) {
          var views = mprAxisViews(displayedAcquisitions[0]).map(function (view) {
            var copy = Object.assign({}, view);
            copy.showMprAxes = true;
            return copy;
          });
          if (!ignoreFocus && lightboxFocusedIndex !== null) {
            return [views[lightboxFocusedIndex]].filter(Boolean);
          }
          return views;
        }
        return displayedAcquisitions.map(function (acquisition) {
          return selectedAxisView(acquisition);
        });
      }

      function lightboxCaptionMode(displayedAcquisitions, displayedViews) {
        if (displayedViews.some(function (view) { return view.showMprAxes; })) {
          if (lightboxFocusedIndex !== null) {
            return "1 plan MPR isolé · double-clic pour revenir aux plans synchronisés";
          }
          return "MPR · " + displayedViews.length + " plans synchronisés";
        }
        if (lightboxAcquisitions && lightboxAcquisitions.length > 1 && lightboxFocusedIndex !== null) {
          return "1 acquisition isolée · double-clic pour revenir à la comparaison";
        }
        return displayedAcquisitions.length + " acquisition" + (displayedAcquisitions.length > 1 ? "s synchronisées" : "");
      }

      function selectedAxisView(acquisition) {
        if (!acquisition || !acquisition.axisViews || !acquisition.axisViews.length) return acquisition;
        var selectedLabel = lightboxAxisSelections[acquisitionKey(acquisition)] || acquisition.axisViews[0].label;
        if (selectedLabel === mprAxesOption) return mprAxisViews(acquisition)[0] || acquisition.axisViews[0];
        return acquisition.axisViews.find(function (view) {
          return view.label === selectedLabel;
        }) || acquisition.axisViews[0];
      }

      function isMprAxesSelected(acquisition) {
        return acquisition && lightboxAxisSelections[acquisitionKey(acquisition)] === mprAxesOption && mprAxisViews(acquisition).length > 1;
      }

      function mprAxisViews(acquisition) {
        if (!acquisition || !acquisition.axisViews) return [];
        return acquisition.axisViews.filter(function (view) {
          return (view.label || "").toLowerCase().indexOf("mpr") !== -1;
        });
      }

      function volumeAxisView(acquisition) {
        if (!acquisition || !acquisition.axisViews) return null;
        return acquisition.axisViews.find(function (view) {
          var label = (view.label || "").toLowerCase();
          return label.indexOf("volume") !== -1 || label.indexOf("3d") !== -1;
        }) || acquisition.axisViews[0];
      }

      function singleAxisAcquisition(displayedAcquisitions) {
        if (displayedAcquisitions.length !== 1) return null;
        var acquisition = displayedAcquisitions[0];
        return acquisition && acquisition.axisViews && acquisition.axisViews.length > 1 ? acquisition : null;
      }

      function axisCubeMeta(label) {
        var normalized = (label || "").toLowerCase();
        if (normalized.indexOf("axial 1") !== -1) return { view: "axial", badge: "1", name: "axial 1" };
        if (normalized.indexOf("axial 2") !== -1) return { view: "axial", badge: "2", name: "axial 2" };
        if (normalized.indexOf("sagittal") !== -1) return { view: "sagittal", badge: "", name: "sagittal" };
        if (normalized.indexOf("coronal") !== -1) return { view: "coronal", badge: "", name: "coronal" };
        if (normalized.indexOf("mpr") !== -1) return { view: "sagittal", badge: "", name: "MPR" };
        return { view: "axial", badge: "", name: "axial" };
      }

      function axisCubeMarkup(label) {
        var meta = axisCubeMeta(label);
        var badge = meta.badge ? '<span class="patient-axis__badge">' + meta.badge + '</span>' : "";
        return '<span class="patient-axis patient-axis--' + meta.view + '" aria-hidden="true">' +
          '<span class="patient-axis__body">' +
          '<span class="patient-axis__head"></span>' +
          '<span class="patient-axis__torso"></span>' +
          '<span class="patient-axis__feet"></span>' +
          '</span>' + badge +
          '</span><span class="sr-only">Plan ' + meta.name + '</span>';
      }

      function selectedAxisLabel(acquisition) {
        return lightboxAxisSelections[acquisitionKey(acquisition)] || (acquisition.axisViews[0] && acquisition.axisViews[0].label) || "";
      }

      function updateLightboxCubeControls(displayedAcquisitions) {
        var acquisition = singleAxisAcquisition(displayedAcquisitions);
        if (!acquisition || mprAxisViews(acquisition).length < 2) {
          lightboxCubeControls.hidden = true;
          return;
        }
        lightboxCubeControls.hidden = false;
        var selectedLabel = selectedAxisLabel(acquisition);
        var currentMpr = mprAxisViews(acquisition).find(function (view) { return view.label === selectedLabel; });
        var cubeLabel = currentMpr ? currentMpr.label : selectedLabel;
        lightboxAxisCube.innerHTML = axisCubeMarkup(cubeLabel);
        lightboxAxisCube.setAttribute("aria-label", "Changer l'axe MPR, plan actuel " + axisCubeMeta(cubeLabel).name);
        lightboxModeCube.textContent = isMprAxesSelected(acquisition) ? "MPR" : (currentMpr ? "2D" : "3D");
        lightboxModeCube.setAttribute("aria-label", "Changer le mode de lecture, mode actuel " + lightboxModeCube.textContent);
        lightboxModeCube.setAttribute("aria-pressed", isMprAxesSelected(acquisition) ? "true" : "false");
      }

      function setAxisSelection(acquisition, label) {
        if (!acquisition) return;
        var key = acquisitionKey(acquisition);
        lightboxAxisSelections[key] = label;
        if (label !== mprAxesOption && mprAxisViews(acquisition).some(function (view) { return view.label === label; })) {
          lastMprAxisSelections[key] = label;
        }
        selectedImage = 0;
        lightboxRenderKey = "";
        update();
      }

      function cycleMprAxis() {
        var acquisition = singleAxisAcquisition(displayedLightboxAcquisitions(acquisitionsFor(current())));
        if (!acquisition) return;
        var mprViews = mprAxisViews(acquisition);
        var selectedLabel = selectedAxisLabel(acquisition);
        var selectedIndex = mprViews.findIndex(function (view) { return view.label === selectedLabel; });
        var nextView = mprViews[(selectedIndex + 1 + mprViews.length) % mprViews.length] || mprViews[0];
        setAxisSelection(acquisition, nextView.label);
      }

      function toggle2d3dAxis() {
        var acquisition = singleAxisAcquisition(displayedLightboxAcquisitions(acquisitionsFor(current())));
        if (!acquisition) return;
        var selectedLabel = selectedAxisLabel(acquisition);
        var key = acquisitionKey(acquisition);
        var isSingleMpr = mprAxisViews(acquisition).some(function (view) { return view.label === selectedLabel; });
        if (selectedLabel === mprAxesOption) {
          var volumeView = volumeAxisView(acquisition);
          setAxisSelection(acquisition, volumeView ? volumeView.label : acquisition.axisViews[0].label);
        } else if (isSingleMpr) {
          setAxisSelection(acquisition, mprAxesOption);
        } else {
          setAxisSelection(acquisition, lastMprAxisSelections[key] || (mprAxisViews(acquisition)[0] && mprAxisViews(acquisition)[0].label));
        }
      }

      function setLightboxAxisOptions(displayedAcquisitions) {
        var acquisition = displayedAcquisitions.length === 1 ? displayedAcquisitions[0] : null;
        if (!acquisition || !acquisition.axisViews || acquisition.axisViews.length < 2) {
          lightboxAxisControl.hidden = true;
          lightboxAxisSelect.innerHTML = "";
          return;
        }
        lightboxAxisControl.hidden = false;
        var selectedLabel = lightboxAxisSelections[acquisitionKey(acquisition)] || selectedAxisView(acquisition).label;
        var mprViews = mprAxisViews(acquisition);
        var options = acquisition.axisViews.map(function (view) {
          var selected = view.label === selectedLabel ? " selected" : "";
          return '<option value="' + view.label + '"' + selected + '>' + view.label + '</option>';
        });
        if (mprViews.length > 1) {
          var selected = isMprAxesSelected(acquisition) ? " selected" : "";
          options.push('<option value="' + mprAxesOption + '"' + selected + '>MPR</option>');
        }
        lightboxAxisSelect.innerHTML = options.join("");
      }

      function preloadAround(acquisitions, maxCount) {
        [selectedImage + 1, selectedImage + 2].forEach(function (nextIndex) {
          acquisitions.forEach(function (acquisition) {
            if (!acquisition.images.length || maxCount <= 1) return;
            var clamped = nextIndex % maxCount;
            var imageIndex = Math.round((clamped / (maxCount - 1)) * (acquisition.images.length - 1));
            var preload = new Image();
            preload.src = acquisition.images[imageIndex];
          });
        });
      }

      function openLightbox() {
        lightbox.hidden = false;
        lightbox.style.display = "flex";
        lightbox.classList.add("is-open");
        updateFullscreenButton();
        updateZoomTransform();
        updateLightbox();
      }

      function openSelectedLightbox() {
        var acquisitions = acquisitionsFor(current());
        var indexes = visibleCheckedIndexes();
        if (!indexes.length) indexes = checkedIndexes();
        var selected = indexes.map(function (index) {
          return acquisitions[index];
        }).filter(Boolean);
        if (!selected.length) return;
        lightboxAcquisition = null;
        lightboxAcquisitions = selected;
        lightboxFocusedIndex = null;
        openLightbox();
      }

      function toggleFocusedLightboxImage(figure) {
        var wasFocused = lightboxFocusedIndex !== null;
        var shouldRequestFullscreen = false;
        var shouldExitFullscreen = false;
        if (lightboxFocusedIndex !== null) {
          lightboxFocusedIndex = null;
          shouldExitFullscreen = lightboxAcquisitions && lightboxAcquisitions.length > 1 && isLightboxFullscreen();
        } else {
          var displayedAcquisitions = displayedLightboxAcquisitions(acquisitionsFor(current()));
          var displayedViews = lightboxDisplayViews(displayedAcquisitions, true);
          var canFocusComparison = lightboxAcquisitions && lightboxAcquisitions.length > 1;
          var canFocusMpr = displayedViews.length > 1 && displayedViews.some(function (view) { return view.showMprAxes; });
          if (!canFocusComparison && !canFocusMpr) return;
          lightboxFocusedIndex = Number(figure.dataset.lightboxIndex) || 0;
          shouldRequestFullscreen = canFocusComparison && !isLightboxFullscreen();
        }
        lightboxRenderKey = "";
        updateLightbox();
        if (shouldRequestFullscreen) {
          var fullscreenRequest = requestLightboxFullscreen();
          if (fullscreenRequest && fullscreenRequest.catch) fullscreenRequest.catch(function () {});
          window.setTimeout(updateFullscreenButton, 60);
        }
        if (wasFocused && shouldExitFullscreen) {
          var fullscreenExit = exitLightboxFullscreen();
          if (fullscreenExit && fullscreenExit.catch) fullscreenExit.catch(function () {});
          window.setTimeout(updateFullscreenButton, 60);
        }
      }

      function closeLightbox() {
        lightbox.style.display = "none";
        lightbox.classList.remove("is-open");
        lightboxImages.style.removeProperty("--lightbox-columns");
        lightbox.hidden = true;
        lightboxAcquisition = null;
        lightboxAcquisitions = null;
        lightboxFocusedIndex = null;
        lightboxRenderKey = "";
        lightboxAxisControl.hidden = true;
        lightboxCubeControls.hidden = true;
        resetLightboxPans();
        lightboxPointers = {};
        lightboxPinch = null;
        lightboxDrag = null;
        clearMprLongPress();
        centerLightboxZoom();
        setLightboxZoom(100);
        if (isLightboxFullscreen()) exitLightboxFullscreen();
        updateFullscreenButton();
      }

      document.getElementById("caseClose").addEventListener("click", goBack);
      document.getElementById("casePrev").addEventListener("click", function () { step(-1); });
      document.getElementById("caseNext").addEventListener("click", function () { step(1); });
      playButton.addEventListener("click", function () { setPlaying(!playTimer); });
      lightboxPlayButton.addEventListener("click", function (event) {
        event.stopPropagation();
        setPlaying(!playTimer);
      });
      lightboxFullscreenButton.addEventListener("click", function (event) {
        event.stopPropagation();
        toggleLightboxFullscreen();
      });
      slider.addEventListener("input", function () {
        selectedImage = Number(slider.value) - 1;
        update();
      });
      speedSelect.addEventListener("change", function () {
        setPlaybackSpeed(speedSelect.value);
      });
      windowLevelSlider.addEventListener("input", function () {
        setWindowLevel(windowLevelSlider.value);
      });
      windowLevelReset.addEventListener("click", function () {
        setWindowLevel(openingWindowLevel);
      });
      windowWidthSlider.addEventListener("input", function () {
        setWindowWidth(windowWidthSlider.value);
      });
      windowWidthReset.addEventListener("click", function () {
        setWindowWidth(openingWindowWidth);
      });
      lightboxSlider.addEventListener("click", function (event) { event.stopPropagation(); });
      lightboxSlider.addEventListener("input", function () {
        selectedImage = Number(lightboxSlider.value) - 1;
        update();
      });
      lightboxSpeedSelect.addEventListener("click", function (event) { event.stopPropagation(); });
      lightboxSpeedSelect.addEventListener("change", function (event) {
        event.stopPropagation();
        setPlaybackSpeed(lightboxSpeedSelect.value);
      });
      lightboxWindowLevelSlider.addEventListener("click", function (event) { event.stopPropagation(); });
      lightboxWindowLevelSlider.addEventListener("input", function () {
        setWindowLevel(lightboxWindowLevelSlider.value);
      });
      lightboxWindowWidthSlider.addEventListener("click", function (event) { event.stopPropagation(); });
      lightboxWindowWidthSlider.addEventListener("input", function () {
        setWindowWidth(lightboxWindowWidthSlider.value);
      });
      lightboxZoomSlider.addEventListener("click", function (event) { event.stopPropagation(); });
      lightboxZoomSlider.addEventListener("input", function () {
        setLightboxZoom(lightboxZoomSlider.value);
      });
      lightboxCenterButton.addEventListener("click", function (event) {
        event.stopPropagation();
        centerLightboxZoom();
      });
      lightboxAxisSelect.addEventListener("click", function (event) { event.stopPropagation(); });
      lightboxAxisSelect.addEventListener("change", function (event) {
        event.stopPropagation();
        var acquisition = lightboxAcquisitions ? null : lightboxAcquisition || acquisitionsFor(current())[0];
        if (!acquisition) return;
        setAxisSelection(acquisition, lightboxAxisSelect.value);
      });
      lightboxCubeControls.addEventListener("click", function (event) { event.stopPropagation(); });
      lightboxAxisCube.addEventListener("click", function (event) {
        event.stopPropagation();
        cycleMprAxis();
      });
      lightboxModeCube.addEventListener("click", function (event) {
        event.stopPropagation();
        toggle2d3dAxis();
      });
      imageButton.addEventListener("click", openLightbox);
      document.getElementById("caseLightboxClose").addEventListener("click", closeLightbox);
      document.getElementById("caseLightboxPrev").addEventListener("click", function (event) { event.stopPropagation(); step(-1); });
      document.getElementById("caseLightboxNext").addEventListener("click", function (event) { event.stopPropagation(); step(1); });
      document.getElementById("caseLightboxControlPrev").addEventListener("click", function (event) { event.stopPropagation(); step(-1); });
      document.getElementById("caseLightboxControlNext").addEventListener("click", function (event) { event.stopPropagation(); step(1); });
      lightboxControls.addEventListener("click", function (event) { event.stopPropagation(); });
      lightbox.addEventListener("click", closeLightbox);
      lightboxImages.addEventListener("click", function (event) { event.stopPropagation(); });
      lightboxImages.addEventListener("dblclick", function (event) {
        var figure = event.target.closest("figure");
        if (!figure) return;
        event.preventDefault();
        event.stopPropagation();
        toggleFocusedLightboxImage(figure);
      });
      lightboxImages.addEventListener("wheel", function (event) {
        if (lightbox.hidden) return;
        event.preventDefault();
        event.stopPropagation();
        var rect = lightboxImages.getBoundingClientRect();
        var figure = event.target.closest("figure");
        var panKey = figure ? figure.dataset.panKey : null;
        if (figure) rect = figure.getBoundingClientRect();
        var centerPoint = {
          x: event.clientX - rect.left - (rect.width / 2),
          y: event.clientY - rect.top - (rect.height / 2)
        };
        setLightboxZoom(lightboxZoom + (event.deltaY < 0 ? 10 : -10), centerPoint, panKey);
      }, { passive: false });
      lightboxImages.addEventListener("pointerdown", function (event) {
        event.stopPropagation();
        var figure = event.target.closest("figure");
        var panKey = figure ? figure.dataset.panKey : null;
        var mprAction = event.target.closest("[data-mpr-action]");
        if (figure && mprAction && figure.classList.contains("has-mpr-axes")) {
          event.preventDefault();
          lightboxPointers[event.pointerId] = { x: event.clientX, y: event.clientY, panKey: panKey, figure: figure };
          try { lightboxImages.setPointerCapture(event.pointerId); } catch (error) {}
          scheduleMprLongPress(event, figure, mprAction.dataset.mprAction, panKey);
          return;
        }
        if (figure && figure.classList.contains("has-mpr-axes")) {
          var guideAction = mprActionFromPoint(event, figure);
          if (guideAction) {
            event.preventDefault();
            lightboxPointers[event.pointerId] = { x: event.clientX, y: event.clientY, panKey: panKey, figure: figure };
            try { lightboxImages.setPointerCapture(event.pointerId); } catch (error) {}
            scheduleMprLongPress(event, figure, guideAction, panKey);
            return;
          }
        }
        if (lightboxMprDrag) {
          event.preventDefault();
          return;
        }
        lightboxPointers[event.pointerId] = { x: event.clientX, y: event.clientY, panKey: panKey, figure: figure };
        try { lightboxImages.setPointerCapture(event.pointerId); } catch (error) {}
        if (pointerList().length >= 2) {
          event.preventDefault();
          startLightboxPinch();
          return;
        }
        if (lightboxZoom <= 100) return;
        event.preventDefault();
        var pan = lightboxPan(panKey);
        lightboxDrag = { id: event.pointerId, panKey: panKey, x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
      });
      lightboxImages.addEventListener("pointermove", function (event) {
        if (!lightboxPointers[event.pointerId]) return;
        event.stopPropagation();
        lightboxPointers[event.pointerId].x = event.clientX;
        lightboxPointers[event.pointerId].y = event.clientY;
        updateMprLongPress(event);
        if (lightboxMprDrag && lightboxMprDrag.id === event.pointerId) {
          event.preventDefault();
          moveMprGuideDrag(event);
          return;
        }
        var points = pointerList();
        if (points.length >= 2 && lightboxPinch) {
          event.preventDefault();
          var nextZoom = lightboxPinch.zoom * (pinchDistance(points) / lightboxPinch.distance);
          setLightboxZoom(nextZoom, pinchCenter(points), lightboxPinch.panKey);
          return;
        }
        if (!lightboxDrag || lightboxDrag.id !== event.pointerId) return;
        event.preventDefault();
        var dragPan = lightboxPan(lightboxDrag.panKey);
        dragPan.x = lightboxDrag.panX + event.clientX - lightboxDrag.x;
        dragPan.y = lightboxDrag.panY + event.clientY - lightboxDrag.y;
        updateZoomTransform();
      });
      lightboxImages.addEventListener("pointerup", function (event) {
        event.stopPropagation();
        delete lightboxPointers[event.pointerId];
        clearMprLongPress();
        endMprGuideDrag(event);
        if (lightboxDrag && lightboxDrag.id === event.pointerId) lightboxDrag = null;
        try { lightboxImages.releasePointerCapture(event.pointerId); } catch (error) {}
        if (pointerList().length >= 2) startLightboxPinch();
        else lightboxPinch = null;
      });
      lightboxImages.addEventListener("pointercancel", function (event) {
        delete lightboxPointers[event.pointerId];
        clearMprLongPress();
        endMprGuideDrag(event);
        if (lightboxDrag && lightboxDrag.id === event.pointerId) lightboxDrag = null;
        if (pointerList().length < 2) lightboxPinch = null;
      });
      document.addEventListener("fullscreenchange", updateFullscreenButton);
      document.addEventListener("webkitfullscreenchange", updateFullscreenButton);
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          if (!lightbox.hidden) closeLightbox();
          else goBack();
        }
        if (event.key === "ArrowLeft") step(-1);
        if (event.key === "ArrowRight") step(1);
      });
      window.addEventListener("beforeunload", function () { setPlaying(false); });

      if (accessCancel) accessCancel.addEventListener("click", goBack);
      if (accessForm) {
        accessForm.addEventListener("submit", function (event) {
          event.preventDefault();
          var normalized = normalizeMetalCode(accessCode.value);
          hashText(normalized).then(function (hash) {
            if (hash === metalAccessHash || normalized === metalAccessHash) {
              storeMetalAccess();
              unlockMetalCases();
              return;
            }
            if (accessError) accessError.hidden = false;
            accessCode.select();
          });
        });
      }
      if (storedMetalAccessIsValid()) unlockMetalCases();
      else if (accessCode) accessCode.focus();
    })();
