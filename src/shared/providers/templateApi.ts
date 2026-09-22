// Filedgr template API client. Endpoints come from @filedgr/web-core/api, bound
// to an axios instance that talks to the template API for this vault's env.
import { globalActions } from "@/containers/global/slice";
import { GlobalState } from "@/containers/global/types";
import JSONFile from "@/json/ledger.json";
import { store } from "@/main";
import { createFiledgrApi, PaginatedResponse } from "@filedgr/web-core/api";
import type { AttachmentModel, Ledger } from "@filedgr/web-core/upload";
import axios from "axios";
import { LocalStorageKeys } from "../utils/localStorageHelpers";
import { getTemplateApiUrl, resolveBearerToken } from "./templateApiConfig";

export interface DomainWhiteListRequest {
  nft_id: string;
  ledger: Ledger;
}

export interface DomainWhiteListResponse {
  nft_id: string;
  ledger: Ledger;
  signature: string;
}

const jsonData = JSONFile as GlobalState["data"];

export const templateApiClient = axios.create({
  baseURL: getTemplateApiUrl(jsonData?.env),
  headers: { "Content-Type": "application/json" },
});

templateApiClient.interceptors.request.use((config) => {
  const bearer = resolveBearerToken(
    localStorage.getItem(LocalStorageKeys.jwtAccessKey),
    () => store.dispatch(globalActions.logOut())
  );
  config.headers.Authorization = `Bearer ${bearer}`;
  return config;
});

const api = createFiledgrApi(templateApiClient);

export const getTokensAttachment = async (params: {
  tokenCode: string;
  page: number;
  pageSize: number;
}): Promise<PaginatedResponse<AttachmentModel>> => {
  const response = await api.getTokenAttachments(
    params.tokenCode,
    params.page,
    params.pageSize
  );
  return response.data;
};

export const getAttachmentDetail = async (
  id: string
): Promise<AttachmentModel> => {
  const response = await api.getSingleAttachment(id);
  return response.data;
};

/**
 * Signs this deployment's origin so Web3Auth accepts logins from it. Not part
 * of web-core (it is template-API specific), so it is called directly.
 */
export const whiteListDomain = async (
  input: DomainWhiteListRequest
): Promise<DomainWhiteListResponse> => {
  const response = await templateApiClient.post<DomainWhiteListResponse>(
    "/subdomains",
    input
  );
  return response.data;
};
