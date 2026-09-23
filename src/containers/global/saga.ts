// src/containers/global/saga.ts
import JSONFile from "@/json/ledger.json";
import {
  getAttachmentDetail,
  getTokensAttachment,
} from "@/shared/providers/templateApi";
import { getIPFSIMGAddrPrivate } from "@/shared/utils/getIPFSAddrs";
import { LocalStorageKeys } from "@/shared/utils/localStorageHelpers";
import { getTokenCodes } from "@/shared/utils/tokenCodes";
import { processZipFile } from "@/shared/utils/zipHandler";
import { call, put, select, takeLatest } from "redux-saga/effects";
import { GlobalSelectors } from "./selectors";
import { globalActions } from "./slice";
import { GlobalState, MovieInfo } from "./types";

// Bundled fallback media, used when the vault's content can't be fetched.
import fixtureImage from "@/shared/fixtures/GodFather.png";
import fixtureVideo from "@/shared/fixtures/GodFather.mp4";

type MediaFile = { name: string; blob: Blob };

async function fetchAsBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }
  return response.blob();
}

/** Fill whatever the API/IPFS fetch left empty with the local fixtures. */
async function withFixtureFallback<
  T extends { video: MediaFile | null; images: MediaFile[] },
>(data: T): Promise<T> {
  const [video, image] = await Promise.all([
    data.video ? null : fetchAsBlob(fixtureVideo),
    data.images.length > 0 ? null : fetchAsBlob(fixtureImage),
  ]);
  return {
    ...data,
    video: video ? { name: "GodFather.mp4", blob: video } : data.video,
    images: image ? [{ name: "GodFather.png", blob: image }] : data.images,
  };
}

function* fetchData(): any {
  try {
    // Read the json file
    const data = JSONFile as GlobalState["data"];
    yield put(globalActions.setData(data));

    // After setting data, trigger movie data fetch
    yield put(globalActions.fetchMovieData());
  } catch (error) {
    console.error("Error in fetchData:", error);
  }
}

