// Shared navigation enhancement; normal links and server-rendered MVC pages stay intact.
const header = document.querySelector('.top');
const toggle = header?.querySelector('.menu-toggle');
const nav = header?.querySelector('#primary-nav');
if (header && toggle && nav) {
  const mobile = matchMedia('(max-width: 900px)');
  const label = toggle.querySelector('[data-menu-label]');
  function setOpen(open, returnFocus = false) {
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Kapat' : 'Menü';
    nav.hidden = mobile.matches && !open;
    if (returnFocus) toggle.focus();
  }
  function reset() {
    toggle.hidden = !mobile.matches;
    setOpen(false);
  }
  header.classList.add('navigation-ready');
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  header.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobile.matches && toggle.getAttribute('aria-expanded') === 'true') setOpen(false, true);
  });
  document.addEventListener('click', event => {
    if (mobile.matches && !header.contains(event.target)) setOpen(false);
  });
  header.addEventListener('focusout', event => {
    if (mobile.matches && event.relatedTarget && !header.contains(event.relatedTarget)) setOpen(false);
  });
  mobile.addEventListener('change', reset);
  addEventListener('pageshow', reset);
  reset();
}
