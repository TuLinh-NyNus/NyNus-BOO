import { useCallback, useRef, useId } from "react";

/**
 * Hook for ARIA attributes
 */
export function useAriaAttributes() {
  const reactId = useId();

  const getAriaAttributes = useCallback((props: Record<string, any>) => {
    return Object.keys(props)
      .filter((key) => key.startsWith("aria-"))
      .reduce(
        (acc, key) => {
          acc[key] = props[key];
          return acc;
        },
        {} as Record<string, any>
      );
  }, []);

  const generateId = useCallback((prefix?: string) => {
    // Use React's useId for stable server/client ID generation
    const baseId = reactId.replace(/:/g, '-');
    return prefix ? `${prefix}-${baseId}` : `id-${baseId}`;
  }, [reactId]);

  return { getAriaAttributes, generateId };
}

/**
 * Hook for ARIA live regions
 */
export function useAriaLive() {
  const announceToScreenReader = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      const liveRegion = document.createElement("div");
      liveRegion.setAttribute("aria-live", priority);
      liveRegion.setAttribute("aria-atomic", "true");
      liveRegion.style.position = "absolute";
      liveRegion.style.left = "-10000px";
      liveRegion.style.width = "1px";
      liveRegion.style.height = "1px";
      liveRegion.style.overflow = "hidden";

      document.body.appendChild(liveRegion);
      liveRegion.textContent = message;

      setTimeout(() => {
        document.body.removeChild(liveRegion);
      }, 1000);
    },
    []
  );

  const announce = announceToScreenReader;

  return { announceToScreenReader, announce };
}

/**
 * Hook for accessible tabs
 */
export function useAccessibleTabs() {
  const getTabProps = useCallback((index: number, isSelected: boolean) => {
    return {
      role: "tab",
      "aria-selected": isSelected,
      "aria-controls": `tabpanel-${index}`,
      id: `tab-${index}`,
      tabIndex: isSelected ? 0 : -1,
    };
  }, []);

  const getTabPanelProps = useCallback((index: number, isSelected: boolean) => {
    return {
      role: "tabpanel",
      "aria-labelledby": `tab-${index}`,
      id: `tabpanel-${index}`,
      hidden: !isSelected,
    };
  }, []);

  const handleTabKeyDown = useCallback((event: React.KeyboardEvent, tabRefs: HTMLElement[]) => {
    // Simple keyboard navigation for tabs
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const currentElement = event.target as HTMLElement;
      const currentIndex = tabRefs.indexOf(currentElement);

      if (currentIndex !== -1) {
        let nextIndex;
        if (event.key === "ArrowRight") {
          nextIndex = (currentIndex + 1) % tabRefs.length;
        } else {
          nextIndex = (currentIndex - 1 + tabRefs.length) % tabRefs.length;
        }
        tabRefs[nextIndex]?.focus();
      }
    }
  }, []);

  return { getTabProps, getTabPanelProps, handleTabKeyDown };
}
