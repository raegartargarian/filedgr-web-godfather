// Template-specific Web3Auth configuration: env/chain from ledger.json and the
// backend-issued origin signature. Consumed by ./Web3AuthProvider.
import { getClientIdForEnv } from "@/shared/utils/envHelper";
import {
  authConnector,
  CHAIN_NAMESPACES,
  WEB3AUTH_NETWORK,
  Web3AuthOptions,
} from "@web3auth/modal";
import { ENV_TYPE } from "./types";

export type OriginData = Record<string, string>;

/** The page origin without a trailing `/` or `#`, as the signature is issued for. */
export const getCorrectedOrigin = (origin: string): string =>
  origin.replace(/\/$|#$/g, "");

export const buildChainConfig = (env?: ENV_TYPE) => {
  const isMainnet = env === "MAINNET";
  return {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: isMainnet
      ? "0x89" // hex of 137, mainnet
      : "0x13882", // hex of 80002, polygon testnet
    rpcTarget: isMainnet
      ? "https://patient-attentive-moon.matic.quiknode.pro/e421f30bfdbed3036e4168567a9b21afabd9d77b/"
      : "https://withered-hidden-meme.matic-amoy.quiknode.pro/2573d0529c060b351ab3e634c4a1d5c1b1640081/",
    displayName: isMainnet ? "Polygon" : "Polygon Amoy Testnet",
    blockExplorerUrl: "https://amoy.polygonscan.com/",
    ticker: "POL",
    tickerName: "Polygon Ecosystem Token",
    logo: "https://cryptologos.cc/logos/polygon-matic-logo.png",
  };
};

export const buildWeb3AuthOptions = (
  env: ENV_TYPE | undefined,
  originData: OriginData | null
): Web3AuthOptions => {
  const chainConfig = buildChainConfig(env);
  return {
    clientId: getClientIdForEnv(env),
    web3AuthNetwork:
      env === "MAINNET"
        ? WEB3AUTH_NETWORK.SAPPHIRE_MAINNET
        : WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    chains: [chainConfig],
    defaultChainId: chainConfig.chainId,
    // Registered ahead of the SDK's default auth connector (which is then
    // skipped as a duplicate) so the backend-issued origin signature is used.
    connectors: originData
      ? [authConnector({ connectorSettings: { originData } })]
      : undefined,
  };
};
