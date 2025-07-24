import React from "react";
import { setMarketplace } from "../../store/slices/marketplaceSlice";
import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import Box from "@mui/material/Box";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

const MarketplaceSwitch = styled(Switch)(({ theme }) => ({
  width: 100,
  height: 30,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 6,
    "&.Mui-checked": {
      transform: "translateX(70px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#597ad3",
        opacity: 1,
      },
      "& + .MuiSwitch-track::before": {
        opacity: 1,
      },
      "& + .MuiSwitch-track::after": {
        opacity: 0,
      },
    },
  },
  "& .MuiSwitch-input": {
    width: "600% !important",
    left: "-250% !important",
  },
  "& .MuiSwitch-thumb": {
    width: 18,
    height: 18,
    boxShadow: "none",
  },
  "& .MuiSwitch-track": {
    borderRadius: 40,
    backgroundColor: "#4d9cf8",
    opacity: 1,
    position: "relative",
    transition: "background-color 0.3s",
    "&::before, &::after": {
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      fontSize: 14,
      fontWeight: "bold",
      color: "#fff",
      transition: "opacity 0.3s",
    },
    "&::before": {
      content: '"TabbyML"',
      left: 12,
      opacity: 0,
    },
    "&::after": {
      content: '"Jupyter"',
      right: 12,
      opacity: 1,
    },
  },
}));

const MarketplaceToggle = () => {
  const marketplace = useAppSelector((state) => state.market.marketplace);
  const dispatch = useAppDispatch();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setMarketplace(event.target.checked ? "tabby" : "jupyter"));
  };

  return (
    <Box my={1}>
      <MarketplaceSwitch
        checked={marketplace === "tabby"}
        onChange={handleChange}
      />
    </Box>
  );
};

export default MarketplaceToggle;
