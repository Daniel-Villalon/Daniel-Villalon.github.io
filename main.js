// ===== Simple Slideshow (CineSync) =====
(function(){
  const carousel = document.querySelector('.simple-carousel');
  if (!carousel) return;

  const track = carousel.querySelector('.simple-track');
  const imgs = Array.from(track.querySelectorAll('img'));
  const prev = carousel.querySelector('.simple-prev');
  const next = carousel.querySelector('.simple-next');
  let index = Math.max(0, imgs.findIndex(img => img.classList.contains('active')));
  if (index === -1) index = 0;

  function show(i){
    imgs.forEach((img, idx) => img.classList.toggle('active', idx === i));
  }

  function go(delta){
    index = (index + delta + imgs.length) % imgs.length;
    show(index);
  }

  // Buttons
  if (prev) prev.addEventListener('click', () => go(-1));
  if (next) next.addEventListener('click', () => go(1));

  // Keyboard (when the carousel is focused or hovered)
  carousel.tabIndex = 0;
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'ArrowRight') go(1);
  });

  // Optional: click image to open lightbox and store group/index for navigation
  track.addEventListener('click', (e) => {
    const img = e.target.closest('img');
    if (!img) return;

    // Prepare lightbox group from slideshow images
    const images = Array.from(track.querySelectorAll('img'));
    const currentIndex = images.indexOf(img);
    window.__lbGroup = images;        // store group globally for lightbox nav
    window.__lbIndex = currentIndex;  // store current index

    const lb = document.getElementById('lightbox');
    if (!lb) return;
    const lbImg = lb.querySelector('img');
    const lbCap = lb.querySelector('.lightbox-caption');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    lbImg.src = img.src;
    if (lbCap) lbCap.textContent = img.getAttribute('alt') || '';

    lb.hidden = false;
    if (!reduceMotion) {
      requestAnimationFrame(() => lb.classList.add('open'));
    } else {
      lb.classList.add('open');
    }
  });

  // Initialize
  show(index);
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