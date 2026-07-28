(function () {
  'use strict';

  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Header background on scroll
  var header = document.getElementById('siteHeader');
  function onScroll() {
    if (window.scrollY > 12) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile nav toggle
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Scroll reveal
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Staggered fade-in-up reveal for grids (e.g. Tech Stack cards)
  var staggerGrids = document.querySelectorAll('.stagger-grid');
  var STAGGER_STEP = 0.05; // seconds between each card
  if (staggerGrids.length) {
    if ('IntersectionObserver' in window) {
      var staggerObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var items = entry.target.querySelectorAll('.stagger-item');
              items.forEach(function (item, i) {
                item.style.transitionDelay = (i * STAGGER_STEP) + 's';
                item.classList.add('is-visible');
              });
              staggerObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2, rootMargin: '0px 0px -40px 0px' }
      );
      staggerGrids.forEach(function (grid) { staggerObserver.observe(grid); });
    } else {
      document.querySelectorAll('.stagger-item').forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  // Contact form (client-side only, no backend wired up)
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      status.textContent = 'Thanks! Your message has been received — we\'ll be in touch shortly.';
      form.reset();
    });
  }
})();
