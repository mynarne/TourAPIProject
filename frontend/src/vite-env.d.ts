/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface GoogleCredentialResponse { credential: string; }
interface GoogleIdentityApi {
  initialize(options: { client_id: string; callback: (response: GoogleCredentialResponse) => void; auto_select?: boolean; cancel_on_tap_outside?: boolean }): void;
  renderButton(element: HTMLElement, options: Record<string, string>): void;
}
interface Window { google: { accounts: { id: GoogleIdentityApi } }; }
