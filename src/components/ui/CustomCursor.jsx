import React, { useEffect, useRef } from 'react';

export default function CustomCursor() {
    const dotRef = useRef(null);
    const outlineRef = useRef(null);

    useEffect(() => {
        // Only apply if the device has a fine pointer (like a mouse, NOT a touchscreen)
        if (!window.matchMedia("(pointer: fine)").matches) return;

        const cursorDot = dotRef.current;
        const cursorOutline = outlineRef.current;
        if (!cursorDot || !cursorOutline) return;

        // Force body cursor to none dynamically when we mount (active fine pointer)
        document.body.style.cursor = 'none';

        // 1. Core tracking loop
        const onMouseMove = (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            // Dot translates instantly
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            // Outline animates to location with a 500ms delay for elastic trailing
            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
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
        };
    }, []);

    return (
        <React.Fragment>
            <div ref={dotRef} className="cursor-dot z-[10001] pointer-events-none mix-blend-difference hidden sm:block"></div>
            <div ref={outlineRef} className="cursor-outline z-[10001] pointer-events-none mix-blend-difference hidden sm:block"></div>
        </React.Fragment>
    );
}
