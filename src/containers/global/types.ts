import { NETWORK_SERVER_NAMES } from "@/shared/utils/networks";
import type { AttachmentModel } from "@filedgr/web-core/upload";
import type { IProvider } from "@web3auth/modal";
export interface JSONNft {
  vault: Vault;
  data: Data;
  env: ENV_TYPE;
}
export type ENV_TYPE = "DEVELOPMENT" | "TESTNET" | "MAINNET";

interface Data {
  image: string;
  nft_name: string;
}

interface Vault {
  nftId: string;
  ledger: NETWORK_SERVER_NAMES;
  streams: Stream[];
}

interface Stream {
  trait_type: string;
  description: string;
  value: string;
}
export interface PaginatedResponse<T> {
  content: T[];
  total_records: number;
  current_page: number;
  total_pages: number;
}
export interface TokenCodeModel {
  name: string;
  value: string;
}

export interface MovieInfo {
  title: string;
  subtitle?: string;
  director: string;
  year: number;
  duration: string;
  genre: string;
  description: string;
  longDescription: string;
  cast: string[];
  festivals: FestivalAward[];
  quotes: MovieQuote[];
  reviews?: MovieReview[];
  comparatives?: MovieComparative[];
  totalFractions: number;
  pricePerFraction: number;
  availableFractions: number;
}

export interface FestivalAward {
  name: string;
  award?: string;
  year: number;
  category?: string;
}

export interface MovieQuote {
  text: string;
  author: string;
  context?: string;
}

export interface MovieReview {
  publication: string;
  quote: string;
  rating?: string;
}

export interface MovieComparative {
  title: string;
  awards?: string;
  domestic?: string;
  international?: string;
}

export interface GlobalState {
  data: JSONNft | null;
  movieData: {
    movieInfo: MovieInfo;
    video: { name: string; blob: Blob } | null;
    images: Array<{ name: string; blob: Blob }>;
    documents: Array<{ name: string; blob: Blob }>;
  } | null;
  authData?: {
    login: () => Promise<void>;
    isLoading: boolean;
    isAuthenticated: boolean;
    userWeb3?: UserWeb3Model;
    logout: () => Promise<void>;
    provider: IProvider | null;
    error: any;
  };
  isAuthModalOpen: boolean;
  isPurchaseModalOpen: boolean;
  attachmentInfo: AttachmentModel | null;
}

export interface UserWeb3Model {
  email?: string;
  name?: string;
  profileImage?: string;
  typeOfLogin?: string;
  idToken?: string;
}

// Keep propertyData for backward compatibility during transition
export interface PropertyInfo {
  // Mandatory fixed fields
  nameOfProject: string;
  assetClass: string;
  assetManagerName: string;
  country: string;
  city: string;
  street: string;
  cityDistrict: string;
  plotArea: number; // in m²
  grossFloorArea: number; // in m²
  leasableArea: number; // in m²
  tenantMix: string;
  vacancyRate: number; // as %
  yearOfConstruction: number;
  propertyStatus: string;
  sustainabilityCertificate: string;

  // Optional variable fields
  assetId?: string;
  tokenIssuer?: string;
  tokenMarketplace?: string;
  foundedIn?: number;
  headquarter?: string;
  companySize?: string;
  linkedInProfile?: string;
  website?: string;
  locationQuality?: string;
  publicTransportConnection?: string;
  netDevelopableLand?: number; // in m²
  netAnnualRent?: number;
  remainingLeaseTerm?: string;
  buildingQuality?: string;
  carParkingSpaces?: number;
  numberOfFloors?: number;
  elevator?: boolean;
  totalEnergy?: number; // in kWh/(m²a)
  greenhouseGasEmissions?: number; // in kg CO₂/(m²a)

  // Location coordinates for map
  coordinates: {
    latitude: number;
    longitude: number;
  };
}
