import { readFileSync } from "node:fs";
import { join } from "node:path";

const MIME = {
  css: "text/css; charset=utf-8",
  js: "application/javascript; charset=utf-8",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
  woff: "font/woff",
  woff2: "font/woff2",
};

export const loader = ({ params }) => {
  const filename = params["*"];
  if (!filename || filename.includes("..")) {
    return new Response("Not found", { status: 404 });
  }

  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const contentType = MIME[ext] ?? "application/octet-stream";

  try {
    const filePath = join(
      process.cwd(),
      "extensions",
      "carousel-sliders",
      "assets",
      filename
    );
    const content = readFileSync(filePath);
    return new Response(content, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
};
