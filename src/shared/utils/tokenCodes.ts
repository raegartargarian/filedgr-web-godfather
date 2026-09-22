import { GlobalState, TokenCodeModel } from "@/containers/global/types";
import JSONFile from "@/json/ledger.json";

export const getTokenCodes = (): TokenCodeModel[] => {
  const data = JSONFile as GlobalState["data"];
  const tokenCodes = extractTokens(data);

  if (!tokenCodes) {
    throw new Error("No token codes found");
  }
  return tokenCodes;
};

export function extractTokens(
  data: GlobalState["data"]
): TokenCodeModel[] | undefined {
  return data?.vault.streams.map(
    (token: { trait_type: string; description: string; value: string }) => {
      const nameMatch = token.description.match(
        /The stream mapped to the (.*?) field/
      );
      const name = nameMatch ? nameMatch[1] : "unknown";
      return {
        name: name.toLowerCase(),
        value: token.value,
      };
    }
  );
}
