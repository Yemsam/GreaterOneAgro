document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(nav.classList.contains('open')));
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => nav.classList.remove('open'));
    });
  }

  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((link) => {
    if (link.getAttribute('href') === current) {
      link.classList.add('active');
    }
  });

  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  const heroSlider = document.querySelector('[data-hero-slider]');
  if (heroSlider) {
    const heroSlides = heroSlider.querySelectorAll('[data-hero-slide]');
    const heroPrev = heroSlider.querySelector('[data-hero-prev]');
    const heroNext = heroSlider.querySelector('[data-hero-next]');
    const heroDots = heroSlider.querySelectorAll('[data-hero-dot]');

    let heroIndex = 0;
    let heroTimer;

    const showHeroSlide = (index) => {
      heroSlides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      heroDots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === index);
      });

      heroIndex = index;
    };

    const nextHeroSlide = () => {
      const nextIndex = (heroIndex + 1) % heroSlides.length;
      showHeroSlide(nextIndex);
    };

    const prevHeroSlide = () => {
      const nextIndex = (heroIndex - 1 + heroSlides.length) % heroSlides.length;
      showHeroSlide(nextIndex);
    };

    const resetHeroTimer = () => {
      if (heroTimer) {
        clearInterval(heroTimer);
      }

      heroTimer = setInterval(nextHeroSlide, 6000);
    };

    heroPrev?.addEventListener('click', () => {
      prevHeroSlide();
      resetHeroTimer();
    });

    heroNext?.addEventListener('click', () => {
      nextHeroSlide();
      resetHeroTimer();
    });

    heroDots.forEach((dot, dotIndex) => {
      dot.addEventListener('click', () => {
        showHeroSlide(dotIndex);
        resetHeroTimer();
      });
    });

    if (heroSlides.length > 1) {
      resetHeroTimer();
    }
  }

  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('.testimonial-track');
    const slides = carousel.querySelectorAll('.testimonial-slide');
    const prev = carousel.querySelector('[data-prev]');
    const next = carousel.querySelector('[data-next]');

    if (!track || slides.length === 0) {
      return;
    }

    let index = 0;

    const render = () => {
      track.style.transform = `translateX(-${index * 100}%)`;
    };

    prev?.addEventListener('click', () => {
      index = (index - 1 + slides.length) % slides.length;
      render();
    });

    next?.addEventListener('click', () => {
      index = (index + 1) % slides.length;
      render();
    });

    if (slides.length > 1) {
      setInterval(() => {
        index = (index + 1) % slides.length;
        render();
      }, 5000);
    }
  });

  const appModal = document.querySelector('[data-application-modal]');
  const openAppBtn = document.querySelector('[data-open-application]');
  const closeAppBtn = document.querySelector('[data-close-application]');

  const closeApplicationModal = () => {
    if (!appModal) {
      return;
    }

    appModal.hidden = true;
    document.body.style.overflow = '';
  };

  if (openAppBtn && appModal) {
    openAppBtn.addEventListener('click', () => {
      appModal.hidden = false;
      document.body.style.overflow = 'hidden';
    });

    closeAppBtn?.addEventListener('click', closeApplicationModal);

    appModal.addEventListener('click', (event) => {
      if (event.target === appModal) {
        closeApplicationModal();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !appModal.hidden) {
        closeApplicationModal();
      }
    });
  }

  const galleryFigures = Array.from(document.querySelectorAll('.gallery-grid figure'));
  const galleryLightbox = document.querySelector('[data-gallery-lightbox]');
  const galleryLightboxTitle = document.querySelector('#galleryLightboxTitle');
  const lightboxMainImage = document.querySelector('[data-lightbox-main-image]');
  const lightboxCaption = document.querySelector('[data-lightbox-caption]');
  const lightboxThumbs = document.querySelector('[data-lightbox-thumbs]');
  const lightboxPrev = document.querySelector('[data-lightbox-prev]');
  const lightboxNext = document.querySelector('[data-lightbox-next]');
  const lightboxClose = document.querySelector('[data-lightbox-close]');

  if (galleryFigures.length > 0 && galleryLightbox && lightboxMainImage && lightboxCaption && lightboxThumbs) {
    let activeIndex = 0;
    let visibleSet = [];
    let eventItems = [];

    const closeGalleryLightbox = () => {
      galleryLightbox.hidden = true;
      document.body.style.overflow = '';
    };

    const buildVisibleSet = (startIndex) => {
      const set = [];

      for (let i = 0; i < Math.min(6, eventItems.length); i += 1) {
        set.push((startIndex + i) % eventItems.length);
      }

      return set;
    };

    const renderLightbox = () => {
      const item = eventItems[activeIndex];
      lightboxMainImage.src = item.src;
      lightboxMainImage.alt = item.alt;
      lightboxCaption.textContent = item.caption;

      lightboxThumbs.innerHTML = '';

      visibleSet.forEach((index) => {
        const thumbButton = document.createElement('button');
        thumbButton.type = 'button';
        thumbButton.className = `lightbox-thumb${index === activeIndex ? ' is-active' : ''}`;
        thumbButton.setAttribute('aria-label', `View ${eventItems[index].caption || 'image'}`);

        thumbButton.innerHTML = `<img src="${eventItems[index].src}" alt="${eventItems[index].alt}">`;
        thumbButton.addEventListener('click', () => {
          activeIndex = index;
          visibleSet = buildVisibleSet(activeIndex);
          renderLightbox();
        });

        lightboxThumbs.appendChild(thumbButton);
      });
    };

    const buildEventItems = (figure) => {
      const image = figure.querySelector('img');
      const caption = figure.querySelector('figcaption');
      const src = image?.getAttribute('src') || '';
      const alt = image?.getAttribute('alt') || 'Gallery image';
      const captionText = caption?.textContent?.trim() || 'Gallery image';
      const extraImages = (figure.getAttribute('data-event-images') || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      const items = [{ src, alt, caption: `${captionText} - Photo 1` }];

      if (extraImages.length > 0) {
        extraImages.forEach((extraSrc, index) => {
          items.push({
            src: extraSrc,
            alt,
            caption: `${captionText} - Photo ${index + 2}`
          });
        });
      }

      while (items.length < 6) {
        items.push({ src, alt, caption: `${captionText} - Photo ${items.length + 1}` });
      }

      return items;
    };

    const showEvent = (figure) => {
      eventItems = buildEventItems(figure);
      activeIndex = 0;
      visibleSet = buildVisibleSet(activeIndex);
      renderLightbox();

      if (galleryLightboxTitle) {
        const eventName = figure.querySelector('figcaption')?.textContent?.trim() || 'Gallery Viewer';
        galleryLightboxTitle.textContent = eventName;
      }

      galleryLightbox.hidden = false;
      document.body.style.overflow = 'hidden';
    };

    const showNext = () => {
      activeIndex = (activeIndex + 1) % eventItems.length;
      visibleSet = buildVisibleSet(activeIndex);
      renderLightbox();
    };

    const showPrev = () => {
      activeIndex = (activeIndex - 1 + eventItems.length) % eventItems.length;
      visibleSet = buildVisibleSet(activeIndex);
      renderLightbox();
    };

    galleryFigures.forEach((figure) => {
      figure.style.cursor = 'pointer';
      figure.addEventListener('click', () => showEvent(figure));
    });

    lightboxNext?.addEventListener('click', showNext);
    lightboxPrev?.addEventListener('click', showPrev);
    lightboxClose?.addEventListener('click', closeGalleryLightbox);

    galleryLightbox.addEventListener('click', (event) => {
      if (event.target === galleryLightbox) {
        closeGalleryLightbox();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (galleryLightbox.hidden) {
        return;
      }

      if (event.key === 'Escape') {
        closeGalleryLightbox();
      }

      if (event.key === 'ArrowRight') {
        showNext();
      }

      if (event.key === 'ArrowLeft') {
        showPrev();
      }
    });
  }
});
