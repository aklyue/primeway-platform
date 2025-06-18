import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

const HomePage = ({
  dashboardMenuItems,
  itemsInRow,
  itemsInLastRow,
  setShowMenu,
  total
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <Typography variant="h3" gutterBottom sx={{ mb: 5, mt: 2 }}>
        Добро пожаловать в PrimeWay
      </Typography>

      <Grid container spacing={4} sx={{ maxWidth: "1500px" }}>
        {dashboardMenuItems.map((item, idx) => {
          if (
            Math.floor(idx / itemsInRow) ===
              Math.floor((total - 1) / itemsInRow) &&
            idx % itemsInRow === 0 &&
            itemsInLastRow < itemsInRow
          ) {
            const emptyCols = Math.floor((itemsInRow - itemsInLastRow) / 2);
            return (
              <React.Fragment key={item.to}>
                {Array.from({ length: emptyCols }).map((_, i) => (
                  <Grid
                    item
                    md={4}
                    key={`empty-${i}`}
                    sx={{ display: { xs: "none", md: "block" } }}
                  />
                ))}
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    component={Link}
                    to={item.to}
                    onClick={() => setShowMenu(true)}
                    sx={{
                      flexGrow: 1,
                      height: "100%",
                      textDecoration: "none",
                      transition: "transform 0.2s",
                      "&:hover": {
                        transform: "scale(1.03)",
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardActionArea sx={{ flexGrow: 1, height: "100%" }}>
                      <CardContent
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          p: 2.5,
                          backgroundColor: "#fff",
                          boxShadow: 2,
                          borderRadius: "6px",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 2,
                            width: "100%",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="h5" component="div">
                            {item.name}
                          </Typography>
                          <Box
                            sx={{
                              transform: "scale(1.1)",
                              borderRadius: "50%",
                              bgcolor: "#5282ff",
                              width: 40,
                              height: 40,
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            {item.icon}
                          </Box>
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ width: "100%" }}
                        >
                          {item.description}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              </React.Fragment>
            );
          }
          return (
            <Grid item xs={12} sm={6} md={4} key={item.to}>
              <Card
                component={Link}
                to={item.to}
                onClick={() => setShowMenu(true)}
                sx={{
                  flexGrow: 1,
                  height: "100%",
                  textDecoration: "none",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.03)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardActionArea sx={{ flexGrow: 1, height: "100%" }}>
                  <CardContent
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      p: 2.5,
                      backgroundColor: "#fff",
                      boxShadow: 2,
                      borderRadius: "6px",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 2,
                        width: "100%",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="h5" component="div">
                        {item.name}
                      </Typography>
                      <Box
                        sx={{
                          transform: "scale(1.1)",
                          borderRadius: "50%",
                          bgcolor: "#5282ff",
                          width: 40,
                          height: 40,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {item.icon}
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ width: "100%" }}
                    >
                      {item.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default HomePage;
