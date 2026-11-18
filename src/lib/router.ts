import { useEffect, useState } from 'react';

/** Minimal hash router: "#/unit/ratio" -> ["unit", "ratio"]. Works offline and from the home screen. */
export function useRoute(): string[] {
  const read = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => {
      setRoute(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export function go(path: string) {
  location.hash = path.startsWith('/') ? path : '/' + path;
}

export function back(fallback = '/') {
  if (history.length > 1) history.back();
  else go(fallback);
}
