import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Avatar,
  CircularProgress,
  TextField,
  InputAdornment,
} from "@mui/material";
import MarketplaceToggle from "../../UI/MarketplaceToggle";
import { useNavigate } from "react-router-dom";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { Code, Search as SearchIcon } from "@mui/icons-material";
import { cardsInfo } from "../../constants/cardsInfo";

function ChangeProjectsPage({ isMobile, isTablet }) {
  const navigate = useNavigate();
  const [metadata, setMetadata] = useState({});
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [iconsLoaded, setIconsLoaded] = useState(false);

  useEffect(() => {
    let loadedCount = 0;

    const handleLoad = () => {
      loadedCount += 1;
      if (loadedCount === cardsInfo.length) {
        setIconsLoaded(true);
      }
    };

    cardsInfo.forEach((card) => {
      const img = new Image();
      img.src = card.icon;
      img.onload = handleLoad;
      img.onerror = handleLoad;
    });
  }, []);

  const filteredCards = cardsInfo.filter(
    (card) =>
      card.title.toLowerCase().includes(search.toLowerCase()) ||
      card.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ my: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Code />
          <Typography
            ml={1}
            fontSize={"1.25rem"}
            fontWeight={500}
            data-tour-id="marketplace-header"
          >
            AI Маркетплейс
          </Typography>
        </Box>
      </Box>

      {!iconsLoaded ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80dvh",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box
          mt={2}
          display="grid"
          gridTemplateColumns={isMobile || isTablet ? "1fr" : "repeat(3, 1fr)"}
          gap={2}
        >
          {filteredCards.map((card, idx) => {
            const repoMeta = metadata[card.repo] || {};
            return (
              <Card
                key={card.to}
                variant="outlined"
                onClick={() => navigate(card.to)}
                data-tour-id={idx === 1 ? "project-card" : undefined}
                sx={{
                  cursor: "pointer",
                  transition: "box-shadow 0.2s",
                  "&:hover": { boxShadow: 3 },
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <CardContent sx={{ pb: "16px !important" }}>
                  <Typography variant="caption" color="text.secondary">
                    {card.version}
                  </Typography>

                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <Avatar
                      src={card.icon}
                      alt={card.title}
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor:
                          card.repo === "TabbyML/tabby"
                            ? "#597ad3"
                            : "transparent", // Синий фон
                        p: card.repo === "TabbyML/tabby" ? 0.5 : 0,
                      }}
                      variant="rounded"
                    />
                    <Typography variant="h6">{card.title}</Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {card.description}
                  </Typography>
                </CardContent>

                <Box
                  borderTop={"1px solid lightgray"}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ p: 1 }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {card.repo}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <StarBorderIcon fontSize="small" />
                    <Typography variant="caption">{card.stars}</Typography>
                  </Box>
                </Box>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

export default ChangeProjectsPage;
