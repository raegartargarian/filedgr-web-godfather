import { describe, expect, it } from "vitest";
import { extractTokens } from "./tokenCodes";

describe("extractTokens", () => {
  it("derives the field name from each stream description", () => {
    const tokens = extractTokens({
      env: "TESTNET",
      data: { image: "cid", nft_name: "Vault" },
      vault: {
        nftId: "1",
        ledger: "XRPL",
        streams: [
          {
            trait_type: "Data Stream",
            description: "The stream mapped to the Video field",
            value: "FLDGR_video",
          },
          {
            trait_type: "Data Stream",
            description: "Something else entirely",
            value: "FLDGR_other",
          },
        ],
      },
    });

    expect(tokens).toEqual([
      { name: "video", value: "FLDGR_video" },
      { name: "unknown", value: "FLDGR_other" },
    ]);
  });

  it("returns undefined when there is no ledger data", () => {
    expect(extractTokens(null)).toBeUndefined();
  });
});
