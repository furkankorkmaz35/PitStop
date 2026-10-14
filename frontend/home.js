const stage = document.querySelector('[data-car-stage]');
if (stage) {
  const status = stage.querySelector('[data-car-status]');
  const observer = new IntersectionObserver(async entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    status.textContent = 'Araç görünümü yükleniyor…';
    try {
      const { mountCarScene } = await import('./car-scene.js');
      await mountCarScene(stage);
    } catch (error) {
      stage.dataset.state = 'fallback';
      status.textContent = '3D görünüm açılamadı. Araç illüstrasyonu gösteriliyor.';
      console.warn('Araç sahnesi yüklenemedi:', error);
    }
  }, { rootMargin: '160px' });
  observer.observe(stage);
}

// Progressive enhancement: content remains visible if JS or observers fail.
if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const reveals = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.remove('awaiting-reveal');
      reveals.unobserve(entry.target);
    }
  }, { threshold: .12 });
  for (const element of document.querySelectorAll('.home-about, .directory-row')) {
    element.classList.add('scroll-reveal', 'awaiting-reveal');
    reveals.observe(element);
  }
}

// Native sticky positioning keeps wheel/touch/keyboard scrolling intact.
const story = document.querySelector('[data-scroll-story]');
if (story) {
  const eligible = matchMedia('(min-width: 900px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)');
  const copy = story.querySelector('.home-intro__copy');
  const chapters = [...story.querySelectorAll('[data-story-chapter]')];
  let pending = 0;
  function updateStory() {
    pending = 0;
    const enabled = eligible.matches;
    story.classList.toggle('is-pinned', enabled);
    const distance = story.offsetHeight - innerHeight;
    const progress = enabled ? Math.max(0, Math.min(1, -story.getBoundingClientRect().top / distance)) : 0;
    story.style.setProperty('--story-progress', progress);
    const firstOpacity = 1 - Math.min(1, progress / .22);
    copy.style.opacity = firstOpacity;
    copy.inert = enabled && firstOpacity < .1;
    copy.style.transform = enabled ? `translateY(${-Math.min(progress / .22, 1) * 24}px)` : '';
    chapters.forEach((chapter, index) => {
      const start = index === 0 ? .22 : .62;
      const end = index === 0 ? .62 : 1.2;
      const opacity = Math.max(0, Math.min(1, (progress - start) / .12, (end - progress) / .12));
      chapter.hidden = !enabled || opacity === 0;
      chapter.style.opacity = opacity;
      chapter.style.transform = `translateY(${(1 - opacity) * 24}px)`;
    });
  }
  function scheduleStory() { if (!pending) pending = requestAnimationFrame(updateStory); }
  addEventListener('scroll', scheduleStory, { passive: true });
  addEventListener('resize', scheduleStory);
  eligible.addEventListener('change', scheduleStory);
  updateStory();
}
