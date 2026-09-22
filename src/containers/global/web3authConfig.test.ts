import { describe, expect, it } from "vitest";
import {
  buildChainConfig,
  buildWeb3AuthOptions,
  getCorrectedOrigin,
} from "./web3authConfig";

describe("getCorrectedOrigin", () => {
  it("strips a trailing slash or hash", () => {
    expect(getCorrectedOrigin("https://gambino.example/")).toBe(
      "https://gambino.example"
    );
    expect(getCorrectedOrigin("https://gambino.example#")).toBe(
      "https://gambino.example"
    );
    expect(getCorrectedOrigin("https://gambino.example")).toBe(
      "https://gambino.example"
    );
  });
});

describe("buildChainConfig", () => {
  it("uses Polygon mainnet on MAINNET", () => {
    const config = buildChainConfig("MAINNET");
    expect(config.chainId).toBe("0x89");
    expect(config.displayName).toBe("Polygon");
  });

  it("uses Polygon Amoy everywhere else", () => {
    expect(buildChainConfig("TESTNET").chainId).toBe("0x13882");
    expect(buildChainConfig("DEVELOPMENT").chainId).toBe("0x13882");
  });
});

describe("buildWeb3AuthOptions", () => {
  it("selects the network and client id for the env", () => {
    const mainnet = buildWeb3AuthOptions("MAINNET", null);
    const testnet = buildWeb3AuthOptions("TESTNET", null);
    expect(mainnet.web3AuthNetwork).toBe("sapphire_mainnet");
    expect(testnet.web3AuthNetwork).toBe("sapphire_devnet");
    expect(mainnet.clientId).not.toBe(testnet.clientId);
    expect(mainnet.defaultChainId).toBe(mainnet.chains?.[0].chainId);
  });

  it("registers an auth connector only when an origin signature exists", () => {
    expect(buildWeb3AuthOptions("TESTNET", null).connectors).toBeUndefined();
    const withOrigin = buildWeb3AuthOptions("TESTNET", {
      "https://gambino.example": "sig",
    });
    expect(withOrigin.connectors).toHaveLength(1);
    expect(typeof withOrigin.connectors?.[0]).toBe("function");
  });

  it("requires an env", () => {
    expect(() => buildWeb3AuthOptions(undefined, null)).toThrow(
      "Environment is required"
    );
  });
});
