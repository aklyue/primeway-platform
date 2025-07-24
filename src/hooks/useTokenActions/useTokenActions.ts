import { AxiosResponse } from "axios";
import axiosInstance from "../../api";
import { ApiKey, GenerateTokenResponse, ListTokensResponse } from "../../types";

export const useTokenActions = () => {
  const generateToken = async (organizationId: string, name: string) => {
    try {
      const response: AxiosResponse<ApiKey> = await axiosInstance.post(
        "/generate-token",
        {
          organization_id: organizationId,
          name,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error generating token:", error);
      throw error;
    }
  };

  const listTokens = async (
    organizationId: string
  ): Promise<ListTokensResponse["tokens"]> => {
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

  const deleteToken = async (tokenId: string) => {
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
