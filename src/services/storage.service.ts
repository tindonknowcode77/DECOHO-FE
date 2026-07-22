function isBrowser() {
  return typeof window !== "undefined";
}

export const storageService = {
  get: <TValue>(key: string): TValue | null => {
    if (!isBrowser()) {
      return null;
    }

    const value = window.localStorage.getItem(key);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as TValue;
    } catch {
      return value as TValue;
    }
  },
  remove: (key: string) => {
    if (isBrowser()) {
      window.localStorage.removeItem(key);
    }
  },
  set: <TValue>(key: string, value: TValue) => {
    if (isBrowser()) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  },
};
