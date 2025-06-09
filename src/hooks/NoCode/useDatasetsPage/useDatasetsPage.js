import { useEffect, useRef, useState } from "react";
import {
  getDatasets,
  deleteDataset,
  uploadDataset,
} from "../../../components/NoCode/api/datasetsApi";

export const useDatasetsPage = ({ currentOrganization }) => {
  const [data, setData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const fileInputRef = useRef();

  const organizationId = currentOrganization?.id;

  const refresh = () => {
    if (!organizationId) return Promise.resolve();
    return getDatasets(organizationId)
      .then(setData)
      .catch((err) => {
        console.error(err);
        setSnackbar({
          open: true,
          message: "Failed to load datasets.",
          severity: "error",
        });
      });
  };

  useEffect(() => {
    if (!organizationId) return;
    refresh();
  }, [organizationId]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !organizationId) return;
    setUploading(true);

    try {
      await uploadDataset(file, organizationId);
      setSnackbar({
        open: true,
        message: "Upload successful!",
        severity: "success",
      });
      refresh();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Upload failed.", severity: "error" });
    } finally {
      setUploading(false);
      fileInputRef.current.value = null;
    }
  };

  const handleDelete = async (id) => {
    if (!organizationId) return;
    try {
      await deleteDataset(id);
      setSnackbar({
        open: true,
        message: "Dataset deleted.",
        severity: "info",
      });
      refresh();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Delete failed.", severity: "error" });
    }
  };

  return {
    handleUpload,
    fileInputRef,
    uploading,
    data,
    handleDelete,
    snackbar,
    setSnackbar,
  };
};
