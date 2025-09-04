// ===== Simple Slideshow (supports multiple instances) =====
(function(){
  const carousels = Array.from(document.querySelectorAll('.simple-carousel'));
  if (!carousels.length) return;

  carousels.forEach((carousel) => {
    const track = carousel.querySelector('.simple-track');
    const imgs = Array.from(track.querySelectorAll('img'));
    const prev = carousel.querySelector('.simple-prev');
    const next = carousel.querySelector('.simple-next');
    let index = Math.max(0, imgs.findIndex(img => img.classList.contains('active')));
    if (index === -1) index = 0;

    function show(i){ imgs.forEach((img, idx) => img.classList.toggle('active', idx === i)); }
    function go(delta){ index = (index + delta + imgs.length) % imgs.length; show(index); }

    if (prev) prev.addEventListener('click', () => go(-1));
    if (next) next.addEventListener('click', () => go(1));

    // Keyboard
    carousel.tabIndex = 0;
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    });

    // Lightbox on click
    track.addEventListener('click', (e) => {
      const img = e.target.closest('img');
      if (!img) return;
      const images = Array.from(track.querySelectorAll('img'));
      const currentIndex = images.indexOf(img);
      window.__lbGroup = images;
      window.__lbIndex = currentIndex >= 0 ? currentIndex : 0;
      const lb = document.getElementById('lightbox');
      if (!lb) return;
      const lbImg = lb.querySelector('img');
      const lbCap = lb.querySelector('.lightbox-caption');
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      lbImg.src = img.src;
      if (lbCap) lbCap.textContent = img.getAttribute('alt') || '';
      lb.hidden = false;
      if (!reduceMotion) requestAnimationFrame(() => lb.classList.add('open')); else lb.classList.add('open');
    });

    show(index);
  });
})();

// ===== Lightbox Controls: close + next/prev (slideshow-aware) =====
(function(){
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  const lbImg = lb.querySelector('img');
  const lbCap = lb.querySelector('.lightbox-caption');
  const closeBtn = lb.querySelector('.lightbox-close');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function render(){
    if (!window.__lbGroup || typeof window.__lbIndex !== 'number') return;
    const imgs = window.__lbGroup;
    const i = ((window.__lbIndex % imgs.length) + imgs.length) % imgs.length;
    const el = imgs[i];
    lbImg.src = el.src;
    if (lbCap) lbCap.textContent = el.getAttribute('alt') || '';
  }

  function closeLB(){
    lb.classList.remove('open');
    const end = () => {
      lb.hidden = true;
      lb.removeEventListener('transitionend', end);
    };
    if (!reduceMotion) lb.addEventListener('transitionend', end); else end();
  }

  function go(delta){
    if (!window.__lbGroup || typeof window.__lbIndex !== 'number') return;
    window.__lbIndex = (window.__lbIndex + delta + window.__lbGroup.length) % window.__lbGroup.length;
    render();
  }

  // Backdrop click closes
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLB(); });
  // Close button
  if (closeBtn) closeBtn.addEventListener('click', closeLB);
  // Keyboard: Esc to close, arrows to navigate
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') return closeLB();
    if (e.key === 'ArrowRight') return go(1);
    if (e.key === 'ArrowLeft') return go(-1);
  });
  // Click image to advance
  lbImg.addEventListener('click', () => { if (!lb.hidden) go(1); });
})();

// ===== CineSync 'Our Goals' gallery → open lightbox with group nav =====
(function(){
  const gallery = document.querySelector('#project-cinesync .gallery');
  const lb = document.getElementById('lightbox');
  if (!gallery || !lb) return;

  gallery.addEventListener('click', (e) => {
    const img = e.target.closest('img');
    if (!img || !gallery.contains(img)) return;

    // Build group from all images in this gallery
    const images = Array.from(gallery.querySelectorAll('img'));
    const currentIndex = images.indexOf(img);
    window.__lbGroup = images;
    window.__lbIndex = currentIndex >= 0 ? currentIndex : 0;

    const lbImg = lb.querySelector('img');
    const lbCap = lb.querySelector('.lightbox-caption');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    lbImg.src = img.src;
    if (lbCap) lbCap.textContent = img.getAttribute('alt') || '';

    lb.hidden = false;
    if (!reduceMotion){
      requestAnimationFrame(() => lb.classList.add('open'));
    } else {
      lb.classList.add('open');
    }
  });
})();

// ===== Campus Parking gallery → open lightbox with group nav =====
(function(){
  const gallery = document.querySelector('#project-campus-parking .gallery');
  const lb = document.getElementById('lightbox');
  if (!gallery || !lb) return;

  gallery.addEventListener('click', (e) => {
    const img = e.target.closest('img');
    if (!img || !gallery.contains(img)) return;

    const images = Array.from(gallery.querySelectorAll('img'));
    const currentIndex = images.indexOf(img);
    window.__lbGroup = images;
    window.__lbIndex = currentIndex >= 0 ? currentIndex : 0;

    const lbImg = lb.querySelector('img');
    const lbCap = lb.querySelector('.lightbox-caption');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    lbImg.src = img.src;
    if (lbCap) lbCap.textContent = img.getAttribute('alt') || '';

    lb.hidden = false;
    if (!reduceMotion){
      requestAnimationFrame(() => lb.classList.add('open'));
    } else {
      lb.classList.add('open');
    }
  });
})();

// ===== Smooth scroll with ease-in-out and active link highlight =====
(function(){
  const links = Array.from(document.querySelectorAll('.site-nav .nav-link'));
  if (!links.length) return;

  const easeInOutCubic = (t) => t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function animateScrollTo(targetY, duration = 900){
    const startY = window.scrollY || window.pageYOffset;
    const delta = targetY - startY;
    let start;
    function step(ts){
      if (!start) start = ts;
      const t = Math.min(1, (ts - start) / duration);
      const eased = easeInOutCubic(t);
      window.scrollTo(0, startY + delta * eased);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function getOffsetTop(el){
    const rect = el.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const nav = document.querySelector('.site-nav');
    const navH = nav ? nav.offsetHeight : 0;
    return rect.top + scrollTop - Math.max(0, navH - 2);
  }

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    const id = href.slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const y = getOffsetTop(target);
      animateScrollTo(y, 900);
    });
  });

  // Scrollspy: update active link as sections enter viewport
  const sections = links
    .map(l => document.getElementById(l.getAttribute('href').slice(1)))
    .filter(Boolean);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        const id = entry.target.id;
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
      }
    });
  }, { root: null, rootMargin: '0px 0px -70% 0px', threshold: 0.1 });

  sections.forEach(sec => observer.observe(sec));
})();

// ===== Education: click chips to toggle course descriptions =====
(function(){
  const items = Array.from(document.querySelectorAll('.course-item.chip'));
  if (!items.length) return;

  function closeAll(){
    document.querySelectorAll('.course-description.open').forEach(el => {
      el.classList.remove('open');
      el.setAttribute('aria-hidden', 'true');
    });
    items.forEach(i => { i.classList.remove('active'); i.setAttribute('aria-expanded','false'); });
  }

  function toggleItem(item){
    const id = item.getAttribute('data-course');
    const panel = document.getElementById(id);
    if (!panel) return;
    const isOpen = panel.classList.contains('open');
    closeAll();
    if (!isOpen){
      panel.classList.add('open');
      panel.setAttribute('aria-hidden','false');
      item.classList.add('active');
      item.setAttribute('aria-expanded','true');
      panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  items.forEach(item => {
    item.addEventListener('click', () => toggleItem(item));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleItem(item);
      }
    });
  });
})();
