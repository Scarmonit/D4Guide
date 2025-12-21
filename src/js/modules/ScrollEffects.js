/**
 * ScrollEffects - Scroll-based animations and progress tracking
 */

export class ScrollEffects {
  constructor() {
    this.sections = [];
    this.progressBar = null;
    this.init();
  }

  init() {
    this.setupProgressBar();
    this.setupSectionObserver();
    this.setupSmoothScroll();
    this.setupScrollToTop();
  }

  setupProgressBar() {
    this.progressBar = document.getElementById('reading-progress');
    if (!this.progressBar) return;

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      this.progressBar.style.width = `${progress}%`;
    });
  }

  setupSectionObserver() {
    const sections = document.querySelectorAll('.guide-section');
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '-50px' }
    );

    sections.forEach(section => observer.observe(section));
  }

  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', e => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  setupScrollToTop() {
    const scrollBtn = document.getElementById('scroll-to-top');
    if (!scrollBtn) return;

    window.addEventListener('scroll', () => {
      scrollBtn.classList.toggle('visible', window.scrollY > 500);
    });

    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
