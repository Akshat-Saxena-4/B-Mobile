import { useSelector } from 'react-redux';

export const useExperience = () =>
  useSelector((state) => ({
    compare: state.experience.compare,
    recentlyViewed: state.experience.recentlyViewed,
  }));
