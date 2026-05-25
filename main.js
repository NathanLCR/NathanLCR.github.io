/* ── AOS ─────────────────────────────────────────────── */
AOS.init({
  duration: 700,
  easing: 'ease-out',
  once: true,
  disable: 'mobile'
});

/* ── Nav: mobile slide ───────────────────────────────── */
const navSlide = () => {
  const burger     = document.querySelector('.burger');
  const nav        = document.querySelector('.nav-links');
  const navLinksLi = document.querySelectorAll('.nav-links li');
  const navLinksA  = document.querySelectorAll('.nav-links a');

  burger.addEventListener('click', () => {
    nav.classList.toggle('nav-active');
    navLinksLi.forEach((link, i) => {
      link.style.animation = link.style.animation
        ? ''
        : `navLinkFade 0.4s ease forwards ${i * 0.06 + 0.15}s`;
    });
    burger.classList.toggle('toggle');
  });

  navLinksA.forEach(link =>
    link.addEventListener('click', () => {
      if (nav.classList.contains('nav-active')) {
        nav.classList.remove('nav-active');
        burger.classList.remove('toggle');
        navLinksLi.forEach(l => { l.style.animation = ''; });
      }
    })
  );
};
navSlide();

/* ── Nav: scroll shadow ──────────────────────────────── */
const navEl = document.querySelector('nav');
const onScroll = () => {
  navEl.classList.toggle('scrolled', window.scrollY > 10);
};
window.addEventListener('scroll', onScroll, { passive: true });

/* ── Timeline: staggered reveal ─────────────────────── */
const timelineItems = document.querySelectorAll('.timeline-item');
const timelineObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const items = entry.target.querySelectorAll('.timeline-item');
      items.forEach((item, i) => {
        setTimeout(() => item.classList.add('visible'), i * 120);
      });
      timelineObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

const timelineContainer = document.querySelector('.timeline');
if (timelineContainer) timelineObserver.observe(timelineContainer);

/* ── Skills: staggered tag reveal ───────────────────── */
const skillGroups = document.querySelectorAll('.skill-group');
const skillObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const tags = entry.target.querySelectorAll('.skill-tags span');
      tags.forEach((tag, i) => {
        tag.style.transitionDelay = `${i * 55}ms`;
        setTimeout(() => tag.classList.add('visible'), i * 55);
      });
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

skillGroups.forEach(group => skillObserver.observe(group));

/* ── Text scramble on "ENGINEER" ────────────────────── */
const scrambleEl = document.getElementById('scramble-target');
if (scrambleEl && typeof TextScramble !== 'undefined') {
  const fx = new TextScramble(scrambleEl);
  setTimeout(() => {
    fx.setText('ENGINEER');
  }, 900);
}

/* ── Year ────────────────────────────────────────────── */
document.getElementById('year').textContent = new Date().getFullYear();
