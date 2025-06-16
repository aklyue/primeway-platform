import React from "react";
import { useSelector } from "react-redux";
import { Box, Typography } from "@mui/material";
import MarketplaceToggle from "../../UI/MarketplaceToggle";
import JupyterLabSessions from "../../components/NoCode/components/JupyterLab";
import Tabby from "../../components/NoCode/components/Tabby";
import { AnimatePresence, motion } from "framer-motion";

function ChangeProjectsPage({ isMobile, isTablet }) {
  const marketplace = useSelector((state) => state.market.marketplace);

  return (
    <Box>
      <Box>
        <MarketplaceToggle />
      </Box>

      <AnimatePresence mode="wait">
        {marketplace === "jupyter" && (
          <motion.div
            key="jupyter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <JupyterLabSessions isMobile={isMobile} isTablet={isTablet} />
          </motion.div>
        )}

        {marketplace === "tabby" && (
          <motion.div
            key="tabby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Tabby isMobile={isMobile} isTablet={isTablet} />
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

export default ChangeProjectsPage;
