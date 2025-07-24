import { useEffect, useRef, useState } from "react";
import {
  getDatasets,
  deleteDataset,
  uploadDataset,
} from "../../../components/NoCode/api/datasetsApi";
import { Organization } from "../../../store/slices/authSlice";
import { Dataset } from "../../../types";

interface useDatasetsPageProps {
  currentOrganization: Organization | null;
}

export const useDatasetsPage = ({
  currentOrganization,
}: useDatasetsPageProps) => {
  const [data, setData] = useState<Dataset[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const organizationId = currentOrganization?.id;

  const refresh = () => {
    if (!organizationId) return Promise.resolve();
    setLoading(true);
    return getDatasets(organizationId)
      .then(setData)
      .catch((err) => {
        console.error(err);
        setSnackbar({
          open: true,
          message: "Failed to load datasets.",
          severity: "error",
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!organizationId) return;
    refresh();
  }, [organizationId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (id: string) => {
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
    loading,
    data,
    handleDelete,
    snackbar,
    setSnackbar,
  };
};
