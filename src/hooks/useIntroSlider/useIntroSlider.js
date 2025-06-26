import { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  showIntroSlider,
  hideIntroSlider,
} from "../../store/slices/introSliderSlice";

export default function useIntroSlider(key = "intro_shown") {
  const [swiper, setSwiper] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const seen = localStorage.getItem(key);
    if (seen !== "true") {
      dispatch(showIntroSlider());
      localStorage.setItem(key, "true");
    }
  }, [dispatch, key]);

  const initialize = useCallback((swiperInstance) => {
    setSwiper(swiperInstance);
  }, []);

  const slideNext = useCallback(() => {
    if (swiper) swiper.slideNext();
  }, [swiper]);

  const slidePrev = useCallback(() => {
    if (swiper) swiper.slidePrev();
  }, [swiper]);

  const close = useCallback(() => {
    dispatch(hideIntroSlider());
  }, [dispatch]);

  return {
    close,
    initialize,
    slideNext,
    slidePrev,
  };
}
