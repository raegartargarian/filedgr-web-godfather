import { GlobalState } from "@/containers/global/types";
import JSONFile from "@/json/ledger.json";
import { chainTxUrl } from "@filedgr/web-core/explorer";
import { getNetworkExplorerUrlByServerName } from "./networks";

export const openViewVaultExplorer = () => {
  const data = JSONFile as GlobalState["data"];
  if (!data) {
    throw new Error("No data found");
  }
  const vault = data.vault.nftId;
  const ledger = data.vault.ledger;
  const explorer = getNetworkExplorerUrlByServerName(ledger);
  window.open(`${explorer}/nft/${vault}`, "_blank");
};
export const viewTXInExplorer = (tx: string) => {
  const data = JSONFile as GlobalState["data"];
  if (!data) {
    throw new Error("No data found");
  }
  const ledger = data.vault.ledger;
  const explorer = getNetworkExplorerUrlByServerName(ledger);
  window.open(chainTxUrl(explorer, tx), "_blank");
};
