import axiosInstance from "../../api";

export const useTokenActions = () => {
  const generateToken = async (organizationId, name) => {
    try {
      const response = await axiosInstance.post("/generate-token", {
        organization_id: organizationId,
        name,
      });
      return response.data;
    } catch (error) {
      console.error("Error generating token:", error);
      throw error;
    }
  };

  const listTokens = async (organizationId) => {
    try {
      const response = await axiosInstance.get("/list-tokens", {
        params: { organization_id: organizationId },
      });
      return response.data.tokens;
    } catch (error) {
      console.error("Error fetching tokens:", error);
      throw error;
    }
  };

  const deleteToken = async (tokenId) => {
    try {
      await axiosInstance.delete(`/tokens/${tokenId}`);
    } catch (error) {
      console.error("Error deleting token:", error);
      throw error;
    }
  };

  return {
    generateToken,
    listTokens,
    deleteToken,
  };
};
