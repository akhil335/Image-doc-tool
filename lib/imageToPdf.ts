import { PDFDocument } from "pdf-lib";

export type PageSize = "fit" | "a4" | "letter" | "legal";
export type PageOrientation = "portrait" | "landscape" | "auto";

const SIZES: Record<Exclude<PageSize, "fit">, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
  legal: [612, 1008],
};

async function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return await file.arrayBuffer();
}

/**
 * Builds a single PDF from an ordered list of image files.
 * Each image becomes its own page. Supports JPG and PNG.
 */
export async function imagesToPdf(
  files: File[],
  pageSize: PageSize = "fit",
  orientation: PageOrientation = "auto",
  margin = 0
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const bytes = await readAsArrayBuffer(file);
    const isPng = file.type === "image/png" || file.name.toLowerCase().endsWith(".png");

    const image = isPng
      ? await pdfDoc.embedPng(bytes)
      : await pdfDoc.embedJpg(bytes);

    const { width: imgW, height: imgH } = image;

    let pageW: number;
    let pageH: number;

    if (pageSize === "fit") {
      pageW = imgW + margin * 2;
      pageH = imgH + margin * 2;
    } else {
      const [baseW, baseH] = SIZES[pageSize];
      const isImgLandscape = imgW > imgH;

      if (
        orientation === "landscape" ||
        (orientation === "auto" && isImgLandscape)
      ) {
        pageW = Math.max(baseW, baseH);
        pageH = Math.min(baseW, baseH);
      } else {
        pageW = Math.min(baseW, baseH);
        pageH = Math.max(baseW, baseH);
      }
    }

    const page = pdfDoc.addPage([pageW, pageH]);

    const availW = pageW - margin * 2;
    const availH = pageH - margin * 2;
    const scale = Math.min(availW / imgW, availH / imgH, 1) || 1;
    const drawW = imgW * scale;
    const drawH = imgH * scale;

    page.drawImage(image, {
      x: (pageW - drawW) / 2,
      y: (pageH - drawH) / 2,
      width: drawW,
      height: drawH,
    });
  }

  return await pdfDoc.save();
}
