(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var openBtn = document.getElementById("menu-open");
  var closeBtn = document.getElementById("menu-close");
  var menu = document.getElementById("menu");

  function focusables() {
    return menu.querySelectorAll("a[href], button:not([disabled])");
  }

  function shut(returnFocus) {
    menu.hidden = true;
    document.body.classList.remove("menu-open");
    openBtn.setAttribute("aria-expanded", "false");
    if (returnFocus) openBtn.focus();
  }

  function openMenu() {
    menu.hidden = false;
    document.body.classList.add("menu-open");
    openBtn.setAttribute("aria-expanded", "true");
    closeBtn.focus();
  }

  if (openBtn && closeBtn && menu) {
    openBtn.addEventListener("click", openMenu);
    closeBtn.addEventListener("click", function () { shut(true); });
    menu.addEventListener("click", function (event) {
      if (event.target.closest("a[href]")) shut(false);
    });
    document.addEventListener("keydown", function (event) {
      if (menu.hidden) return;
      if (event.key === "Escape") {
        event.preventDefault();
        shut(true);
        return;
      }
      if (event.key !== "Tab") return;
      var nodes = focusables();
      if (!nodes.length) return;
      var first = nodes[0];
      var last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    window.matchMedia("(min-width: 960px)").addEventListener("change", function (query) {
      if (query.matches && !menu.hidden) shut(false);
    });
  }

  var reveals = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { observer.observe(el); });
  }

  var nums = document.querySelectorAll("[data-count]");
  function showFinal(el) {
    el.textContent = el.getAttribute("data-count");
  }
  if (reduce || !("IntersectionObserver" in window)) {
    nums.forEach(showFinal);
    return;
  }
  nums.forEach(function (el) { el.textContent = "0"; });
  var countObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var started = performance.now();
      function tick(now) {
        var progress = Math.min(1, (now - started) / 1100);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = String(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      countObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  nums.forEach(function (el) { countObserver.observe(el); });
})();
