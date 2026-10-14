import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// Presentation only: EJS remains the source of content and navigation.
export function mountHomeMotion(setSceneProgress) {
  const story = document.querySelector('[data-scroll-story]');
  if (!story) return;
  const media = gsap.matchMedia();
  const copy = story.querySelector('.home-intro__copy');
  const chapters = [...story.querySelectorAll('[data-story-chapter]')];
  const stripes = [...story.querySelectorAll('.story-wipe span')];
  media.add({
    desktop: '(min-width: 900px) and (min-height: 650px)',
    reduce: '(prefers-reduced-motion: reduce)',
  }, context => {
    const { desktop, reduce } = context.conditions;
    if (reduce) return;
    let lenis;
    const tick = time => lenis?.raf(time * 1000);
    if (desktop) {
      lenis = new Lenis({ autoRaf: false, smoothWheel: true, syncTouch: false, anchors: true, lerp: .085 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(tick);
    }
    const entrance = gsap.timeline({ defaults: { ease: 'power3.out' } });
    entrance.from('.home-title-line > span', { yPercent: 110, duration: 1.05, stagger: .14 })
      .from('.home-intro .eyebrow, .home-lead, .home-actions', { opacity: 0, y: 12, duration: .65, stagger: .1 }, .25);

    if (desktop) {
      story.classList.add('is-pinned', 'has-motion');
      chapters.forEach(chapter => { chapter.hidden = false; });
      gsap.set(chapters, { autoAlpha: 0, y: 30 });
      gsap.set(stripes, { scaleY: 0, transformOrigin: 'bottom' });
      gsap.set('.story-wipe__title', { opacity: 0, y: 20 });
      const state = { progress: 0 };
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: story, start: 'top top', end: 'bottom bottom', scrub: .7, invalidateOnRefresh: true },
        onUpdate() {
          const progress = timeline.progress();
          copy.inert = progress > .16;
          chapters.forEach((chapter, i) => { chapter.inert = i === 0 ? progress < .21 || progress > .54 : progress < .57 || progress > .83; });
          setSceneProgress(state.progress);
          story.style.setProperty('--story-progress', progress);
        },
      });
      timeline.to(state, { progress: 1, duration: 1 }, 0)
        .to(copy, { autoAlpha: 0, y: -35, duration: .12 }, .09)
        .to(chapters[0], { autoAlpha: 1, y: 0, duration: .1 }, .21)
        .to(chapters[0], { autoAlpha: 0, y: -30, duration: .1 }, .44)
        .to(chapters[1], { autoAlpha: 1, y: 0, duration: .1 }, .57)
        .to(chapters[1], { autoAlpha: 0, y: -30, duration: .1 }, .76)
        .to(stripes, { scaleY: 1, duration: .12, stagger: .018 }, .76)
        .to('.story-wipe__title', { opacity: 1, y: 0, duration: .1 }, .9);
    }
    document.querySelectorAll('.home-about > div, .directory-row').forEach(element => {
      gsap.from(element, { opacity: 0, y: 28, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 90%', once: true } });
    });
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      story.classList.remove('is-pinned', 'has-motion');
      story.style.removeProperty('--story-progress');
      copy.inert = false;
      chapters.forEach(chapter => { chapter.hidden = true; chapter.inert = false; });
      setSceneProgress(0);
    };
  });
  return () => media.revert();
}
