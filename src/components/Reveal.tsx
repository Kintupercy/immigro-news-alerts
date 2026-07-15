import { useEffect, useRef, useState, type ReactNode } from "react";

// Scroll-reveal wrapper: fades content up once when it enters the viewport.
// Pair with a .reveal-underline child for the gold draw-in accent.
// Respects prefers-reduced-motion (handled in index.css).
const Reveal = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal-block ${revealed ? "is-revealed" : ""} ${className}`}>
      {children}
    </div>
  );
};

export default Reveal;
