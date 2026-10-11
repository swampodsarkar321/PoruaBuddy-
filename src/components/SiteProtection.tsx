import { useEffect, useState } from 'react';

/** Basic anti-copy deterrent: blocks right-click + devtools shortcuts,
 *  turns screen black while devtools is open. */
export const SiteProtection: React.FC = () => {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
        ((e.ctrlKey || e.metaKey) && ['U', 'S'].includes(e.key.toUpperCase()))
      ) {
        e.preventDefault();
      }
    };

    // Devtools detection: window size gap + debugger timing
    let lastCheck = performance.now();
    const detect = () => {
      const gap = window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160;
      const t0 = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      const slow = performance.now() - t0 > 100;
      setBlocked(gap || slow);
      lastCheck = performance.now();
    };
    void lastCheck;
    const timer = setInterval(detect, 800);

    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('keydown', onKeyDown);
      clearInterval(timer);
    };
  }, []);

  if (!blocked) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center gap-3 select-none">
      <p className="text-white/80 text-sm font-semibold">Developer tools are disabled on this site.</p>
      <p className="text-white/40 text-xs">Please close DevTools to continue browsing.</p>
    </div>
  );
};
