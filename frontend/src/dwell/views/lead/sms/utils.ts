export const isElementInViewport = (el: Element): boolean => {
  const rect = el.getBoundingClientRect();

  return rect.top >= 298 && rect.bottom <= document.documentElement.clientHeight;
};
