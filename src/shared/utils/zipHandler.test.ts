import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { processZipFile } from "./zipHandler";

const buildZip = async (files: Record<string, string>) => {
  const zip = new JSZip();
  for (const [name, content] of Object.entries(files)) {
    zip.file(name, content);
  }
  return zip.generateAsync({ type: "arraybuffer" });
};

describe("processZipFile", () => {
  it("sorts entries into video, images and documents and reads movie info", async () => {
    const buffer = await buildZip({
      "trailer.mp4": "video-bytes",
      "second.webm": "other-video",
      "poster.png": "png-bytes",
      "stills/still.JPG": "jpg-bytes",
      "press/kit.pdf": "pdf-bytes",
      "movie.json": JSON.stringify({ title: "GAMBINO", director: "Someone" }),
      "notes.bin": "ignored",
    });

    const result = await processZipFile(buffer);

    expect(result.type).toBe("movie-content");
    expect(result.content.video?.name).toBe("trailer.mp4");
    expect(await result.content.video?.blob.text()).toBe("video-bytes");
    expect(result.content.images?.map((i) => i.name).sort()).toEqual([
      "poster.png",
      "stills/still.JPG",
    ]);
    expect(result.content.documents?.map((d) => d.name)).toEqual([
      "press/kit.pdf",
    ]);
    expect(result.content.movieInfo).toEqual({
      title: "GAMBINO",
      director: "Someone",
    });
  });

  it("unwraps a nested movieInfo object", async () => {
    const buffer = await buildZip({
      "data.json": JSON.stringify({ movieInfo: { title: "Nested" } }),
    });
    const result = await processZipFile(buffer);
    expect(result.type).toBe("movie-content");
    expect(result.content.movieInfo).toEqual({ title: "Nested" });
  });

  it("recognises legacy property documentation", async () => {
    const buffer = await buildZip({
      "property.json": JSON.stringify({ nameOfProject: "Tower" }),
      "photo.jpeg": "img",
    });
    const result = await processZipFile(buffer);
    expect(result.type).toBe("property-documentation");
    expect(result.content.propertyInfo).toEqual({ nameOfProject: "Tower" });
    expect(result.content.video).toBeUndefined();
  });

  it("ignores malformed JSON and reports unknown content", async () => {
    const buffer = await buildZip({ "broken.json": "{not json" });
    const result = await processZipFile(buffer);
    expect(result.type).toBe("unknown");
    expect(result.content.images).toEqual([]);
    expect(result.content.documents).toEqual([]);
  });
});
