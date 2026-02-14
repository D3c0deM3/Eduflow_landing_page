const FALLBACK_NAV_HEIGHT = 80;
const SCROLL_OFFSET = 12;

export const getNavHeight = (): number => {
  const nav = document.querySelector('[data-site-nav="true"]');
  if (nav instanceof HTMLElement) {
    return nav.offsetHeight;
  }
  return FALLBACK_NAV_HEIGHT;
};

export const updateNavHeightVar = (): void => {
  document.documentElement.style.setProperty(
    '--nav-height',
    `${getNavHeight()}px`
  );
};

export const scrollToSection = (id: string): void => {
  const target = document.getElementById(id);
  if (!target) return;

  const top =
    target.getBoundingClientRect().top + window.scrollY - getNavHeight() - SCROLL_OFFSET;

  window.scrollTo({
    top: Math.max(top, 0),
    behavior: 'smooth',
  });
};

export const goToLogin = (): void => {
  window.location.assign('/login');
};
