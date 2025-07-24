/* src/api/datasetsApi.js */
import axiosInstance from "../../../api";
import { Dataset } from "../../../types";

// Fetch list of datasets
export const getDatasets = (organizationId: string): Promise<Dataset[]> =>
  axiosInstance
    .get("/datasets/get-datasets", {
      params: { organization_id: organizationId },
    })
    .then((res) => res.data);

// Upload a new dataset (server generates dataset_id internally)
export const uploadDataset = (file: File, organizationId: string) => {
  const formData = new FormData();
  // The DatasetCreate schema only needs 'name'
  formData.append("name", file.name);
  formData.append("file", file);

  // We can pass any placeholder for dataset_id in path; FastAPI ignores it and generates its own

  return axiosInstance
    .post(`/datasets/upload`, formData, {
      params: { organization_id: organizationId },
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};

// Delete a dataset
export const deleteDataset = (
  datasetId: string
): Promise<{ success: boolean }> =>
  axiosInstance.delete(`/datasets/delete/${datasetId}`).then((res) => res.data);
