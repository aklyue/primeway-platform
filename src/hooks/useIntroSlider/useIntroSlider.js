import { useEffect, useState, useCallback } from "react";

export default function useIntroSlider(key = "intro_shown") {
  const [show, setShow] = useState(false);
  const [swiper, setSwiper] = useState(null);

  useEffect(() => {
    const seen = localStorage.getItem(key);
    if (!seen) setShow(true);
  }, [key]);

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
    localStorage.setItem(key, "true");
    setShow(false);
  }, [key]);

  return {
    show,
    close,
    initialize,
    slideNext,
    slidePrev,
  };
}
