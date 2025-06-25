import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AnimatePresence, motion } from "framer-motion";
import { Box, CircularProgress } from "@mui/material";
import PageHints from "./components/PageHints";

const HomePage = lazy(() => import("./pages/HomePage"));
const Settings = lazy(() => import("./components/Settings"));
const GPUList = lazy(() => import("./components/GPUList"));
const Tasks = lazy(() => import("./components/Tasks/Tasks"));
const DatasetsPage = lazy(() =>
  import("./components/NoCode/pages/DatasetsPage")
);
const ChangeProjectsPage = lazy(() => import("./pages/ChangeProjectsPage"));
const JupyterLabSessions = lazy(() =>
  import("./components/NoCode/components/JupyterLab")
);
const Tabby = lazy(() => import("./components/NoCode/components/Tabby"));
const CreateTabbyPage = lazy(() => import("./pages/CreateTabbyPage"));
const TrainPage = lazy(() => import("./components/NoCode/pages/TrainPage"));
const FineTuningJobCreatePage = lazy(() =>
  import("./components/NoCode/pages/FineTuningJobCreatePage")
);
const FineTuneJobDetails = lazy(() =>
  import("./components/NoCode/components/FineTuneJobDetails")
);
const ModelsPage = lazy(() => import("./pages/ModelsPage"));
const ModelCreatePage = lazy(() => import("./pages/ModelCreatePage"));
const SpecificModelPage = lazy(() =>
  import("./pages/SpecificModelPage/SpecificModelPage")
);
const Billing = lazy(() => import("./components/Billing"));
const ApiKeys = lazy(() => import("./components/ApiKeys"));
const OrganizationSettings = lazy(() =>
  import("./components/Organization/OrganizationSettings")
);
const Docs = lazy(() => import("./components/Docs"));
const AuthCallback = lazy(() => import("./components/AuthCallback"));

const Router = ({
  isMobile,
  isTablet,
  shouldRenderContent,
  setAuthenticating,
  dashboardMenuItems,
  itemsInRow,
  itemsInLastRow,
  setShowMenu,
  total,
}) => {
  const location = useLocation();

  return (
    <>
      <PageHints />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
          style={{
            width: "100%",
            display: shouldRenderContent ? "block" : "none",
          }}
        >
          <Suspense
            fallback={
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  minHeight: "80vh",
                  alignItems: "center",
                }}
              >
                <CircularProgress />
              </Box>
            }
          >
            <Routes location={location}>
              <Route
                path="/"
                element={
                  <HomePage
                    dashboardMenuItems={dashboardMenuItems}
                    itemsInRow={itemsInRow}
                    itemsInLastRow={itemsInLastRow}
                    setShowMenu={setShowMenu}
                    total={total}
                  />
                }
              />
              <Route
                path="/gpu-list"
                element={
                  <ProtectedRoute>
                    <GPUList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <Tasks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/datasets"
                element={
                  <ProtectedRoute>
                    <DatasetsPage isMobile={isMobile} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/marketplace"
                element={
                  <ProtectedRoute>
                    <ChangeProjectsPage
                      isMobile={isMobile}
                      isTablet={isTablet}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jupyter"
                element={
                  <ProtectedRoute>
                    <JupyterLabSessions
                      isMobile={isMobile}
                      isTablet={isTablet}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tabby"
                element={
                  <ProtectedRoute>
                    <Tabby isMobile={isMobile} isTablet={isTablet} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tabby-create"
                element={
                  <ProtectedRoute>
                    <CreateTabbyPage isMobile={isMobile} isTablet={isTablet} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fine-tuning"
                element={
                  <ProtectedRoute>
                    <TrainPage isMobile={isMobile} isTablet={isTablet} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fine-tuning/new"
                element={
                  <ProtectedRoute>
                    <FineTuningJobCreatePage isMobile={isMobile} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fine-tuning/jobs/:jobId"
                element={
                  <ProtectedRoute>
                    <FineTuneJobDetails isMobile={isMobile} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/models"
                element={
                  <ProtectedRoute>
                    <ModelsPage isMobile={isMobile} isTablet={isTablet} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/model-create"
                element={
                  <ProtectedRoute>
                    <ModelCreatePage isMobile={isMobile} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/models/:modelId"
                element={
                  <ProtectedRoute>
                    <SpecificModelPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/billing"
                element={
                  <ProtectedRoute>
                    <Billing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/api-keys"
                element={
                  <ProtectedRoute>
                    <ApiKeys />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings setAuthenticating={setAuthenticating} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organization-settings"
                element={
                  <ProtectedRoute>
                    <OrganizationSettings />
                  </ProtectedRoute>
                }
              />
              <Route path="/docs" element={<Navigate to="/docs/welcome" />} />
              <Route
                path="/docs/:docName"
                element={
                  <ProtectedRoute>
                    <Docs />
                  </ProtectedRoute>
                }
              />
              <Route path="/auth/callback" element={<AuthCallback />} />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default Router;
