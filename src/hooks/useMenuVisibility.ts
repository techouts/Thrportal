import { useMemo } from "react";
import { useAuth } from "../auth/AuthContext";
import { MENU, MenuSection, MenuItem } from "../menu/config";

export interface VisibilityData {
  sections: Record<string, {
    visible: boolean;
    items: Record<string, boolean>;
  }>;
}

export function useMenuVisibility(): VisibilityData {
  const { can } = useAuth();

  return useMemo(() => {
    const sections: VisibilityData['sections'] = {};

    MENU.forEach((section) => {
      // Check section visibility
      const sectionVisible = !section.requiresAny || 
        section.requiresAny.length === 0 || 
        section.requiresAny.some(p => can(p));

      // Check items visibility
      const items: Record<string, boolean> = {};
      section.items?.forEach((item) => {
        const itemVisible = !item.requiresAny || 
          item.requiresAny.length === 0 || 
          item.requiresAny.some(p => can(p));
        items[item.route] = itemVisible;
      });

      sections[section.label] = {
        visible: sectionVisible,
        items
      };
    });

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Menu Visibility Data:', sections);
    }

    return { sections };
  }, [can]);
}