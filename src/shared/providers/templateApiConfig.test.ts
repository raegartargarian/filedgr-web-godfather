import { describe, expect, it, vi } from "vitest";
import {
  getTemplateApiUrl,
  PUBLIC_BEARER_TOKEN,
  resolveBearerToken,
  TEMPLATE_API_URLS,
} from "./templateApiConfig";

const makeJwt = (exp: number) =>
  `header.${btoa(JSON.stringify({ exp }))}.signature`;

describe("getTemplateApiUrl", () => {
  it("maps each ledger.json env to its template API", () => {
    expect(getTemplateApiUrl("DEVELOPMENT")).toBe(
      "https://template-api.dev.filedgr.network"
    );
    expect(getTemplateApiUrl("TESTNET")).toBe(
      "https://template-api.test.filedgr.network"
    );
    expect(getTemplateApiUrl("MAINNET")).toBe(
      "https://template-api.filedgr.network"
    );
  });

  it("falls back to production when env is missing", () => {
    expect(getTemplateApiUrl(undefined)).toBe(TEMPLATE_API_URLS.MAINNET);
    expect(getTemplateApiUrl(null)).toBe(TEMPLATE_API_URLS.MAINNET);
  });
});

describe("resolveBearerToken", () => {
  it("uses the public token when nothing is stored", () => {
    const onExpired = vi.fn();
    expect(resolveBearerToken(null, onExpired)).toBe(PUBLIC_BEARER_TOKEN);
    expect(resolveBearerToken("", onExpired)).toBe(PUBLIC_BEARER_TOKEN);
    expect(onExpired).not.toHaveBeenCalled();
  });

  it("returns a valid token with JSON quotes stripped", () => {
    const token = makeJwt(Math.floor(Date.now() / 1000) + 3600);
    const onExpired = vi.fn();
    expect(resolveBearerToken(`"${token}"`, onExpired)).toBe(token);
    expect(onExpired).not.toHaveBeenCalled();
  });

  it("falls back to the public token and reports an expired token", () => {
    const onExpired = vi.fn();
    const token = makeJwt(Math.floor(Date.now() / 1000) - 60);
    expect(resolveBearerToken(token, onExpired)).toBe(PUBLIC_BEARER_TOKEN);
    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  it("treats an unparseable token as expired", () => {
    const onExpired = vi.fn();
    expect(resolveBearerToken("not-a-jwt", onExpired)).toBe(
      PUBLIC_BEARER_TOKEN
    );
    expect(onExpired).toHaveBeenCalledTimes(1);
  });
});
