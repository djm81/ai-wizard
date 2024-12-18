export interface GoogleOAuthResponse {
  access_token: string;
  error?: string;
}

export interface TokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: GoogleOAuthResponse) => void;
}

export interface GoogleTokenClient {
  requestAccessToken: (config: TokenClientConfig) => void;
}

export interface GoogleAuthAPI {
  accounts: {
    oauth2: {
      initTokenClient: (config: TokenClientConfig) => GoogleTokenClient;
    };
  };
}
