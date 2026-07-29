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

  // Tech Stack category tabs
  var catButtons = document.querySelectorAll('.stack-cat-btn');
  if (catButtons.length) {
    var revealPanel = function (panel) {
      var items = panel.querySelectorAll('.stagger-item');
      var alreadyRevealed = panel.dataset.revealed === 'true';
      items.forEach(function (item, i) {
        if (!alreadyRevealed) {
          item.style.transitionDelay = (i * STAGGER_STEP) + 's';
        }
        item.classList.add('is-visible');
      });
      panel.dataset.revealed = 'true';
    };

    catButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.classList.contains('is-active')) return;
        var category = btn.dataset.category;

        catButtons.forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
          b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
        });

        document.querySelectorAll('[data-category-panel]').forEach(function (panel) {
          if (panel.dataset.categoryPanel === category) {
            panel.hidden = false;
            revealPanel(panel);
          } else {
            panel.hidden = true;
          }
        });
      });
    });
  }

  // Contact form — реальная отправка на бэкенд FastAPI (/api/send-lead)
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');
  var submitBtn = document.getElementById('submitBtn');

  if (form) {
    var isSubmitting = false;

    // Текст кнопки по умолчанию (для восстановления после ошибки/успеха)
    var defaultBtnText = submitBtn ? submitBtn.textContent : 'Discuss Project';

    function setStatus(message, type) {
      if (!status) return;
      status.textContent = message;
      status.classList.remove('is-error', 'is-success');
      if (type) status.classList.add(type === 'error' ? 'is-error' : 'is-success');
    }

    function setLoading(loading) {
      isSubmitting = loading;
      if (!submitBtn) return;
      submitBtn.disabled = loading;
      submitBtn.textContent = loading ? 'Отправка...' : defaultBtnText;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (isSubmitting) return; // защита от повторного сабмита

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var nameField = document.getElementById('name');
      var contactField = document.getElementById('contact');
      var messageField = document.getElementById('message');

      var payload = {
        name: nameField ? nameField.value.trim() : '',
        contact: contactField ? contactField.value.trim() : '',
        // Бэкенд ждёт поле "text", а на фронте это <textarea name="message">
        text: messageField ? messageField.value.trim() : ''
      };

      setLoading(true);
      setStatus('Отправляем заявку...');

      fetch('/api/send-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          if (!response.ok) {
            // Пытаемся достать текст ошибки от FastAPI (Pydantic validation, 500 и т.д.)
            return response
              .json()
              .catch(function () { return {}; })
              .then(function (errBody) {
                var detail = errBody && errBody.detail
                  ? (Array.isArray(errBody.detail) ? errBody.detail.map(function (d) { return d.msg; }).join(', ') : errBody.detail)
                  : ('HTTP ' + response.status);
                throw new Error(detail);
              });
          }
          return response.json().catch(function () { return {}; });
        })
        .then(function () {
          setStatus('Спасибо! Ваша заявка получена — мы свяжемся с вами в ближайшее время.', 'success');
          form.reset();
        })
        .catch(function (err) {
          console.error('send-lead error:', err);
          setStatus('Не удалось отправить заявку. Проверьте соединение и попробуйте ещё раз, либо напишите нам напрямую.', 'error');
        })
        .finally(function () {
          setLoading(false);
        });
    });
  }
})();