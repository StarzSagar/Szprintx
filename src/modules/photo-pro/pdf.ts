import { PDFDocument, rgb } from "pdf-lib";
import {
  getPageDimensions,
  type ImageAsset,
  type LayoutSettings,
  type PlacedPhoto,
} from "./layout";

interface PreparedImage {
  bytes: Uint8Array;
  widthMm: number;
  heightMm: number;
}

function drawPhotoBorder(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: LayoutSettings,
) {
  const lineWidth = Math.max(1, settings.borderWidthMm / 25.4 * 300);
  context.strokeStyle = settings.borderColor;
  context.lineWidth = lineWidth;

  if (settings.borderStyle === "dashed") {
    context.setLineDash([lineWidth * 4, lineWidth * 2]);
  }

  if (settings.borderStyle === "double") {
    context.lineWidth = Math.max(1, lineWidth / 3);
    const inset = lineWidth / 6;
    context.strokeRect(inset, inset, width - inset * 2, height - inset * 2);
    const innerInset = lineWidth * 5 / 6;
    context.strokeRect(innerInset, innerInset, width - innerInset * 2, height - innerInset * 2);
    return;
  }

  const inset = context.lineWidth / 2;
  context.strokeRect(inset, inset, width - context.lineWidth, height - context.lineWidth);
}

function filterImage(asset: ImageAsset, photo: PlacedPhoto, settings: LayoutSettings): Promise<PreparedImage> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round((photo.width / 25.4) * 300));
        canvas.height = Math.max(1, Math.round((photo.height / 25.4) * 300));
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas is unavailable.");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.filter = `brightness(${photo.brightness}%) contrast(${photo.contrast}%) saturate(${photo.saturation}%) grayscale(${photo.grayscale ? 100 : 0}%)`;
        const sourceRatio = image.naturalWidth / image.naturalHeight;
        const targetRatio = canvas.width / canvas.height;
        let sx = 0;
        let sy = 0;
        let sw = image.naturalWidth;
        let sh = image.naturalHeight;
        if (sourceRatio > targetRatio) {
          sw = image.naturalHeight * targetRatio;
          sx = (image.naturalWidth - sw) * photo.cropX / 100;
        } else {
          sh = image.naturalWidth / targetRatio;
          sy = (image.naturalHeight - sh) * photo.cropY / 100;
        }
        context.save();
        context.translate(photo.flipX ? canvas.width : 0, photo.flipY ? canvas.height : 0);
        context.scale(photo.flipX ? -1 : 1, photo.flipY ? -1 : 1);
        context.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
        context.restore();
        context.filter = "none";
        if (settings.border) {
          drawPhotoBorder(context, canvas.width, canvas.height, settings);
        }

        const radians = (photo.rotation * Math.PI) / 180;
        const rotatedWidth = Math.max(1, Math.ceil(Math.abs(canvas.width * Math.cos(radians)) + Math.abs(canvas.height * Math.sin(radians))));
        const rotatedHeight = Math.max(1, Math.ceil(Math.abs(canvas.width * Math.sin(radians)) + Math.abs(canvas.height * Math.cos(radians))));
        const output = document.createElement("canvas");
        output.width = rotatedWidth;
        output.height = rotatedHeight;
        const outputContext = output.getContext("2d");
        if (!outputContext) throw new Error("Canvas is unavailable.");
        outputContext.fillStyle = "#ffffff";
        outputContext.fillRect(0, 0, output.width, output.height);
        outputContext.translate(output.width / 2, output.height / 2);
        outputContext.rotate(radians);
        outputContext.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
        output.toBlob(async (blob) => {
          if (!blob) {
            reject(new Error(`Could not prepare ${asset.name} for printing.`));
            return;
          }
          resolve({
            bytes: new Uint8Array(await blob.arrayBuffer()),
            widthMm: output.width / 300 * 25.4,
            heightMm: output.height / 300 * 25.4,
          });
        }, "image/jpeg", 0.96);
      } catch (error) {
        reject(error);
      }
    };
    image.onerror = () => reject(new Error(`Could not load ${asset.name}.`));
    image.src = asset.url;
  });
}

export async function exportPdf(
  assets: ImageAsset[],
  photos: PlacedPhoto[],
  settings: LayoutSettings,
): Promise<Uint8Array> {
  if (!photos.length) throw new Error("Add at least one photo before exporting.");

  const pdf = await PDFDocument.create();
  const [widthMm, heightMm] = getPageDimensions(settings);
  const mmToPoints = 72 / 25.4;
  const pageWidth = widthMm * mmToPoints;
  const pageHeight = heightMm * mmToPoints;
  const page = pdf.addPage([pageWidth, pageHeight]);
  const background = settings.background.match(/^#([0-9a-f]{6})$/i);
  if (background) {
    const hex = background[1];
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: rgb(
        parseInt(hex.slice(0, 2), 16) / 255,
        parseInt(hex.slice(2, 4), 16) / 255,
        parseInt(hex.slice(4, 6), 16) / 255,
      ),
    });
  }

  for (const photo of photos) {
    const asset = assets.find((item) => item.id === photo.assetId);
    if (!asset) throw new Error("A placed photo is missing its source image. Remove it and try again.");
    const prepared = await filterImage(asset, photo, settings);
    const embedded = await pdf.embedJpg(prepared.bytes);
    const centerX = (photo.x + photo.width / 2) * mmToPoints;
    const centerY = pageHeight - (photo.y + photo.height / 2) * mmToPoints;
    const width = prepared.widthMm * mmToPoints;
    const height = prepared.heightMm * mmToPoints;
    page.drawImage(embedded, {
      x: centerX - width / 2,
      y: centerY - height / 2,
      width,
      height,
    });
  }
  return pdf.save();
}
