document.addEventListener("DOMContentLoaded", async () => {
  const loadPartial = async (selector, url) => {
    const mount = document.querySelector(selector);

    if (!mount) {
      return;
    }

    try {
      const response = await fetch(url, { cache: "no-cache" });

      if (!response.ok) {
        throw new Error(`Unable to load ${url}`);
      }

      mount.outerHTML = await response.text();
    } catch {
      mount.remove();
    }
  };

  await Promise.all([
    loadPartial("[data-site-header], .site-header", "header.html"),
    loadPartial("[data-site-footer], .site-footer", "footer.html"),
  ]);

  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      document.body.classList.toggle("menu-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        document.body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const normalizePath = (pathname) => {
    if (!pathname || pathname === "/") {
      return "/";
    }

    return pathname.replace(/\/index\.html$/, "/").replace(/\/+$/, "") || "/";
  };

  const currentPath = normalizePath(window.location.pathname);

  document.querySelectorAll(".nav-links a").forEach((link) => {
    const href = link.getAttribute("href") || "";
    const resolvedHref = href.startsWith("/") ? href : `/${href}`;

    if (normalizePath(resolvedHref) === currentPath) {
      link.classList.add("active");
    }
  });

  document.querySelectorAll(".floating-whatsapp").forEach((link) => {
    link.setAttribute("aria-label", "Chat on WhatsApp");
    link.setAttribute("title", "Chat on WhatsApp");
  });

  const carousel = document.querySelector(
    "[data-hero-carousel], [data-hero-slider]",
  );

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
    const prevButton = carousel.querySelector("[data-hero-prev]");
    const nextButton = carousel.querySelector("[data-hero-next]");
    const dotsWrap = carousel.querySelector("[data-hero-dots]");
    const heroVideo = carousel.querySelector("[data-hero-video]");
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let activeIndex = 0;
    let timerId = null;

    const renderDots = () => {
      if (!dotsWrap) {
        return;
      }

      dotsWrap.innerHTML = slides
        .map(
          (_, index) =>
            `<button type="button" aria-label="Go to slide ${index + 1}" data-hero-dot="${index}"></button>`,
        )
        .join("");
    };

    const setActiveSlide = (index) => {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });

      carousel.querySelectorAll("[data-hero-dot]").forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
        dot.setAttribute(
          "aria-current",
          dotIndex === activeIndex ? "true" : "false",
        );
      });

      if (heroVideo) {
        carousel.classList.add("has-hero-video");
      }
    };

    const stopAutoplay = () => {
      if (timerId) {
        window.clearInterval(timerId);
        timerId = null;
      }
    };

    const startAutoplay = () => {
      stopAutoplay();
      timerId = window.setInterval(() => setActiveSlide(activeIndex + 1), 6500);
    };

    renderDots();
    setActiveSlide(0);

    if (!reducedMotion) {
      startAutoplay();
    }

    prevButton?.addEventListener("click", () => {
      setActiveSlide(activeIndex - 1);

      if (!reducedMotion) {
        startAutoplay();
      }
    });

    nextButton?.addEventListener("click", () => {
      setActiveSlide(activeIndex + 1);

      if (!reducedMotion) {
        startAutoplay();
      }
    });

    carousel.querySelectorAll("[data-hero-dot]").forEach((dot) => {
      dot.addEventListener("click", () => {
        const dotIndex = Number(dot.getAttribute("data-hero-dot"));
        setActiveSlide(dotIndex);

        if (!reducedMotion) {
          startAutoplay();
        }
      });
    });

    if (!reducedMotion) {
      carousel.addEventListener("pointerenter", stopAutoplay);
      carousel.addEventListener("pointerleave", startAutoplay);
      carousel.addEventListener("focusin", stopAutoplay);
      carousel.addEventListener("focusout", startAutoplay);

      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          stopAutoplay();
        } else {
          startAutoplay();
        }
      });
    }
  }

  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 },
    );

    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }
});
