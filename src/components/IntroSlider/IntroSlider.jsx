import {
  Box,
  IconButton,
  Dialog,
  DialogContent,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export default function IntroSlider({
  slides,
  onClose,
  onInit,
  onNext,
  onPrev,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          background: "transparent",
          boxShadow: "none",
          overflow: "visible",
        },
        component: Box,
      }}
      BackdropProps={{
        sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
      }}
    >
      <IconButton
        onClick={onClose}
        aria-label="Закрыть"
        sx={{
          position: "absolute",
          top: 4,
          right: 4,
          zIndex: 2,
          backgroundColor: "white",
          border: "1px solid lightgray",
          "&:hover": {
            backgroundColor: "#f5f5f5",
          },
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent
        sx={{
          backgroundColor: "white",
          borderRadius: 3,
          px: { xs: 2, sm: 4 },
          py: { xs: 3, sm: 5 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
          }}
        >
          <Swiper
            onSwiper={onInit}
            spaceBetween={32}
            modules={[Pagination]}
            pagination={{ clickable: true }}
            style={{ flexGrow: 1 }}
          >
            {slides.map((slide, idx) => (
              <SwiperSlide key={idx}>
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "grab"
                  }}
                >
                  {slide}
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
        <Stack direction="row" spacing={2} justifyContent="center" mt={4}>
          <IconButton onClick={onPrev} aria-label="Назад">
            <ArrowBackIosNewIcon />
          </IconButton>
          <IconButton onClick={onNext} aria-label="Далее">
            <ArrowForwardIosIcon />
          </IconButton>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
