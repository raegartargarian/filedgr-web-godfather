// src/shared/utils/zipHandler.ts
//
// Zip extraction comes from @filedgr/web-core/zip (Web Worker with a
// main-thread fallback). Only the template-specific shaping stays here:
// sorting the entries into images / video / documents and picking up the
// embedded movie (or legacy property) JSON.
import { extractZipFiles } from "@filedgr/web-core/zip";

export interface ProcessedContent {
  type: string;
  content: {
    images?: { name: string; blob: Blob }[];
    video?: { name: string; blob: Blob };
    documents?: { name: string; blob: Blob }[];
    movieInfo?: any;
    propertyInfo?: any;
  };
}

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
const VIDEO_EXTENSIONS = ["mp4", "mov", "avi", "webm", "mkv", "flv"];
const DOCUMENT_EXTENSIONS = ["pdf", "doc", "docx", "txt"];

export const processZipFile = async (
  buffer: ArrayBuffer
): Promise<ProcessedContent> => {
  const entries = await extractZipFiles(new Blob([buffer]));

  const result: ProcessedContent = {
    type: "unknown",
    content: {
      images: [],
      documents: [],
    },
  };

  const images: { name: string; blob: Blob }[] = [];
  const documents: { name: string; blob: Blob }[] = [];
  let video: { name: string; blob: Blob } | undefined;
  let movieInfo: any;
  let propertyInfo: any;

  for (const [filename, blob] of entries) {
    try {
      // Check file type by extension
      const extension = filename.toLowerCase().split(".").pop() || "";

      if (IMAGE_EXTENSIONS.includes(extension)) {
        images.push({ name: filename, blob });
      } else if (VIDEO_EXTENSIONS.includes(extension)) {
        // Video file - take the first one found
        if (!video) {
          video = { name: filename, blob };
        }
      } else if (DOCUMENT_EXTENSIONS.includes(extension)) {
        documents.push({ name: filename, blob });
      } else if (extension === "json") {
        // JSON file - try to parse for movie/property info
        const text = await blob.text();
        try {
          const jsonData = JSON.parse(text);

          // Check if it looks like movie data
          if (jsonData.title || jsonData.director || jsonData.movieInfo) {
            movieInfo = jsonData.movieInfo || jsonData;
            result.type = "movie-content";
          } else if (jsonData.propertyInfo || jsonData.nameOfProject) {
            // Legacy property data
            propertyInfo = jsonData.propertyInfo || jsonData;
            result.type = "property-documentation";
          }
        } catch (error) {
          console.warn(`Failed to parse JSON file ${filename}:`, error);
        }
      }
    } catch (error) {
      console.warn(`Failed to process file ${filename}:`, error);
    }
  }

  // Set the processed content
  result.content.images = images;
  result.content.documents = documents;

  if (video) {
    result.content.video = video;
    result.type = "movie-content"; // If we have video, it's movie content
  }

  if (movieInfo) {
    result.content.movieInfo = movieInfo;
    result.type = "movie-content";
  }

  if (propertyInfo) {
    result.content.propertyInfo = propertyInfo;
    if (result.type === "unknown") {
      result.type = "property-documentation";
    }
  }

  // If we have images but no specific type, assume it's documentation
  if (result.type === "unknown" && images.length > 0) {
    result.type = "property-documentation";
  }

  return result;
};
