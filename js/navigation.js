(function () {
  function isCompactNavViewport() {
    return window.matchMedia("(max-width: 760px), (max-height: 500px) and (orientation: landscape) and (max-width: 980px)").matches;
  }

  function repositionLangSwitch() {
    var langSwitch = document.querySelector(".lang-switch");
    var actions = document.querySelector(".header-actions");
    var menuToggle = document.querySelector(".menu-toggle");
    var siteNav = document.getElementById("site-nav");
    if (!langSwitch || !actions || !menuToggle || !siteNav) {
      return;
    }
    if (isCompactNavViewport()) {
      if (langSwitch.parentElement !== actions) {
        actions.insertBefore(langSwitch, menuToggle);
      }
    } else if (langSwitch.parentElement !== siteNav) {
      siteNav.appendChild(langSwitch);
    }
  }

  function initNav() {
    var i18n = window.FishFeederI18n;
    var nav = document.getElementById("site-nav");
    var toggle = document.querySelector(".menu-toggle");
    var header = document.querySelector(".site-header");
    var page = document.body ? document.body.getAttribute("data-page") : "";

    repositionLangSwitch();

    function setMenuState(isOpen) {
      if (nav) {
        nav.classList.toggle("is-open", isOpen);
      }
      if (toggle) {
        toggle.setAttribute("aria-expanded", String(isOpen));
      }
      if (header) {
        header.classList.toggle("is-menu-open", isOpen);
      }
    }

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        setMenuState(!nav.classList.contains("is-open"));
      });
    }

    if (nav) {
      nav.querySelectorAll("a").forEach(function (link) {
        var href = link.getAttribute("href") || "";
        var isCurrentPage = false;
        if (
          (page === "home" && href.indexOf("index.html") !== -1) ||
          (page === "specs" && href.indexOf("specs.html") !== -1) ||
          (page === "gallery" && href.indexOf("gallery.html") !== -1) ||
          (page === "simulator" && href.indexOf("simulator.html") !== -1)
        ) {
          isCurrentPage = true;
        }
        link.classList.toggle("is-active", isCurrentPage);
        if (isCurrentPage) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }

        link.addEventListener("click", function () {
          if (isCompactNavViewport()) {
            setMenuState(false);
          }
        });
      });
    }

    var yearNode = document.getElementById("current-year");
    if (yearNode) {
      yearNode.textContent = String(new Date().getFullYear());
    }

    var langButtons = Array.from(document.querySelectorAll("[data-lang-choice]"));

    function updateLanguagePressedState() {
      var activeLanguage = i18n ? i18n.getLanguage() : "en";
      langButtons.forEach(function (button) {
        var selectedLanguage = button.getAttribute("data-lang-choice");
        button.setAttribute("aria-pressed", String(selectedLanguage === activeLanguage));
      });
    }

    langButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        if (i18n) {
          i18n.setLanguage(button.getAttribute("data-lang-choice"));
        }
        updateLanguagePressedState();
      });
    });

    if (i18n) {
      i18n.applyTranslations(document);
    }

    updateLanguagePressedState();
    setMenuState(false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNav);
  } else {
    initNav();
  }

  window.addEventListener("resize", repositionLangSwitch);
})();
