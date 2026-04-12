(function () {
  function initNav() {
    var i18n = window.FishFeederI18n;
    var nav = document.getElementById("site-nav");
    var toggle = document.querySelector(".menu-toggle");
    var page = document.body ? document.body.getAttribute("data-page") : "";

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var isOpen = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
      });
    }

    if (nav) {
      nav.querySelectorAll("a").forEach(function (link) {
        var href = link.getAttribute("href") || "";
        if (
          (page === "home" && href.indexOf("index.html") !== -1) ||
          (page === "specs" && href.indexOf("specs.html") !== -1) ||
          (page === "gallery" && href.indexOf("gallery.html") !== -1) ||
          (page === "simulator" && href.indexOf("simulator.html") !== -1)
        ) {
          link.classList.add("is-active");
        }
      });
    }

    var yearNode = document.getElementById("current-year");
    if (yearNode) {
      yearNode.textContent = String(new Date().getFullYear());
    }

    document.querySelectorAll("[data-lang-choice]").forEach(function (button) {
      button.addEventListener("click", function () {
        if (i18n) {
          i18n.setLanguage(button.getAttribute("data-lang-choice"));
        }
      });
    });

    if (i18n) {
      i18n.applyTranslations(document);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNav);
  } else {
    initNav();
  }
})();
