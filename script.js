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
  const confirmApplicationInput = appForm?.querySelector('[data-confirm-application]');
  const investmentTypeSelect = appForm?.querySelector('select[name="investmentType"]');
  const acreSelect = appForm?.querySelector('[data-acre-select]');
  const customAcreWrap = appForm?.querySelector('[data-custom-acre-wrap]');
  const customAcreInput = appForm?.querySelector('[data-custom-acre-input]');
  const relationshipSelect = appForm?.querySelector('[data-relationship-select]');
  const relationshipOtherWrap = appForm?.querySelector('[data-relationship-other-wrap]');
  const relationshipOtherInput = appForm?.querySelector('[data-relationship-other-input]');
  const bankTransferToggle = appForm?.querySelector('[data-bank-transfer-toggle]');
  const bankTransferDetails = appForm?.querySelector('[data-bank-transfer-details]');
  const summaryContainer = appForm?.querySelector('[data-application-summary]');
  const estimatedAmount = appForm?.querySelector('[data-estimated-amount]');
  const appError = appForm?.querySelector('[data-app-error]');

  const setAppError = (message = '') => {
    if (appError) {
      appError.textContent = message;
    }
  };

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

  const getValidatedRelationship = () => {
    const selectedRelationship = String(relationshipSelect?.value || '').trim();

    if (!selectedRelationship) {
      return '';
    }

    if (selectedRelationship !== 'Other') {
      return selectedRelationship;
    }

    return String(relationshipOtherInput?.value || '').trim();
  };

  const isValidEmail = (value) => /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);
  const isValidPhoneWithCountryCode = (value) => /^\+[1-9]\d{7,14}$/.test(value);
  const isValidRelationshipText = (value) => /^[A-Za-z][A-Za-z\s'-]{1,40}$/.test(value);

  const updateEstimatedAmount = () => {
    const acres = getSelectedAcreage();
    const amount = acres > 0 ? acres * 710600 : 0;

    if (estimatedAmount) {
      estimatedAmount.textContent = formatCurrency(amount);
    }
  };

  const setStep = (step) => {
    setAppError('');

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

    const emailField = appForm.querySelector('[name="email"]');
    if (emailField && emailField.value.trim() && !isValidEmail(emailField.value.trim())) {
      setAppError('Please enter a valid email address (example: name@example.com).');
      emailField.focus();
      return false;
    }

    const phoneField = appForm.querySelector('[name="phone"]');
    if (phoneField && phoneField.value.trim() && !isValidPhoneWithCountryCode(phoneField.value.trim())) {
      setAppError('Phone number must include country code, e.g. +2347050903309.');
      phoneField.focus();
      return false;
    }

    const kinPhoneField = appForm.querySelector('[name="nextOfKinPhone"]');
    if (kinPhoneField && kinPhoneField.value.trim() && !isValidPhoneWithCountryCode(kinPhoneField.value.trim())) {
      setAppError('Next of kin phone must include country code, e.g. +2348012345678.');
      kinPhoneField.focus();
      return false;
    }

    if (relationshipSelect?.value === 'Other') {
      const customRelationship = String(relationshipOtherInput?.value || '').trim();

      if (!customRelationship) {
        setAppError('Please specify the relationship when you select Other.');
        relationshipOtherInput?.focus();
        return false;
      }

      if (!isValidRelationshipText(customRelationship)) {
        setAppError('Relationship must contain letters only (numbers and symbols are not allowed).');
        relationshipOtherInput?.focus();
        return false;
      }
    }

    if (relationshipOtherInput && relationshipOtherInput.value.trim() && !isValidRelationshipText(relationshipOtherInput.value.trim())) {
      setAppError('Relationship must contain letters only (numbers and symbols are not allowed).');
      relationshipOtherInput.focus();
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!investmentTypeSelect || !acreSelect) {
      return false;
    }

    if (!investmentTypeSelect.value) {
      setAppError('Please select an investment type before continuing.');
      investmentTypeSelect.focus();
      return false;
    }

    if (!acreSelect.value) {
      setAppError('Please select your acreage before continuing.');
      acreSelect.focus();
      return false;
    }

    if (acreSelect.value === 'others') {
      const customValue = customAcreInput?.value.trim() || '';

      if (!/^\d+(\.\d+)?$/.test(customValue)) {
        customAcreInput?.setCustomValidity('Enter a valid number using digits and optional decimal point.');
        setAppError('Custom acreage accepts numbers only (with optional decimal point).');
        customAcreInput?.focus();
        return false;
      }

      const customNumber = Number(customValue);
      if (customNumber <= 3) {
        customAcreInput?.setCustomValidity('Custom acreage must be greater than 3.');
        setAppError('Custom acreage must be greater than 3.');
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
    const relationship = getValidatedRelationship();
    const investmentType = String(formData.get('investmentType') || '')
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    const summaryRows = [
      ['Full Name', String(formData.get('fullName') || '').trim()],
      ['Phone', String(formData.get('phone') || '').trim()],
      ['Email', String(formData.get('email') || '').trim()],
      ['Occupation', String(formData.get('occupation') || '').trim()],
      ['Address', String(formData.get('address') || '').trim()],
      ['Next of Kin', String(formData.get('nextOfKinName') || '').trim()],
      ['Next of Kin Phone', String(formData.get('nextOfKinPhone') || '').trim()],
      ['Relationship', relationship],
      ['Investment Type', investmentType],
      ['Total Acres', acres > 0 ? String(acres) : ''],
      ['Estimated Amount', amount > 0 ? formatCurrency(amount) : '']
    ].filter(([, value]) => value);

    summaryContainer.innerHTML = summaryRows.length
      ? summaryRows.map(([label, value]) => `<p><strong>${label}:</strong> ${value}</p>`).join('')
      : '<p>No details entered yet.</p>';
  };

  const closeApplicationModal = () => {
    if (!appModal) {
      return;
    }

    appModal.hidden = true;
    document.body.style.overflow = '';
    setAppError('');
    setStep(1);
    appForm?.reset();
    if (confirmApplicationInput) {
      confirmApplicationInput.checked = false;
    }
    if (relationshipOtherWrap) {
      relationshipOtherWrap.hidden = true;
    }
    if (customAcreWrap) {
      customAcreWrap.hidden = true;
    }
    if (bankTransferDetails) {
      bankTransferDetails.hidden = true;
    }
    updateEstimatedAmount();
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
      setAppError('');
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
      setAppError('');
      const sanitized = customAcreInput.value
        .replace(/[^0-9.]/g, '')
        .replace(/(\..*)\./g, '$1');

      customAcreInput.value = sanitized;
      customAcreInput.setCustomValidity('');
      updateEstimatedAmount();
    });
  }

  if (relationshipSelect) {
    relationshipSelect.addEventListener('change', () => {
      setAppError('');
      const showOther = relationshipSelect.value === 'Other';
      if (relationshipOtherWrap) {
        relationshipOtherWrap.hidden = !showOther;
      }

      if (!showOther && relationshipOtherInput) {
        relationshipOtherInput.value = '';
      }
    });
  }

  if (relationshipOtherInput) {
    relationshipOtherInput.addEventListener('input', () => {
      setAppError('');
      relationshipOtherInput.value = relationshipOtherInput.value.replace(/[^A-Za-z\s'-]/g, '');
    });
  }

  appNextButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setAppError('');
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

      if (targetStep === 4) {
        if (!confirmApplicationInput || !confirmApplicationInput.checked) {
          setAppError('Please select the confirmation checkbox before proceeding to payment.');
          confirmApplicationInput?.focus();
          return;
        }
      }

      setStep(targetStep);
    });
  });

  appBackButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setAppError('');
      const targetStep = Number(button.getAttribute('data-app-back'));
      setStep(targetStep);
    });
  });

  bankTransferToggle?.addEventListener('click', () => {
    if (bankTransferDetails) {
      bankTransferDetails.hidden = false;
    }
  });

  if (appForm) {
    appForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      // Submission is handled via payment method buttons in step 4.
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