function* fetchMovieData(): any {
  try {
    const tokenCodes = getTokenCodes();
    console.log("🚀 ~ function*fetchMovieData ~ tokenCodes:", tokenCodes);

    if (!tokenCodes || tokenCodes.length === 0) {
      console.error("No token codes available to fetch movie data");
    }

    // Create movie info object for GAMBINO
    const movieInfo: MovieInfo = {
      title: "GAMBINO",
      subtitle: "The Real Godfather",
      director: "John Woo Yu-Sen",
      year: 2025,
      duration: "180 minutes",
      genre: "Crime Drama",
      description: "The Mafia story you've never been told.",
      longDescription:
        "In 1921, nineteen year-old Carlo Gambino arrived by boat to America as an unpapered stowaway. He had left Palermo, Sicily, the site of his recent induction into La Cosa Nostra, which was at war with Mussolini's Fascists. Unlike his fellows in 'The Brotherhood,' Carlo was a disciple of Niccolò Machiavelli, having re-read The Prince so often that he had it memorized; he thus appreciated the value of long-game strategy coupled with the rare, discreet use of violence when needed. With Machiavelli as his guide, 'Don Carlo' would quickly rise from bootlegger to the most powerful Mafia boss in New York, eventually becoming the model for Mario Puzo's 'Don Corleone' of 'Godfather' fame.",
      cast: [
        "Oscar Isaac",
        "Amanda Seyfried",
        "John David Washington",
        "Zendaya",
        "Vincent D'Onofrio",
        "Adam Driver",
        "Regina King",
        "Michael Shannon",
        "Thomasin McKenzie",
        "Brian Cox",
        "John Turturro",
        "Michael Imperioli",
      ],
      festivals: [
        {
          name: "Cannes Film Festival",
          award: "Palme d'Or Winner",
          year: 2025,
        },
        {
          name: "Venice International Film Festival",
          award: "Golden Lion",
          year: 2025,
          category: "Best Picture",
        },
        {
          name: "Toronto International Film Festival",
          award: "People's Choice Award",
          year: 2025,
        },
        {
          name: "New York Film Festival",
          award: "Opening Night Film",
          year: 2025,
        },
        {
          name: "London Film Festival",
          award: "Best Director",
          year: 2025,
        },
        {
          name: "Rome Film Festival",
          award: "Lifetime Achievement",
          year: 2025,
        },
      ],
      quotes: [
        {
          text: "One might say that 'Gambino' does for Italians what 'Scorsese's Gangs of New York' did for the Irish. Carlo was no saint, to be certain, but he knew that saints rarely survived the mean streets of America.",
          author: "Gus Russo, Author of 'The Outfit' and 'Supermob'",
        },
        {
          text: "After seeing 'Gambino,' you will know everything about the New York Mafia. Finally.",
          author: "Film Critic",
        },
        {
          text: "Power is not revealed by striking hard or often, but by striking true.",
          author: "Don Carlo Gambino",
        },
      ],
      reviews: [
        {
          publication: "Variety",
          quote: "Most Anticipated Motion Picture",
        },
        {
          publication: "The Hollywood Reporter",
          quote: "Most Anticipated Motion Picture",
        },
        {
          publication: "Screen International",
          quote: "Most Anticipated Motion Picture",
        },
      ],
      comparatives: [
        {
          title: "The Godfather Part I",
          awards: "Won 3 Oscars",
          domestic: "$134,381,073",
          international: "$250,341,516",
        },
        {
          title: "The Godfather: Part II",
          awards: "Won for 6 Oscars",
          domestic: "$47,834,595",
          international: "$47,961,919",
        },
        {
          title: "The Godfather: Part III",
          awards: "Nominated for 7 Oscars",
          domestic: "$66,761,392",
          international: "$136,861,392",
        },
        {
          title: "Goodfellas",
          awards: "Won Oscar",
          domestic: "$46,909,721",
          international: "$47,036,784",
        },
        {
          title: "Casino",
          awards: "Nominated for 1 Oscar",
          domestic: "$42,512,375",
          international: "$116,112,375",
        },
        {
          title: "Heat",
          domestic: "$67,436,818",
          international: "$187,436,818",
        },
      ],
      totalFractions: 15000,
      pricePerFraction: 1500, // $1500 per fraction
      availableFractions: 11250,
    };

    // Initialize movie data object
    let movieData: {
      movieInfo: MovieInfo;
      video: MediaFile | null;
      images: MediaFile[];
      documents: MediaFile[];
    } = {
      movieInfo,
      video: null,
      images: [],
      documents: [],
    };

    // Process all tokens to get their attachments
    for (const token of tokenCodes ?? []) {
      try {
        // Fetch attachments for this token
        const response = yield call(getTokensAttachment, {
          tokenCode: token.value,
          page: 1,
          pageSize: 100,
        });

        if (response.content && response.content.length > 0) {
          // Get the last attachment (most recent)
          const lastAttachment = response.content[0];

          // Get detailed attachment info
          const attachmentDetail = yield call(
            getAttachmentDetail,
            lastAttachment.id
          );
          yield put(globalActions.setAttachmentInfo(attachmentDetail));

          // Process attachments based on token name/stream
          if (
            token.name.toLowerCase().includes("movie") ||
            token.name.toLowerCase().includes("video") ||
            token.name.toLowerCase().includes("media")
          ) {
            // Process zip files (containing video and images)
            const zipFiles = attachmentDetail.files?.filter(
              (file: any) => file.filename?.match(/\.(zip)$/i) != null
            );

            if (zipFiles && zipFiles.length > 0) {
              const zipAddr = getIPFSIMGAddrPrivate(zipFiles[0]?.cid ?? "");
              // Get JWT token from localStorage
              const token = localStorage.getItem(LocalStorageKeys.jwtAccessKey);

              // Create fetch options with authorization header if token exists
              const fetchOptions: RequestInit = {};
              if (token) {
                fetchOptions.headers = {
                  Authorization: `Bearer ${token.replace(/"/g, "")}`,
                  "X-LedgerInfo": JSON.stringify({
                    tx_hash: attachmentDetail.tx_hash,
                    ledger: attachmentDetail.ledger,
                  }),
                };
              } else {
                console.error(
                  "No access token found for private IPFS resources"
                );
              }

              // Fetch ZIP file with auth headers
              const zipResponse = yield call(fetch, zipAddr, fetchOptions);

              if (!zipResponse.ok) {
                throw new Error(
                  `Failed to fetch ZIP: ${zipResponse.status} ${zipResponse.statusText}`
                );
              }

              const zipBuffer = yield call([zipResponse, "arrayBuffer"]);
              const processedContent = yield call(processZipFile, zipBuffer);
              console.log(
                "🚀 ~ function*fetchMovieData ~ processedContent:",
                processedContent
              );

              if (
                processedContent.type === "movie-content" ||
                processedContent.type === "property-documentation"
              ) {
                // Add images from the zip file
                if (processedContent.content.images) {
                  movieData.images = processedContent.content.images;
                }

                // Add video from the zip file
                if (processedContent.content.video) {
                  movieData.video = processedContent.content.video;
                }

                // Merge movie info from JSON if available
                if (processedContent.content.movieInfo) {
                  movieData.movieInfo = {
                    ...movieData.movieInfo,
                    ...processedContent.content.movieInfo,
                  };
                }
              }
            }

            // Also check for video files directly
            const videoFiles = attachmentDetail.files?.filter(
              (file: any) =>
                file.filename?.match(/\.(mp4|mov|avi|webm)$/i) != null
            );

            if (videoFiles && videoFiles.length > 0) {
              for (const videoFile of videoFiles) {
                if (videoFile.cid) {
                  const videoUrl = getIPFSIMGAddrPrivate(videoFile.cid);
                  const token = localStorage.getItem(
                    LocalStorageKeys.jwtAccessKey
                  );

                  // Create fetch options with authorization header if token exists
                  const fetchOptions: RequestInit = {};
                  if (token) {
                    fetchOptions.headers = {
                      Authorization: `Bearer ${token.replace(/"/g, "")}`,
                      "X-LedgerInfo": JSON.stringify({
                        tx_hash: attachmentDetail.tx_hash,
                        ledger: attachmentDetail.ledger,
                      }),
                    };
                  }

                  // Fetch video with auth headers
                  const videoResponse = yield call(
                    fetch,
                    videoUrl,
                    fetchOptions
                  );

                  if (!videoResponse.ok) {
                    console.warn(
                      `Failed to fetch video: ${videoResponse.status} ${videoResponse.statusText}`
                    );
                    continue;
                  }

                  const videoBlob = yield call([videoResponse, "blob"]);
                  movieData.video = {
                    name: videoFile.filename || "GAMBINO Trailer",
                    blob: videoBlob,
                  };
                  break; // Use first video found
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error processing token ${token.name}:`, error);
      }
    }

    if (!movieData.video || movieData.images.length === 0) {
      console.warn("Vault media unavailable, falling back to local fixtures");
      try {
        movieData = yield call(withFixtureFallback, movieData);
      } catch (error) {
        console.error("Error loading fixture media:", error);
      }
    }

    // Set the movie data in the global state
    yield put(globalActions.setMovieData(movieData));
  } catch (error) {
    console.error("Error in fetchMovieData:", error);
  }
}

function* logOut(): any {
  try {
    const authData = (yield select(
      GlobalSelectors.authData
    )) as GlobalState["authData"];
    if (authData) {
      yield call(authData.logout);
    }
  } catch (error) {
    console.log("error in logOut", error);
  }
}

export function* globalSaga() {
  yield takeLatest(globalActions.fetchData, fetchData);
  yield takeLatest(globalActions.fetchMovieData, fetchMovieData);
  yield takeLatest(globalActions.logOut, logOut);
}
