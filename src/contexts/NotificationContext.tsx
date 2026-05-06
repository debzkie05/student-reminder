import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { NotificationPreferences } from "@/services/NotificationService";
import { defaultNotificationPreferences } from "@/services/NotificationService";
import type { EmailFrequency } from "@/services/NotificationService";

interface NotificationContextType {
  preferences: NotificationPreferences;
  updatePreference: <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => void;
  resetPreferences: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const PREFS_KEY = "taskflow_notification_prefs";

function getStoredPreferences(): NotificationPreferences {
  try {
    const data = localStorage.getItem(PREFS_KEY);
    if (data) {
      return { ...defaultNotificationPreferences, ...JSON.parse(data) };
    }
  } catch {
    // ignore
  }
  return { ...defaultNotificationPreferences };
}

function savePreferences(prefs: NotificationPreferences) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    getStoredPreferences
  );

  // Persist on change
  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  const updatePreference = useCallback(
    <K extends keyof NotificationPreferences>(
      key: K,
      value: NotificationPreferences[K]
    ) => {
      setPreferences((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetPreferences = useCallback(() => {
    setPreferences({ ...defaultNotificationPreferences });
  }, []);

  return (
    <NotificationContext.Provider
      value={{ preferences, updatePreference, resetPreferences }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationPreferences() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationPreferences must be used within a NotificationProvider"
    );
  }
  return context;
}

// Re-export type for convenience
export type { EmailFrequency };
