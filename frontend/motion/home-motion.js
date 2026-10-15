import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export function mountHomeMotion(setSceneProgress) {
  const story = document.querySelector('[data-scroll-story]');
  if (!story) return;
  const copy = story.querySelector('.home-intro__copy');
  const chapters = [...story.querySelectorAll('[data-story-chapter]')];
  const stripes = [...story.querySelectorAll('.story-wipe span')];

  // Ensure chapters are unhidden in DOM
  chapters.forEach(chapter => {
    chapter.hidden = false;
    chapter.removeAttribute('hidden');
  });

  const media = gsap.matchMedia();
  media.add({
    desktop: '(min-width: 600px)',
  }, () => {
    let lenis;
    const tick = time => lenis?.raf(time * 1000);
    lenis = new Lenis({ autoRaf: false, smoothWheel: true, syncTouch: false, anchors: true, lerp: .085 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const entrance = gsap.timeline({ defaults: { ease: 'power3.out' } });
    entrance.from('#home-title, .home-intro .eyebrow, .home-lead, .home-actions', { opacity: 0, y: 16, duration: 0.8, stagger: 0.08, ease: 'power3.out' });

    story.classList.add('is-pinned', 'has-motion');
    gsap.set(chapters, { autoAlpha: 0, y: 30 });
    gsap.set(stripes, { scaleY: 0, transformOrigin: 'bottom' });
    gsap.set('.story-wipe__title', { opacity: 0, y: 20 });

    const state = { progress: 0 };
    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: story,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
      onUpdate() {
        const progress = timeline.progress();
        copy.inert = progress > 0.16;
        chapters.forEach((chapter, i) => {
          chapter.inert = i === 0 ? progress < 0.20 || progress > 0.50 : progress < 0.52 || progress > 0.80;
        });
        setSceneProgress?.(state.progress);
        story.style.setProperty('--story-progress', progress);
      },
    });

    timeline
      .to(state, { progress: 1, duration: 1 }, 0)
      // 1. Initial Hero Copy fades out
      .to(copy, { autoAlpha: 0, y: -30, duration: 0.12 }, 0.08)
      // 2. Chapter 1: 01 / DETAYLARA YAKLAŞ
      .to(chapters[0], { autoAlpha: 1, y: 0, duration: 0.10 }, 0.18)
      .to(chapters[0], { autoAlpha: 0, y: -30, duration: 0.10 }, 0.44)
      // 3. Chapter 2: 02 / YOLA HAZIRLAN
      .to(chapters[1], { autoAlpha: 1, y: 0, duration: 0.10 }, 0.52)
      .to(chapters[1], { autoAlpha: 0, y: -30, duration: 0.10 }, 0.74)
      // 4. Story Wipe Curtain
      .to(stripes, { scaleY: 1, duration: 0.14, stagger: 0.015 }, 0.76)
      .to('.story-wipe__title', { opacity: 1, y: 0, duration: 0.10 }, 0.88);

    document.querySelectorAll('.home-about > div, .directory-row').forEach(element => {
      gsap.from(element, { opacity: 0, y: 28, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 90%', once: true } });
    });

    ScrollTrigger.refresh();
    setTimeout(() => ScrollTrigger.refresh(), 250);
    document.fonts.ready.then(() => ScrollTrigger.refresh());

    return () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      story.classList.remove('is-pinned', 'has-motion');
      story.style.removeProperty('--story-progress');
      copy.inert = false;
      chapters.forEach(chapter => { chapter.inert = false; });
      setSceneProgress?.(0);
    };
  });

  return () => media.revert();
}
