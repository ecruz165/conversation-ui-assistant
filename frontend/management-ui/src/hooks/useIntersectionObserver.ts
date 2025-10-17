import { useEffect, useRef, useState } from "react";

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver<T extends Element>(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<T>, boolean] {
  const { threshold = 0, root = null, rootMargin = "0px", freezeOnceVisible = false } = options;

  const elementRef = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // If already visible and freezeOnceVisible is true, don't observe again
    if (freezeOnceVisible && isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        setIsVisible(isIntersecting);

        // If freezeOnceVisible and now visible, disconnect observer
        if (freezeOnceVisible && isIntersecting) {
          observer.disconnect();
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, freezeOnceVisible, isVisible]);

  return [elementRef, isVisible];
}
