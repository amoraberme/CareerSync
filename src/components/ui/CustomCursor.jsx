import React, { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
    const dotRef = useRef(null);
    const outlineRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Broad mobile fallback: ignore screens < 768px Width entirely
        if (window.innerWidth <= 768) return;

        const cursorDot = dotRef.current;
        const cursorOutline = outlineRef.current;
        if (!cursorDot || !cursorOutline) return;

        // Force body cursor to none dynamically when we mount
        document.body.style.cursor = 'none';
        document.documentElement.classList.add('custom-cursor-active');

        let hasMoved = false;

        // 1. Core tracking loop
        const onMouseMove = (e) => {
            if (!hasMoved) {
                setIsVisible(true);
                hasMoved = true;
            }
            const posX = e.clientX;
            const posY = e.clientY;

            // Dot translates instantly via hardware-accelerated transforms
            cursorDot.style.transform = `translate3d(${posX}px, ${posY}px, 0) translate(-50%, -50%)`;

            // Outline animates to location with a 500ms delay for elastic trailing
            cursorOutline.animate({
                transform: `translate3d(${posX}px, ${posY}px, 0) translate(-50%, -50%)`
            }, { duration: 500, fill: "forwards" });
        };

        window.addEventListener("mousemove", onMouseMove);

        // 2. Hover Interactions trigger using event delegation on document root
        const onMouseOver = (e) => {
            // Traverse up to find if we're hovering over an interactive element
            const interactable = e.target.closest('a, button, [role="button"], input, select, textarea, .bento-item, .absolute-hover, .btn-magnetic');

            if (interactable) {
                cursorOutline.classList.add("hovered");
            } else {
                cursorOutline.classList.remove("hovered");
            }
        };

        document.documentElement.addEventListener("mouseover", onMouseOver);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            document.documentElement.removeEventListener("mouseover", onMouseOver);
            document.body.style.cursor = 'auto'; // Restore normal cursor
            document.documentElement.classList.remove('custom-cursor-active');
        };
    }, []);

    return (
        <div style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.3s', pointerEvents: 'none' }} className="hidden md:block">
            <div ref={dotRef} className="cursor-dot"></div>
            <div ref={outlineRef} className="cursor-outline"></div>
        </div>
    );
}
