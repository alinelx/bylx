/* PixelCursor.jsx — replaces the OS cursor with a 32px pixel sprite.
   Listens for hover/click on a, button, .clickable. */

function PixelCursor() {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function move(e) {
      el.style.left = `${e.clientX}px`;
      el.style.top  = `${e.clientY}px`;
    }
    function over(e) {
      if (e.target.closest('a, button, .clickable, [role="button"]')) el.classList.add('hover');
    }
    function out(e) {
      if (e.target.closest('a, button, .clickable, [role="button"]')) el.classList.remove('hover');
    }
    function down() { el.classList.add('click'); }
    function up()   { el.classList.remove('click'); }

    window.addEventListener('mousemove', move);
    document.addEventListener('mouseover', over);
    document.addEventListener('mouseout', out);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', over);
      document.removeEventListener('mouseout', out);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
    };
  }, []);

  return <div className="bylx-cursor" ref={ref} aria-hidden="true"></div>;
}

window.BylxPixelCursor = PixelCursor;
