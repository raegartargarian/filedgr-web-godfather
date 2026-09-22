// Network descriptor types come from @filedgr/web-core/web3; the concrete,
// template-specific list (logos, explorer URLs) stays here.
import type {
  INetworkModel,
  NETWORK_SERVER_NAMES,
} from "@filedgr/web-core/web3";

export type { INetworkModel, NETWORK_SERVER_NAMES };

// Network Configuration
export const SUPPORTED_NETWORKS: INetworkModel[] = [
  {
    id: "polygon",
    name: "Polygon",
    symbol: "MATIC",
    logoUrl: "https://cryptologos.cc/logos/polygon-matic-logo.png?v=025",
    chainId: 137,
    serverName: "POLYGON_ZKEVM",
    explorerUrl: "https://cardona-zkevm.polygonscan.com",
  },
  {
    id: "xrp",
    name: "XRP",
    symbol: "XRP",
    logoUrl: "https://cryptologos.cc/logos/xrp-xrp-logo.svg?v=025",
    chainId: 1,
    serverName: "XRPL",
    explorerUrl: "https://test.xrplexplorer.com",
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    logoUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=025",
    chainId: 1,
    serverName: "ETHEREUM",
    explorerUrl: "https://etherscan.io",
  },
  // {
  //   id: 'avalanche',
  //   name: 'Avalanche',
  //   symbol: 'AVAX',
  //   logoUrl: 'https://cryptologos.cc/logos/avalanche-avax-logo.svg?v=025',
  //   chainId: 43114,
  //   serverName:
  // },
  // {
  //   id: 'bnb',
  //   name: 'BNB Chain',
  //   symbol: 'BNB',
  //   logoUrl: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.svg?v=025',
  //   chainId: 56,
  // },
  // {
  //   id: 'arbitrum',
  //   name: 'Arbitrum',
  //   symbol: 'ARB',
  //   logoUrl: 'https://cryptologos.cc/logos/arbitrum-arb-logo.svg?v=025',
  //   chainId: 42161,
  // },
];

// Helper Functions
export const getSupportedNetworks = (
  includeTestnets: boolean = false
): INetworkModel[] => {
  return SUPPORTED_NETWORKS.filter(
    (network) => includeTestnets || !network.isTestnet
  );
};

export const getNetworkById = (id: string): INetworkModel | undefined => {
  return SUPPORTED_NETWORKS.find((network) => network.id === id);
};
export const getLedgerNameFromServerName = (
  serverName: string | undefined
): string => {
  return (
    SUPPORTED_NETWORKS.find((network) => network.serverName === serverName)
      ?.name || ""
  );
};
export const getNetworkLogoByServerName = (
  serverName: NETWORK_SERVER_NAMES | undefined
): string => {
  return (
    SUPPORTED_NETWORKS.find((network) => network.serverName === serverName)
      ?.logoUrl || ""
  );
};
export const getNetworkExplorerUrlByServerName = (
  serverName: NETWORK_SERVER_NAMES | undefined
): string => {
  return (
    SUPPORTED_NETWORKS.find((network) => network.serverName === serverName)
      ?.explorerUrl || ""
  );
};
