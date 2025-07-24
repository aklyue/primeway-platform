export interface ApiKey {
  id: string;
  name: string;
  masked_token: string;
  token: string;
  created_at: string;
  organization_id: string;
}

export interface GenerateTokenResponse {
  data: {
    name: string;
    organization_id: string;
  };
}

export interface ListTokensResponse {
  tokens: {
    id: string;
    name: string;
    organization_id: string;
    created_at: string;
    masked_token: string;
  }[];
}
