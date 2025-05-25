"use client";

import { useEffect } from "react";

export function ClientBodyClassHandler() {
  useEffect(() => {
    // Check if the ClickUp extension class needs to be added
    if (document.body.classList.contains("clickup-chrome-ext_installed")) {
      return;
    }

    // Add a mutation observer to handle the class being added by the extension
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const clickupClass = "clickup-chrome-ext_installed";
          const hasClass = document.body.classList.contains(clickupClass);
          if (hasClass) {
            observer.disconnect();
          }
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
