export type ImageFormat = "png" | "jpeg";

export interface RenderedPage {
  pageNumber: number;
  blob: Blob;
  dataUrl: string;
}

let pdfjsLibPromise: Promise<typeof import("pdfjs-dist")> | null = null;

async function getPdfjs() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = import("pdfjs-dist").then((mod) => {
      mod.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      return mod;
    });
  }
  return pdfjsLibPromise;
}

/**
 * Renders every page of a PDF file to raster images at the given scale.
 */
export async function pdfToImages(
  file: File,
  format: ImageFormat = "png",
  scale = 2,
  onProgress?: (done: number, total: number) => void
): Promise<RenderedPage[]> {
  const pdfjsLib = await getPdfjs();
  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;

  const results: RenderedPage[] = [];
  const mimeType = format === "png" ? "image/png" : "image/jpeg";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    await page.render({ canvasContext: ctx, viewport }).promise;

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Canvas export failed"))),
        mimeType,
        format === "jpeg" ? 0.92 : undefined
      );
    });

    const dataUrl = canvas.toDataURL(mimeType);

    results.push({ pageNumber: pageNum, blob, dataUrl });
    onProgress?.(pageNum, pdf.numPages);
  }

  return results;
}
