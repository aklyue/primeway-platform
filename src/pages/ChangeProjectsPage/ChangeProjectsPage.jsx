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

const cardsInfo = [
  {
    title: "JupyterLab Sessions",
    description:
      "Интерактивная среда для работы с ноутбуками, кодом и данными прямо в браузере.",
    repo: "jupyterlab/jupyterlab",
    to: "/jupyter",
    icon: "https://raw.githubusercontent.com/jupyterlab/jupyterlab/main/jupyterlab.svg",
    stars: 14643,
    version: "v4.4.3",
  },
  {
    title: "Copilot Альтернатива",
    description:
      "Самостоятельно размещаемый ИИ-ассистент для автодополнения кода.",
    repo: "TabbyML/tabby",
    to: "/tabby",
    icon: "https://raw.githubusercontent.com/TabbyML/tabby/main/website/static/img/tabby-social-card.png",
    stars: 31404,
    version: "v0.29.0",
  },
];

function ChangeProjectsPage({ isMobile, isTablet }) {
  const navigate = useNavigate();
  const [metadata, setMetadata] = useState({});
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // useEffect(() => {
  //   cardsInfo.forEach(({ repo }) => {
  //     const fetchRepoData = async () => {
  //       try {
  //         const [repoRes, releaseRes] = await Promise.all([
  //           fetch(`https://api.github.com/repos/${repo}`),
  //           fetch(`https://api.github.com/repos/${repo}/releases/latest`),
  //         ]);

  //         if (!repoRes.ok || !releaseRes.ok) {
  //           throw new Error("GitHub API error");
  //         }

  //         const repoJson = await repoRes.json();
  //         const releaseJson = await releaseRes.json();

  //         setMetadata((prev) => ({
  //           ...prev,
  //           [repo]: {
  //             stars: repoJson.stargazers_count || 0,
  //             version: releaseJson.tag_name || "N/A",
  //           },
  //         }));
  //       } catch (err) {
  //         console.warn(`Ошибка при загрузке данных GitHub для ${repo}:`, err);
  //         setMetadata((prev) => ({
  //           ...prev,
  //           [repo]: { stars: 0, version: "N/A" },
  //         }));
  //         setError(err.message);
  //       }
  //     };

  //     fetchRepoData();
  //   });
  // }, []);

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
          <Typography ml={1} fontSize={"1.25rem"} fontWeight={500}>
            AI Маркетплейс
          </Typography>
        </Box>
      </Box>

      {!cardsInfo.length ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          mt={2}
          display="grid"
          gridTemplateColumns={isMobile || isTablet ? "1fr" : "repeat(3, 1fr)"}
          gap={2}
        >
          {filteredCards.map((card) => {
            const repoMeta = metadata[card.repo] || {};
            return (
              <Card
                key={card.to}
                variant="outlined"
                onClick={() => navigate(card.to)}
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
