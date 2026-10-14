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
  let anchorRestored = false;
  media.add({
    all: '(min-width: 0px)',
    desktop: '(min-width: 900px) and (min-height: 650px)',
    reduce: '(prefers-reduced-motion: reduce)',
  }, context => {
    const { desktop, reduce } = context.conditions;
    if (reduce) return;
    let active = true;
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
      gsap.set(chapters, { autoAlpha: 0, yPercent: -50, y: 30 });
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
      timeline.to('.home-scroll-cue', { autoAlpha: 0, duration: .08 }, .03)
        .to(state, { progress: 1, duration: 1 }, 0)
        .to(copy, { autoAlpha: 0, y: -35, duration: .12 }, .09)
        .to(chapters[0], { autoAlpha: 1, y: 0, duration: .1 }, .21)
        .to(chapters[0], { autoAlpha: 0, y: -30, duration: .1 }, .44)
        .to(chapters[1], { autoAlpha: 1, y: 0, duration: .1 }, .57)
        .to(chapters[1], { autoAlpha: 0, y: -30, duration: .1 }, .76)
        .to(stripes, { scaleY: 1, duration: .12, stagger: .018 }, .76)
        .to('.story-wipe__title', { opacity: 1, y: 0, duration: .1 }, .9);
    }
    const about = document.querySelector('.home-about');
    gsap.timeline({ scrollTrigger: { trigger: about, start: 'top 78%', once: true }, defaults: { duration: .85, ease: 'power3.out' } })
      .from(about.querySelectorAll('.motion-line > span'), { yPercent: 110, stagger: .12 })
      .from(about.querySelector('.home-about__summary'), { opacity: 0, y: 18 }, .18)
      .from(about.querySelectorAll('.home-about__rail i'), { scaleX: 0, transformOrigin: 'left', stagger: .12 }, .3)
      .from(about.querySelectorAll('.home-about__rail > span'), { opacity: 0, stagger: .12 }, .4);
    const directory = document.querySelector('.home-directory');
    gsap.from(directory.querySelector('.section-head'), { opacity: 0, y: 18, duration: .7, ease: 'power3.out', scrollTrigger: { trigger: directory, start: 'top 85%', once: true } });
    directory.querySelectorAll('.directory-row').forEach(element => {
      gsap.timeline({ scrollTrigger: { trigger: element, start: 'top 92%', once: true }, defaults: { duration: .7, ease: 'power3.out' } })
        .from(element, { '--line-reveal': 0 })
        .from(element.children, { opacity: 0, y: 16, stagger: .055 }, 0);
    });
    document.querySelectorAll('.home-selection, .home-workshop').forEach(section => {
      gsap.from(section.querySelectorAll('h2, .eyebrow, .editorial-link'), { y: 20, opacity: 0, duration: .75, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 85%', once: true } });
    });
    document.querySelectorAll('.home-model, .home-guide').forEach(element => {
      gsap.from(element, { y: 32, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 92%', once: true } });
    });
    const finish = document.querySelector('.home-finish');
    gsap.timeline({ scrollTrigger: { trigger: finish, start: 'top 90%', once: true }, defaults: { duration: .9, ease: 'power3.out' } })
      .from(finish.querySelector('h2'), { y: 30, opacity: 0 })
      .from(finish.querySelector('.home-finish__arrow'), { x: -20, y: 20, opacity: 0 }, .12);
    document.fonts.ready.then(() => {
      if (!active) return;
      ScrollTrigger.refresh();
      if (!anchorRestored && location.hash) {
        anchorRestored = true;
        let id;
        try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
        const target = document.getElementById(id);
        if (target) {
          if (lenis) lenis.scrollTo(target, { immediate: true });
          else target.scrollIntoView();
        }
      }
    });
    return () => {
      active = false;
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
