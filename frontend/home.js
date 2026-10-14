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
