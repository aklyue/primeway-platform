import { useEffect, useState, useCallback } from "react";
import {
  showIntroSlider,
  hideIntroSlider,
} from "../../store/slices/introSliderSlice";
import { useAppDispatch } from "../../store/hooks";
import type { Swiper as SwiperType } from "swiper/types";

export default function useIntroSlider(key = "intro_shown") {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const seen = localStorage.getItem(key);
    if (seen !== "true") {
      dispatch(showIntroSlider());
      localStorage.setItem(key, "true");
    }
  }, [dispatch, key]);

  const initialize = useCallback((swiperInstance: SwiperType) => {
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
