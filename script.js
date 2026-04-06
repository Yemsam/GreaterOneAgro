document.addEventListener('DOMContentLoaded', async () => {
  const loadPartial = async (selector, url) => {
    const mount = document.querySelector(selector);

    if (!mount) {
      return;
    }

    try {
      const response = await fetch(url, { cache: 'no-cache' });

      if (!response.ok) {
        throw new Error(`Unable to load ${url}`);
      }

      mount.outerHTML = await response.text();
    } catch {
      mount.innerHTML = '';
    }
  };

  await Promise.all([
    loadPartial('[data-site-header], header.site-header', 'header.html'),
    loadPartial('[data-site-footer], footer', 'footer.html')
  ]);

  const currentYear = new Date().getFullYear();
  document.querySelectorAll('[data-current-year]').forEach((element) => {
    element.textContent = String(currentYear);
  });

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      document.body.classList.toggle('menu-open', nav.classList.contains('open'));
      toggle.setAttribute('aria-expanded', String(nav.classList.contains('open')));
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        document.body.classList.remove('menu-open');
      });
    });
  }

  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((link) => {
    if (link.getAttribute('href') === current) {
      link.classList.add('active');
    }
  });

  document.querySelectorAll('.floating-whatsapp').forEach((link) => {
    link.setAttribute('aria-label', 'Chat on WhatsApp');
    link.setAttribute('title', 'Chat on WhatsApp');
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

  const autoplayVideos = document.querySelectorAll('[data-autoplay-video]');
  const playVideo = (video) => {
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  };

  if (autoplayVideos.length > 0) {
    if ('IntersectionObserver' in window) {
      const videoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video = entry.target;
            if (entry.isIntersecting) {
              playVideo(video);
            } else {
              video.pause();
            }
          });
        },
        { threshold: 0.55 }
      );

      autoplayVideos.forEach((video) => {
        video.muted = true;
        video.setAttribute('playsinline', '');
        videoObserver.observe(video);
      });
    } else {
      autoplayVideos.forEach((video) => playVideo(video));
    }
  }

  const heroSlider = document.querySelector('[data-hero-slider]');
  if (heroSlider) {
    const heroVideo = heroSlider.querySelector('[data-hero-video]');
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

    if (heroVideo && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const activateHeroVideo = () => {
        heroSlider.classList.add('has-hero-video');
      };

      const playHeroVideo = () => {
        const playPromise = heroVideo.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise
            .then(activateHeroVideo)
            .catch(() => {});
        }
      };

      heroVideo.muted = true;
      heroVideo.setAttribute('playsinline', '');
      heroVideo.addEventListener('canplay', activateHeroVideo, { once: true });

      if ('IntersectionObserver' in window) {
        const heroVideoObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                playHeroVideo();
              } else {
                heroVideo.pause();
              }
            });
          },
          { threshold: 0.2 }
        );

        heroVideoObserver.observe(heroSlider);
      } else {
        playHeroVideo();
      }
    }

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
  const appForm = document.querySelector('[data-application-form]');
  const appStepTriggers = Array.from(document.querySelectorAll('[data-app-step-trigger]'));
  const appStepPanels = Array.from(document.querySelectorAll('[data-app-step-panel]'));
  const appNextButtons = Array.from(document.querySelectorAll('[data-app-next]'));
  const appBackButtons = Array.from(document.querySelectorAll('[data-app-back]'));
  const makePaymentButton = document.querySelector('[data-app-make-payment]');
  const paymentOptions = document.querySelector('[data-payment-options]');
  const paymentMethodSelect = appForm?.querySelector('select[name="paymentMethod"]');
  const confirmApplicationInput = appForm?.querySelector('input[name="confirmApplication"]');
  const finalSubmitButton = appForm?.querySelector('button[type="submit"]');
  const investmentTypeSelect = appForm?.querySelector('select[name="investmentType"]');
  const acreSelect = appForm?.querySelector('[data-acre-select]');
  const customAcreWrap = appForm?.querySelector('[data-custom-acre-wrap]');
  const customAcreInput = appForm?.querySelector('[data-custom-acre-input]');
  const summaryContainer = appForm?.querySelector('[data-application-summary]');
  const estimatedAmount = appForm?.querySelector('[data-estimated-amount]');

  const formatCurrency = (amount) =>
    `₦${Number(amount || 0).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;

  const getSelectedAcreage = () => {
    if (!acreSelect) {
      return 0;
    }

    if (acreSelect.value === 'others') {
      const customValue = Number(customAcreInput?.value || 0);
      return customValue;
    }

    return Number(acreSelect.value || 0);
  };

  const updateEstimatedAmount = () => {
    const acres = getSelectedAcreage();
    const amount = acres > 0 ? acres * 710600 : 0;

    if (estimatedAmount) {
      estimatedAmount.textContent = formatCurrency(amount);
    }
  };

  const setStep = (step) => {
    appStepPanels.forEach((panel) => {
      const isActive = panel.getAttribute('data-app-step-panel') === String(step);
      panel.hidden = !isActive;
      panel.classList.toggle('is-active', isActive);
    });

    appStepTriggers.forEach((trigger) => {
      const isActive = trigger.getAttribute('data-app-step-trigger') === String(step);
      trigger.classList.toggle('is-active', isActive);
      trigger.setAttribute('aria-current', isActive ? 'step' : 'false');
    });
  };

  const validateStep1 = () => {
    if (!appForm) {
      return false;
    }

    const stepOneFields = [
      'fullName',
      'phone',
      'email',
      'address',
      'nextOfKinName',
      'nextOfKinPhone',
      'nextOfKinRelationship'
    ];

    for (const fieldName of stepOneFields) {
      const field = appForm.querySelector(`[name="${fieldName}"]`);
      if (field && !field.value.trim()) {
        field.reportValidity();
        field.focus();
        return false;
      }
    }

    return true;
  };

  const validateStep2 = () => {
    if (!investmentTypeSelect || !acreSelect) {
      return false;
    }

    if (!investmentTypeSelect.value) {
      investmentTypeSelect.reportValidity();
      investmentTypeSelect.focus();
      return false;
    }

    if (!acreSelect.value) {
      acreSelect.reportValidity();
      acreSelect.focus();
      return false;
    }

    if (acreSelect.value === 'others') {
      const customValue = customAcreInput?.value.trim() || '';

      if (!/^\d+(\.\d+)?$/.test(customValue)) {
        customAcreInput?.setCustomValidity('Enter a valid number using digits and optional decimal point.');
        customAcreInput?.reportValidity();
        customAcreInput?.focus();
        return false;
      }

      const customNumber = Number(customValue);
      if (customNumber <= 3) {
        customAcreInput?.setCustomValidity('Custom acreage must be greater than 3.');
        customAcreInput?.reportValidity();
        customAcreInput?.focus();
        return false;
      }

      customAcreInput?.setCustomValidity('');
    }

    return true;
  };

  const renderSummary = () => {
    if (!appForm || !summaryContainer) {
      return;
    }

    const formData = new FormData(appForm);
    const acres = getSelectedAcreage();
    const amount = acres * 710600;
    const investmentType = String(formData.get('investmentType') || '')
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    summaryContainer.innerHTML = `
      <p><strong>Full Name:</strong> ${String(formData.get('fullName') || '')}</p>
      <p><strong>Phone:</strong> ${String(formData.get('phone') || '')}</p>
      <p><strong>Email:</strong> ${String(formData.get('email') || '')}</p>
      <p><strong>Address:</strong> ${String(formData.get('address') || '')}</p>
      <p><strong>Next of Kin:</strong> ${String(formData.get('nextOfKinName') || '')}</p>
      <p><strong>Next of Kin Phone:</strong> ${String(formData.get('nextOfKinPhone') || '')}</p>
      <p><strong>Relationship:</strong> ${String(formData.get('nextOfKinRelationship') || '')}</p>
      <p><strong>Investment Type:</strong> ${investmentType}</p>
      <p><strong>Total Acres:</strong> ${acres}</p>
      <p><strong>Estimated Amount:</strong> ${formatCurrency(amount)}</p>
    `;
  };

  const closeApplicationModal = () => {
    if (!appModal) {
      return;
    }

    appModal.hidden = true;
    document.body.style.overflow = '';
    setStep(1);
    if (paymentOptions) {
      paymentOptions.hidden = true;
    }
    if (paymentMethodSelect) {
      paymentMethodSelect.disabled = true;
      paymentMethodSelect.value = '';
    }
    if (confirmApplicationInput) {
      confirmApplicationInput.disabled = true;
      confirmApplicationInput.checked = false;
    }
    if (finalSubmitButton) {
      finalSubmitButton.disabled = true;
      finalSubmitButton.textContent = 'Complete Application and Payment';
    }
  };

  if (openAppBtn && appModal) {
    openAppBtn.addEventListener('click', () => {
      appModal.hidden = false;
      document.body.style.overflow = 'hidden';
      setStep(1);
      updateEstimatedAmount();
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

  if (acreSelect) {
    acreSelect.addEventListener('change', () => {
      const showCustom = acreSelect.value === 'others';
      if (customAcreWrap) {
        customAcreWrap.hidden = !showCustom;
      }

      if (!showCustom && customAcreInput) {
        customAcreInput.value = '';
        customAcreInput.setCustomValidity('');
      }

      updateEstimatedAmount();
    });
  }

  if (customAcreInput) {
    customAcreInput.addEventListener('input', () => {
      const sanitized = customAcreInput.value
        .replace(/[^0-9.]/g, '')
        .replace(/(\..*)\./g, '$1');

      customAcreInput.value = sanitized;
      customAcreInput.setCustomValidity('');
      updateEstimatedAmount();
    });
  }

  appNextButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetStep = Number(button.getAttribute('data-app-next'));

      if (targetStep === 2 && !validateStep1()) {
        return;
      }

      if (targetStep === 3) {
        if (!validateStep2()) {
          return;
        }
        renderSummary();
      }

      setStep(targetStep);
    });
  });

  appBackButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetStep = Number(button.getAttribute('data-app-back'));
      setStep(targetStep);
    });
  });

  makePaymentButton?.addEventListener('click', () => {
    if (!validateStep1() || !validateStep2()) {
      return;
    }

    renderSummary();

    if (paymentOptions) {
      paymentOptions.hidden = false;
    }

    if (paymentMethodSelect) {
      paymentMethodSelect.disabled = false;
    }

    if (confirmApplicationInput) {
      confirmApplicationInput.disabled = false;
    }

    if (finalSubmitButton) {
      finalSubmitButton.disabled = false;
    }
  });

  if (appForm) {
    appForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!validateStep1() || !validateStep2()) {
        return;
      }

      if (paymentMethodSelect && !paymentMethodSelect.value) {
        paymentMethodSelect.reportValidity();
        paymentMethodSelect.focus();
        return;
      }

      if (confirmApplicationInput && !confirmApplicationInput.checked) {
        confirmApplicationInput.reportValidity();
        confirmApplicationInput.focus();
        return;
      }

      const submitButton = appForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton?.textContent || '';
      const formData = new FormData(appForm);
      const acres = getSelectedAcreage();
      const amountInNaira = acres * 710600;
      const endpoint = appForm.getAttribute('data-checkout-endpoint') || '/api/create-checkout';
      const payload = {
        amountInNaira,
        email: String(formData.get('email') || ''),
        fullName: String(formData.get('fullName') || ''),
        phone: String(formData.get('phone') || ''),
        slots: String(acres || ''),
        acres: String(acres || ''),
        investmentType: String(formData.get('investmentType') || ''),
        nextOfKinName: String(formData.get('nextOfKinName') || ''),
        nextOfKinPhone: String(formData.get('nextOfKinPhone') || ''),
        nextOfKinRelationship: String(formData.get('nextOfKinRelationship') || ''),
        paymentMethod: String(formData.get('paymentMethod') || ''),
        notes: String(formData.get('notes') || '')
      };

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Redirecting to secure checkout...';
      }

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok || !data.url) {
          throw new Error(data.error || 'Unable to start secure checkout. Please try again.');
        }

        window.location.href = data.url;
      } catch (error) {
        window.alert(error.message || 'Unable to start secure checkout. Please try again.');

        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
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
