import { useEffect } from 'react';

// Safely call gtag if it exists on the window object
const pageview = (url) => {
    if (typeof window.gtag === 'function') {
        window.gtag('event', 'page_view', {
            page_path: url,
        });
    }
};

/**
 * Custom hook to track SPA page views with Google Analytics 4.
 * It manually monkeys patches pushState and replaceState to catch internal router navigations,
 * and listens to the popstate event for browser back/forward buttons.
 */
export const usePageTracking = () => {
    useEffect(() => {
        // Log the initial page load
        pageview(window.location.pathname);

        // Store original history methods
        const originalPushState = window.history.pushState;
        const originalReplaceState = window.history.replaceState;

        // Monkey-patch pushState
        window.history.pushState = function (...args) {
            const result = originalPushState.apply(this, args);
            // args[2] is the new URL
            if (args[2]) {
                const url = new URL(args[2], window.location.origin);
                pageview(url.pathname);
            }
            return result;
        };

        // Monkey-patch replaceState
        window.history.replaceState = function (...args) {
            const result = originalReplaceState.apply(this, args);
            // args[2] is the new URL
            if (args[2]) {
                const url = new URL(args[2], window.location.origin);
                pageview(url.pathname);
            }
            return result;
        };

        // Listen for back/forward navigation
        const handlePopState = () => {
            pageview(window.location.pathname);
        };

        window.addEventListener('popstate', handlePopState);

        // Cleanup: restore original methods and remove listener
        return () => {
            window.history.pushState = originalPushState;
            window.history.replaceState = originalReplaceState;
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);
};
