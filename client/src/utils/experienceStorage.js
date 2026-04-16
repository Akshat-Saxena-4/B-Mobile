const STORAGE_KEY = 'bmobile-experience-v2';

const defaultState = {
  compare: [],
  recentlyViewed: [],
};

export const loadExperienceState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultState;
    }

    const parsed = JSON.parse(raw);
    return {
      compare: Array.isArray(parsed.compare) ? parsed.compare : [],
      recentlyViewed: Array.isArray(parsed.recentlyViewed) ? parsed.recentlyViewed : [],
    };
  } catch {
    return defaultState;
  }
};

export const saveExperienceState = (state) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        compare: state.compare || [],
        recentlyViewed: state.recentlyViewed || [],
      })
    );
  } catch {
    /* ignore storage errors */
  }
};
