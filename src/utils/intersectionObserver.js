/**
 * Shared IntersectionObserver utility to reduce the overhead of creating multiple observer instances.
 */

const observers = new Map();

/**
 * Get or create an IntersectionObserver for a specific set of options.
 * @param {Object} options - IntersectionObserver options (threshold, root, rootMargin)
 * @returns {IntersectionObserver}
 */
const getObserver = (options = {}) => {
    const key = JSON.stringify(options);

    if (observers.has(key)) {
        return observers.get(key);
    }

    const callback = (entries) => {
        entries.forEach((entry) => {
            const target = entry.target;
            const listener = target._intersectionListener;
            if (listener) {
                listener(entry);
            }
        });
    };

    const observer = new IntersectionObserver(callback, options);
    observers.set(key, observer);
    return observer;
};

/**
 * Observe an element with a shared observer.
 * @param {Element} element - The DOM element to observe
 * @param {Function} callback - Function called on intersection change
 * @param {Object} options - IntersectionObserver options
 */
export const observeElement = (element, callback, options = { threshold: 0.15 }) => {
    const observer = getObserver(options);
    element._intersectionListener = callback;
    observer.observe(element);

    return () => {
        observer.unobserve(element);
        delete element._intersectionListener;
    };
};
