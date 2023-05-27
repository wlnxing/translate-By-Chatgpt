export function getScrollPosition() {
  let x, y;
  if (window.pageXOffset) {
    x = window.pageXOffset;
    y = window.pageYOffset;
  } else {
    x = (document.documentElement || document.body.parentNode || document.body)
      .scrollLeft;
    y = (document.documentElement || document.body.parentNode || document.body)
      .scrollTop;
  }
  return { x, y };
}

export function getDomToViewPosition (dom: HTMLElement) {
  const rectObject = dom.getBoundingClientRect()
  return {
      domToViewLeft: rectObject.left,
      domToViewTop: rectObject.top
  }
}

