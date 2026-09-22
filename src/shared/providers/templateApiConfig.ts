// Pure configuration for the Filedgr template API (no store / network access),
// kept separate from the client so it can be unit tested in isolation.
import type { ENV_TYPE } from "@/containers/global/types";
import { isJwtExpired } from "@filedgr/web-core/api";

export const TEMPLATE_API_URLS: Record<ENV_TYPE, string> = {
  DEVELOPMENT: "https://template-api.dev.filedgr.network",
  TESTNET: "https://template-api.test.filedgr.network",
  MAINNET: "https://template-api.filedgr.network",
};

/** Template API base URL for a ledger.json `env`; unknown/missing → production. */
export const getTemplateApiUrl = (env?: ENV_TYPE | null): string =>
  env === "DEVELOPMENT" || env === "TESTNET"
    ? TEMPLATE_API_URLS[env]
    : TEMPLATE_API_URLS.MAINNET;

/** The template API accepts anonymous reads with this bearer value. */
export const PUBLIC_BEARER_TOKEN = "public";

/**
 * Bearer value for a stored access token: the (unquoted) JWT when it is still
 * valid, otherwise the public token. `onExpired` fires for an expired or
 * unparseable token so the caller can end the session.
 */
export const resolveBearerToken = (
  storedToken: string | null | undefined,
  onExpired?: () => void
): string => {
  if (!storedToken) return PUBLIC_BEARER_TOKEN;
  const token = storedToken.replace(/"/g, "");
  if (isJwtExpired(token)) {
    onExpired?.();
    return PUBLIC_BEARER_TOKEN;
  }
  return token;
};
