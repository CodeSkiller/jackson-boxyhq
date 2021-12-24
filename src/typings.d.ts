export type IdPConfig = {
  defaultRedirectUrl: string;
  redirectUrl: string;
  tenant: string;
  product: string;
  rawMetadata: string;
};

// TODO: Need a better interface name
export interface Client {
  client_id: string;
  client_secret: string;
  provider: string;
}

// TODO: Suggest an interface name
export type IABC =
  | {
      clientID: string;
      clientSecret?: string;
      tenant?: string;
      product?: string;
    }
  | {
      clientID?: string;
      clientSecret?: string;
      tenant: string;
      product: string;
    };

export interface ISAMLConfig {
  // Ensure backward compatibility
  config(body: IdPConfig): Promise<Client>;
  getConfig(body: IABC): Promise<Partial<Client>>;
  deleteConfig(body: IABC): Promise<void>;

  create(body: IdPConfig): Promise<Client>;
  get(body: IABC): Promise<Partial<Client>>;
  delete(body: IABC): Promise<void>;
}

export interface IOAuthController {
  authorize(body: OAuthReqBody): Promise<{ redirect_url: string }>;
  samlResponse(body: SAMLResponsePayload): Promise<{ redirect_url: string }>;
  token(body: OAuthTokenReq): Promise<OAuthTokenRes>;
  userInfo(body: string): Promise<Profile>;
}

export interface OAuthReqBody {
  response_type: 'code';
  client_id: string;
  redirect_uri: string;
  state: string;
  tenant: string;
  product: string;
  code_challenge: string;
  code_challenge_method: 'plain' | 'S256' | '';
  provider: 'saml';
}

export interface SAMLResponsePayload {
  SAMLResponse: string;
  RelayState: string;
}

export interface OAuthTokenReq {
  client_id: string;
  client_secret: string;
  code_verifier: string;
  code: string;
  grant_type: 'authorization_code';
}

export interface OAuthTokenRes {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
}

export interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Index {
  name: string;
  value: string;
}

export interface DatabaseDriver {
  get(key: string);
  put(key: string, value: any, indexes: Index[]);
  delete(key: string);
  getByIndex(idx: Index);
}

export interface StoreContract extends DatabaseDriver {
  namespace: string;
  db: DatabaseDriver;
  ttl: string;
}

export interface Encrypted {
  iv: string;
  tag: string;
  value: string;
}

export type EncryptionKey = any;
