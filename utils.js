// suggested solution from https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent#avoiding_user_agent_detection
// to detect touch device rather than using user agent
const isTouchScreenDevice = () => {
  let hasTouchScreen = false;
  if ("maxTouchPoints" in navigator) {
    hasTouchScreen = navigator.maxTouchPoints > 0;
  } else if ("msMaxTouchPoints" in navigator) {
    hasTouchScreen = navigator.msMaxTouchPoints > 0;
  } else {
    const mQ = window.matchMedia && matchMedia("(pointer:coarse)");
    if (mQ && mQ.media === "(pointer:coarse)") {
      hasTouchScreen = !!mQ.matches;
    } else if ('orientation' in window) {
      hasTouchScreen = true; // deprecated, but good fallback
    } else {
      // Only as a last resort, fall back to user agent sniffing
      const UA = navigator.userAgent;
      hasTouchScreen = (
        /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) ||
        /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA)
      );
    }
  }
  return hasTouchScreen;
}
// Takes a value in seconds, returns hh:mm:ss:ms
const createTimeString = (seconds) => {
  const baseString = new Date(seconds * 1000).toISOString().substring(11, 23);
  const hhmm = baseString.split(':');
  const ssms = hhmm[2].split('.');
  return `${hhmm[0]}h ${hhmm[1]}m ${ssms[0]}s ${ssms[1]}ms`;
}