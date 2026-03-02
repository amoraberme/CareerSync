import React, { useEffect, useState } from 'react';

const RevealPreloader = () => {
    const [isMounted, setIsMounted] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [isGone, setIsGone] = useState(false);

    useEffect(() => {
        // Lock body scroll immediately
        document.body.style.overflow = 'hidden';

        // Ensure initial render happens before triggering the lift
        setIsMounted(true);

        // Start the wipe after a tiny delay so the mounting is painted
        const liftTimer = setTimeout(() => {
            setIsRemoving(true);
        }, 50);

        // Cleanup DOM and unlock scroll after transition completes (1200ms)
        const cleanupTimer = setTimeout(() => {
            setIsGone(true);
            document.body.style.overflow = '';
        }, 1250); // 1200ms transition + 50ms initial delay

        return () => {
            clearTimeout(liftTimer);
            clearTimeout(cleanupTimer);
            document.body.style.overflow = '';
        };
    }, []);

    if (isGone) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] bg-background dark:bg-darkBg pointer-events-none"
            style={{
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                transform: isRemoving ? 'translateY(-100%)' : 'translateY(0%)',
                transition: 'transform 1200ms cubic-bezier(0.85, 0, 0.15, 1)',
                willChange: 'transform'
            }}
        />
    );
};

export default RevealPreloader;
