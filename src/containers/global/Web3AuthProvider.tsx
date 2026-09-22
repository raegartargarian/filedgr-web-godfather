// src/containers/global/Web3AuthProvider.tsx
//
// The Web3Auth (v10) session lifecycle lives in @filedgr/web-core/auth. This
// file keeps only what is specific to this template: the env/chain config read
// from ledger.json and the per-domain origin signature from the template API,
// which lets the app log in from whatever domain the template is deployed on.
import { LoadingIndicator } from "@/shared/components/LoadingIndicator";
import { whiteListDomain } from "@/shared/providers/templateApi";
import {
  Web3AuthProvider as CoreWeb3AuthProvider,
  useWeb3Auth,
} from "@filedgr/web-core/auth";
import JSONFile from "@/json/ledger.json";
import React, { useCallback, useEffect, useState } from "react";
import { GlobalState } from "./types";
import {
  buildWeb3AuthOptions,
  getCorrectedOrigin,
  OriginData,
} from "./web3authConfig";

export { useWeb3Auth };
export type { Web3AuthContextType } from "@filedgr/web-core/auth";

const twinData = JSONFile as GlobalState["data"];

export const Web3AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // undefined = still fetching; null = unavailable (fall back to the domains
  // whitelisted on the Web3Auth dashboard).
  const [originData, setOriginData] = useState<OriginData | null | undefined>(
    undefined
  );

  useEffect(() => {
    let cancelled = false;
    whiteListDomain({
      nft_id: twinData?.vault.nftId ?? "",
      ledger: twinData?.vault.ledger ?? "POLYGON_ZKEVM",
    })
      .then((res) => {
        if (cancelled) return;
        if (!res?.signature) throw new Error("Failed to get origin signature");
        setOriginData({
          [getCorrectedOrigin(window.location.origin)]: res.signature,
        });
      })
      .catch((error) => {
        console.error("Web3Auth domain whitelisting error:", error);
        if (!cancelled) setOriginData(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const buildOptions = useCallback(
    () => buildWeb3AuthOptions(twinData?.env, originData ?? null),
    [originData]
  );

  if (originData === undefined) {
    return <LoadingIndicator fullPageHeight />;
  }

  return (
    <CoreWeb3AuthProvider buildOptions={buildOptions}>
      {children}
    </CoreWeb3AuthProvider>
  );
};
