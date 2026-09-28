"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Dropzone from "@/components/Dropzone";
import ToolHeader from "@/components/ToolHeader";
import Toast from "@/components/Toast";

import {
  getFileNameWithoutExtension,
  loadImage,
} from "@/lib/fileUtils";

import {
  canvasToBlob,
  createCanvas,
} from "@/lib/canvasUtils";

import { saveAs } from "file-saver";

type AspectRatioMode =
  | "free"
  | "1:1"
  | "4:3"
  | "16:9"
  | "9:16"
  | "3:2";

type CropRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type DragMode =
  | "move"
  | "nw"
  | "ne"
  | "se"
  | "sw"
  | null;

export default function ImageCropperClient() {
  const [file, setFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState<string>("");

  const [naturalDimensions, setNaturalDimensions] = useState<{
    w: number;
    h: number;
  }>({
    w: 0,
    h: 0,
  });

  const [ratioMode, setRatioMode] =
    useState<AspectRatioMode>("free");

  const [showGrid, setShowGrid] =
    useState<boolean>(true);

  const [zoom, setZoom] =
    useState<number>(1);

  const [rotation, setRotation] =
    useState<number>(0);

  const [exportFormat, setExportFormat] =
    useState<
      "image/png" | "image/jpeg" | "image/webp"
    >("image/png");

  const [isExporting, setIsExporting] =
    useState<boolean>(false);

  const [toastMsg, setToastMsg] =
    useState<string | null>(null);

  /*
   * Crop coordinates are normalized relative to
   * the ENTIRE cropper container.
   *
   * x/y/w/h are all between 0 and 1.
   */
  const [crop, setCrop] = useState<CropRect>({
    x: 0.1,
    y: 0.1,
    w: 0.8,
    h: 0.8,
  });

  /*
   * Actual viewport size.
   *
   * This is important because the image uses:
   *
   * max-h-full
   * max-w-full
   * object-contain
   *
   * while the crop box is positioned relative
   * to the full container.
   */
  const [viewportSize, setViewportSize] =
    useState({
      width: 0,
      height: 0,
    });

  const containerRef =
    useRef<HTMLDivElement>(null);

  const dragMode =
    useRef<DragMode>(null);

  const dragStart =
    useRef<{
      clientX: number;
      clientY: number;
      crop: CropRect;
    }>({
      clientX: 0,
      clientY: 0,
      crop: {
        x: 0,
        y: 0,
        w: 0,
        h: 0,
      },
    });

  /*
   * ---------------------------------------------------------
   * Get the actual size of an image using object-contain
   * inside the cropper viewport.
   * ---------------------------------------------------------
   */
  function getContainDimensions(
    imageWidth: number,
    imageHeight: number,
    containerWidth: number,
    containerHeight: number
  ) {
    if (
      imageWidth <= 0 ||
      imageHeight <= 0 ||
      containerWidth <= 0 ||
      containerHeight <= 0
    ) {
      return {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
      };
    }

    const imageRatio =
      imageWidth / imageHeight;

    const containerRatio =
      containerWidth / containerHeight;

    let width: number;
    let height: number;

    if (imageRatio > containerRatio) {
      /*
       * Image is wider than the container.
       */
      width = containerWidth;
      height = containerWidth / imageRatio;
    } else {
      /*
       * Image is taller than the container.
       */
      height = containerHeight;
      width = containerHeight * imageRatio;
    }

    return {
      width,
      height,
      left: (containerWidth - width) / 2,
      top: (containerHeight - height) / 2,
    };
  }

  /*
   * ---------------------------------------------------------
   * Keep viewport dimensions synchronized with the UI.
   * ---------------------------------------------------------
   */
  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const updateSize = () => {
      const rect =
        container.getBoundingClientRect();

      setViewportSize({
        width: rect.width,
        height: rect.height,
      });
    };

    updateSize();

    const resizeObserver =
      new ResizeObserver(updateSize);

    resizeObserver.observe(container);

    window.addEventListener(
      "resize",
      updateSize
    );

    return () => {
      resizeObserver.disconnect();

      window.removeEventListener(
        "resize",
        updateSize
      );
    };
  }, [file]);

  /*
   * ---------------------------------------------------------
   * Load image
   * ---------------------------------------------------------
   */
  async function handleFile(files: File[]) {
    const f = files[0];

    if (
      !f ||
      !f.type.startsWith("image/")
    ) {
      setToastMsg(
        "Please select a valid image."
      );
      return;
    }

    const url =
      URL.createObjectURL(f);

    setFile(f);
    setImgUrl(url);

    try {
      const img = await loadImage(url);

      setNaturalDimensions({
        w: img.naturalWidth,
        h: img.naturalHeight,
      });

      setCrop({
        x: 0.1,
        y: 0.1,
        w: 0.8,
        h: 0.8,
      });

      setZoom(1);
      setRotation(0);
      setRatioMode("free");

      setToastMsg(
        `Loaded ${f.name}`
      );
    } catch {
      URL.revokeObjectURL(url);

      setFile(null);
      setImgUrl("");

      setToastMsg(
        "Could not load image."
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * Get numeric aspect ratio
   * ---------------------------------------------------------
   */
  function getRatioValue(
    mode: AspectRatioMode
  ): number {
    switch (mode) {
      case "1:1":
        return 1;

      case "4:3":
        return 4 / 3;

      case "16:9":
        return 16 / 9;

      case "9:16":
        return 9 / 16;

      case "3:2":
        return 3 / 2;

      case "free":
      default:
        return 1;
    }
  }

  /*
   * ---------------------------------------------------------
   * Apply aspect ratio
   * ---------------------------------------------------------
   */
  const applyRatio = useCallback(
    (mode: AspectRatioMode) => {
      setRatioMode(mode);

      if (mode === "free") return;

      const targetRatio = getRatioValue(mode);

      setCrop((prev) => {
        const containerW = viewportSize.width;
        const containerH = viewportSize.height;

        if (containerW <= 0 || containerH <= 0) {
          return prev;
        }

        // Convert aspect ratio to normalized crop dimensions.
        // Since crop coordinates are normalized to the container,
        // the ratio must account for the container's pixel aspect ratio.
        const normalizedRatio =
          (targetRatio * containerH) / containerW;

        // Keep the center of the user's existing crop.
        const centerX = prev.x + prev.w / 2;
        const centerY = prev.y + prev.h / 2;

        // Start with the largest possible crop at this ratio.
        let newW = 1;
        let newH = newW / normalizedRatio;

        // If the resulting height is too large,
        // make the height the limiting dimension.
        if (newH > 1) {
          newH = 1;
          newW = newH * normalizedRatio;
        }

        // Center the new crop around the user's previous crop center.
        let newX = centerX - newW / 2;
        let newY = centerY - newH / 2;

        // Keep crop inside viewport.
        newX = Math.max(0, Math.min(1 - newW, newX));
        newY = Math.max(0, Math.min(1 - newH, newY));

        return {
          x: newX,
          y: newY,
          w: newW,
          h: newH,
        };
      });
    },
    [viewportSize]
  );

  /*
   * ---------------------------------------------------------
   * Pointer down
   * ---------------------------------------------------------
   */
  const handlePointerDown = (
    mode:
      | "move"
      | "nw"
      | "ne"
      | "se"
      | "sw",
    e:
      | React.MouseEvent
      | React.TouchEvent
  ) => {
    e.stopPropagation();

    const clientX =
      "touches" in e
        ? e.touches[0]?.clientX ?? 0
        : e.clientX;

    const clientY =
      "touches" in e
        ? e.touches[0]?.clientY ?? 0
        : e.clientY;

    dragMode.current = mode;

    dragStart.current = {
      clientX,
      clientY,
      crop: {
        ...crop,
      },
    };
  };

  /*
   * ---------------------------------------------------------
   * Pointer move
   *
   * IMPORTANT:
   * These coordinates are relative to the same container
   * that the crop overlay uses.
   * ---------------------------------------------------------
   */
const handlePointerMove = useCallback(
  (e: MouseEvent | TouchEvent) => {
    if (
      !dragMode.current ||
      !containerRef.current
    ) {
      return;
    }

    const clientX =
      "touches" in e
        ? e.touches[0]?.clientX ?? 0
        : e.clientX;

    const clientY =
      "touches" in e
        ? e.touches[0]?.clientY ?? 0
        : e.clientY;

    const rect =
      containerRef.current.getBoundingClientRect();

    const viewportW = rect.width;
    const viewportH = rect.height;

    if (
      viewportW <= 0 ||
      viewportH <= 0
    ) {
      return;
    }

    const dxPx =
      clientX -
      dragStart.current.clientX;

    const dyPx =
      clientY -
      dragStart.current.clientY;

    /*
     * Crop coordinates are normalized:
     *
     * x/w → relative to viewport width
     * y/h → relative to viewport height
     */
    const dx =
      dxPx / viewportW;

    const dy =
      dyPx / viewportH;

    const start =
      dragStart.current.crop;

    /*
     * ---------------------------------------------------------
     * MOVE
     * ---------------------------------------------------------
     */
    if (
      dragMode.current === "move"
    ) {
      const newX = Math.max(
        0,
        Math.min(
          1 - start.w,
          start.x + dx
        )
      );

      const newY = Math.max(
        0,
        Math.min(
          1 - start.h,
          start.y + dy
        )
      );

      setCrop({
        ...start,
        x: newX,
        y: newY,
      });

      return;
    }

    /*
     * ---------------------------------------------------------
     * FREEFORM
     * ---------------------------------------------------------
     */
    if (
      ratioMode === "free"
    ) {
      if (
        dragMode.current === "se"
      ) {
        const newW = Math.max(
          0.02,
          Math.min(
            1 - start.x,
            start.w + dx
          )
        );

        const newH = Math.max(
          0.02,
          Math.min(
            1 - start.y,
            start.h + dy
          )
        );

        setCrop({
          ...start,
          w: newW,
          h: newH,
        });

        return;
      }

      if (
        dragMode.current === "nw"
      ) {
        const right =
          start.x + start.w;

        const bottom =
          start.y + start.h;

        const newX = Math.max(
          0,
          Math.min(
            right - 0.02,
            start.x + dx
          )
        );

        const newY = Math.max(
          0,
          Math.min(
            bottom - 0.02,
            start.y + dy
          )
        );

        setCrop({
          x: newX,
          y: newY,
          w: right - newX,
          h: bottom - newY,
        });

        return;
      }

      if (
        dragMode.current === "ne"
      ) {
        const bottom =
          start.y + start.h;

        const newY = Math.max(
          0,
          Math.min(
            bottom - 0.02,
            start.y + dy
          )
        );

        const newRight = Math.max(
          start.x + 0.02,
          Math.min(
            1,
            start.x +
              start.w +
              dx
          )
        );

        setCrop({
          x: start.x,
          y: newY,
          w: newRight - start.x,
          h: bottom - newY,
        });

        return;
      }

      if (
        dragMode.current === "sw"
      ) {
        const right =
          start.x + start.w;

        const newX = Math.max(
          0,
          Math.min(
            right - 0.02,
            start.x + dx
          )
        );

        const newBottom = Math.max(
          start.y + 0.02,
          Math.min(
            1,
            start.y +
              start.h +
              dy
          )
        );

        setCrop({
          x: newX,
          y: start.y,
          w: right - newX,
          h: newBottom - start.y,
        });

        return;
      }
    }

    /*
     * ---------------------------------------------------------
     * LOCKED ASPECT RATIO
     *
     * IMPORTANT:
     *
     * The crop state is normalized, so width and height
     * cannot simply use:
     *
     *     h = w / ratio
     *
     * Instead:
     *
     *     widthPx  = w * viewportW
     *     heightPx = h * viewportH
     *
     * Therefore:
     *
     *     h = (w * viewportW)
     *         / (ratio * viewportH)
     * ---------------------------------------------------------
     */

    const ratio =
      getRatioValue(ratioMode);

    const heightFromWidth = (
      width: number
    ) =>
      (width * viewportW) /
      (ratio * viewportH);

    const widthFromHeight = (
      height: number
    ) =>
      (height * ratio * viewportH) /
      viewportW;

    /*
     * ---------------------------------------------------------
     * SE
     * ---------------------------------------------------------
     */
    if (
      dragMode.current === "se"
    ) {
      let newW = Math.max(
        0.02,
        Math.min(
          1 - start.x,
          start.w + dx
        )
      );

      let newH =
        heightFromWidth(newW);

      /*
       * Keep bottom inside viewport.
       */
      if (
        start.y + newH > 1
      ) {
        newH = 1 - start.y;
        newW =
          widthFromHeight(newH);
      }

      /*
       * Keep right inside viewport.
       */
      if (
        start.x + newW > 1
      ) {
        newW = 1 - start.x;
        newH =
          heightFromWidth(newW);
      }

      if (
        newW >= 0.02 &&
        newH >= 0.02 &&
        start.y + newH <= 1.0001
      ) {
        setCrop({
          ...start,
          w: newW,
          h: newH,
        });
      }

      return;
    }

    /*
     * ---------------------------------------------------------
     * NW
     * ---------------------------------------------------------
     */
    if (
      dragMode.current === "nw"
    ) {
      const right =
        start.x + start.w;

      const bottom =
        start.y + start.h;

      let newW = Math.max(
        0.02,
        start.w - dx
      );

      let newH =
        heightFromWidth(newW);

      /*
       * Keep top inside viewport.
       */
      if (
        bottom - newH < 0
      ) {
        newH = bottom;
        newW =
          widthFromHeight(newH);
      }

      /*
       * Keep left inside viewport.
       */
      if (
        right - newW < 0
      ) {
        newW = right;
        newH =
          heightFromWidth(newW);
      }

      const newX =
        right - newW;

      const newY =
        bottom - newH;

      if (
        newW >= 0.02 &&
        newH >= 0.02 &&
        newX >= -0.0001 &&
        newY >= -0.0001
      ) {
        setCrop({
          x: Math.max(0, newX),
          y: Math.max(0, newY),
          w: newW,
          h: newH,
        });
      }

      return;
    }

    /*
     * ---------------------------------------------------------
     * NE
     * ---------------------------------------------------------
     */
    if (
      dragMode.current === "ne"
    ) {
      const bottom =
        start.y + start.h;

      let newW = Math.max(
        0.02,
        start.w + dx
      );

      let newH =
        heightFromWidth(newW);

      /*
       * Keep top inside viewport.
       */
      if (
        bottom - newH < 0
      ) {
        newH = bottom;
        newW =
          widthFromHeight(newH);
      }

      /*
       * Keep right inside viewport.
       */
      if (
        start.x + newW > 1
      ) {
        newW = 1 - start.x;
        newH =
          heightFromWidth(newW);
      }

      const newY =
        bottom - newH;

      if (
        newW >= 0.02 &&
        newH >= 0.02 &&
        newY >= -0.0001
      ) {
        setCrop({
          x: start.x,
          y: Math.max(0, newY),
          w: newW,
          h: newH,
        });
      }

      return;
    }

    /*
     * ---------------------------------------------------------
     * SW
     * ---------------------------------------------------------
     */
    if (
      dragMode.current === "sw"
    ) {
      const right =
        start.x + start.w;

      let newW = Math.max(
        0.02,
        start.w - dx
      );

      let newH =
        heightFromWidth(newW);

      /*
       * Keep bottom inside viewport.
       */
      if (
        start.y + newH > 1
      ) {
        newH = 1 - start.y;
        newW =
          widthFromHeight(newH);
      }

      /*
       * Keep left inside viewport.
       */
      if (
        right - newW < 0
      ) {
        newW = right;
        newH =
          heightFromWidth(newW);
      }

      const newX =
        right - newW;

      if (
        newW >= 0.02 &&
        newH >= 0.02 &&
        newX >= -0.0001
      ) {
        setCrop({
          x: Math.max(0, newX),
          y: start.y,
          w: newW,
          h: newH,
        });
      }

      return;
    }
  },
  [ratioMode]
);

  /*
   * ---------------------------------------------------------
   * Pointer up
   * ---------------------------------------------------------
   */
  const handlePointerUp =
    useCallback(() => {
      dragMode.current = null;
    }, []);

  /*
   * ---------------------------------------------------------
   * Global pointer listeners
   * ---------------------------------------------------------
   */
  useEffect(() => {
    window.addEventListener(
      "mousemove",
      handlePointerMove
    );

    window.addEventListener(
      "mouseup",
      handlePointerUp
    );

    window.addEventListener(
      "touchmove",
      handlePointerMove,
      {
        passive: false,
      }
    );

    window.addEventListener(
      "touchend",
      handlePointerUp
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        handlePointerMove
      );

      window.removeEventListener(
        "mouseup",
        handlePointerUp
      );

      window.removeEventListener(
        "touchmove",
        handlePointerMove
      );

      window.removeEventListener(
        "touchend",
        handlePointerUp
      );
    };
  }, [
    handlePointerMove,
    handlePointerUp,
  ]);

  /*
   * ---------------------------------------------------------
   * Calculate output dimensions
   *
   * IMPORTANT:
   *
   * Crop is relative to the container.
   * Image is object-contain inside the container.
   *
   * Therefore we calculate actual source-pixel density
   * based on the displayed image size.
   *
   * Zoom is divided because zoom means we are viewing
   * a smaller portion of the original image.
   * ---------------------------------------------------------
   */
  const imageDisplay =
    getContainDimensions(
      naturalDimensions.w,
      naturalDimensions.h,
      viewportSize.width,
      viewportSize.height
    );

  const safeZoom =
    Math.max(0.01, zoom);

  const sourcePixelsPerScreenPixel =
    imageDisplay.width > 0
      ? naturalDimensions.w /
        (imageDisplay.width *
          safeZoom)
      : 1;

  const outputWidthPx =
    Math.max(
      1,
      Math.round(
        crop.w *
          viewportSize.width *
          sourcePixelsPerScreenPixel
      )
    );

  const outputHeightPx =
    Math.max(
      1,
      Math.round(
        crop.h *
          viewportSize.height *
          sourcePixelsPerScreenPixel
      )
    );

  /*
   * ---------------------------------------------------------
   * EXPORT CROP
   *
   * This is the important fix.
   *
   * Instead of creating a canvas based only on the rotated
   * image and then assuming crop.x/crop.y belong to that
   * canvas, we create an intermediate canvas that represents
   * the SAME viewport as the UI.
   *
   * Therefore:
   *
   * UI crop X/Y
   *       =
   * exported crop X/Y
   * ---------------------------------------------------------
   */
  async function handleExportCrop() {
    if (
      !imgUrl ||
      !naturalDimensions.w ||
      !naturalDimensions.h ||
      !containerRef.current
    ) {
      return;
    }

    setIsExporting(true);

    try {
      const img =
        await loadImage(imgUrl);

      const containerRect =
        containerRef.current.getBoundingClientRect();

      const viewportW =
        Math.max(
          1,
          containerRect.width
        );

      const viewportH =
        Math.max(
          1,
          containerRect.height
        );

      /*
       * -----------------------------------------------------
       * 1. Calculate actual untransformed image size.
       *
       * This matches object-contain.
       * -----------------------------------------------------
       */
      const display =
        getContainDimensions(
          img.naturalWidth,
          img.naturalHeight,
          viewportW,
          viewportH
        );

      const displayW =
        display.width;

      const displayH =
        display.height;

      if (
        displayW <= 0 ||
        displayH <= 0
      ) {
        throw new Error(
          "Invalid image display dimensions"
        );
      }

      /*
       * -----------------------------------------------------
       * 2. Source pixel density.
       *
       * Zoom does NOT increase image resolution.
       * It simply zooms into the original image.
       * -----------------------------------------------------
       */
      const safeExportZoom =
        Math.max(0.01, zoom);

      const renderScale =
        img.naturalWidth /
        (displayW * safeExportZoom);

      /*
       * -----------------------------------------------------
       * 3. Crop dimensions in screen coordinates.
       * -----------------------------------------------------
       */
      const cropScreenX =
        crop.x * viewportW;

      const cropScreenY =
        crop.y * viewportH;

      const cropScreenW =
        crop.w * viewportW;

      const cropScreenH =
        crop.h * viewportH;

      /*
       * -----------------------------------------------------
       * 4. Output dimensions in original-image pixels.
       * -----------------------------------------------------
       */
      const outputW =
        Math.max(
          1,
          Math.round(
            cropScreenW *
              renderScale
          )
        );

      const outputH =
        Math.max(
          1,
          Math.round(
            cropScreenH *
              renderScale
          )
        );

      /*
       * -----------------------------------------------------
       * 5. Create intermediate viewport canvas.
       *
       * It represents the complete visible cropper area.
       * -----------------------------------------------------
       */
      const intermediateW =
        Math.max(
          1,
          Math.round(
            viewportW *
              renderScale
          )
        );

      const intermediateH =
        Math.max(
          1,
          Math.round(
            viewportH *
              renderScale
          )
        );

      const {
        canvas: intermediateCanvas,
        ctx: intermediateCtx,
      } = createCanvas(
        intermediateW,
        intermediateH
      );

      /*
       * -----------------------------------------------------
       * 6. Draw image exactly like CSS.
       *
       * CSS:
       *
       * transform:
       *   scale(zoom) rotate(rotation)
       *
       * Default transform-origin:
       *   50% 50%
       * -----------------------------------------------------
       */
      const normalizedRotation =
        ((rotation % 360) + 360) %
        360;

      const radians =
        (normalizedRotation *
          Math.PI) /
        180;

      intermediateCtx.save();

      /*
       * Convert viewport CSS pixels into
       * high-resolution canvas pixels.
       */
      intermediateCtx.scale(
        renderScale,
        renderScale
      );

      /*
       * Move to the center of the viewport.
       */
      intermediateCtx.translate(
        viewportW / 2,
        viewportH / 2
      );

      /*
       * Apply same rotation as CSS.
       */
      intermediateCtx.rotate(
        radians
      );

      /*
       * Apply same zoom as CSS.
       */
      intermediateCtx.scale(
        safeExportZoom,
        safeExportZoom
      );

      /*
       * Draw image centered.
       */
      intermediateCtx.drawImage(
        img,
        -displayW / 2,
        -displayH / 2,
        displayW,
        displayH
      );

      intermediateCtx.restore();

      /*
       * -----------------------------------------------------
       * 7. Convert crop rectangle to intermediate canvas
       * coordinates.
       * -----------------------------------------------------
       */
      const sourceCropX =
        Math.round(
          cropScreenX *
            renderScale
        );

      const sourceCropY =
        Math.round(
          cropScreenY *
            renderScale
        );

      const sourceCropW =
        Math.max(
          1,
          Math.round(
            cropScreenW *
              renderScale
          )
        );

      const sourceCropH =
        Math.max(
          1,
          Math.round(
            cropScreenH *
              renderScale
          )
        );

      /*
       * Clamp source crop to the intermediate canvas.
       */
      const safeSourceX =
        Math.max(
          0,
          Math.min(
            sourceCropX,
            intermediateCanvas.width - 1
          )
        );

      const safeSourceY =
        Math.max(
          0,
          Math.min(
            sourceCropY,
            intermediateCanvas.height - 1
          )
        );

      const safeSourceW =
        Math.max(
          1,
          Math.min(
            sourceCropW,
            intermediateCanvas.width -
              safeSourceX
          )
        );

      const safeSourceH =
        Math.max(
          1,
          Math.min(
            sourceCropH,
            intermediateCanvas.height -
              safeSourceY
          )
        );

      /*
       * -----------------------------------------------------
       * 8. Create final output canvas.
       * -----------------------------------------------------
       */
      const {
        canvas: outCanvas,
        ctx: outCtx,
      } = createCanvas(
        outputW,
        outputH
      );

      /*
       * JPEG cannot contain transparency.
       */
      if (
        exportFormat ===
        "image/jpeg"
      ) {
        outCtx.fillStyle =
          "#ffffff";

        outCtx.fillRect(
          0,
          0,
          outputW,
          outputH
        );
      }

      /*
       * -----------------------------------------------------
       * 9. Draw crop into final canvas.
       *
       * We downsample from the viewport render into the
       * actual source-pixel dimensions.
       * -----------------------------------------------------
       */
      outCtx.drawImage(
        intermediateCanvas,

        /*
         * Source
         */
        safeSourceX,
        safeSourceY,
        safeSourceW,
        safeSourceH,

        /*
         * Destination
         */
        0,
        0,
        outputW,
        outputH
      );

      /*
       * -----------------------------------------------------
       * 10. Convert to Blob.
       * -----------------------------------------------------
       */
      const blob =
        await canvasToBlob(
          outCanvas,
          exportFormat,
          0.95
        );

      /*
       * -----------------------------------------------------
       * 11. Filename.
       * -----------------------------------------------------
       */
      const baseName = file
        ? getFileNameWithoutExtension(
            file.name
          )
        : "cropped";

      const ext =
        exportFormat ===
        "image/png"
          ? "png"
          : exportFormat ===
              "image/jpeg"
            ? "jpg"
            : "webp";

      const filename =
        `${baseName}-cropped-${outputW}x${outputH}.${ext}`;

      /*
       * -----------------------------------------------------
       * 12. Download.
       * -----------------------------------------------------
       */
      saveAs(
        blob,
        filename
      );

      setToastMsg(
        `Exported cropped image (${outputW} × ${outputH} px)`
      );
    } catch (err) {
      console.error(
        "Crop export failed:",
        err
      );

      setToastMsg(
        "Failed to export cropped image."
      );
    } finally {
      setIsExporting(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */
  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <Header />

      <Toast
        message={toastMsg}
        onClose={() =>
          setToastMsg(null)
        }
      />

      <main className="flex-1 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10">
          <ToolHeader
            tag="05 · Crop"
            title="Image Cropper"
            description="Precision image framing with interactive drag handles, aspect ratio constraints (1:1, 16:9, 4:3, 9:16), rule-of-thirds composition grid, and continuous rotation."
            badge="Studio Crop"
          />

          {!file ? (
            <div className="mt-8 max-w-2xl mx-auto">
              <Dropzone
                accept="image/*"
                multiple={false}
                onFiles={handleFile}
                label="Drop an image to crop, or click to browse"
                hint="PNG · JPG · WebP · AVIF · Single image"
              />
            </div>
          ) : (
            <div className="mt-8 animate-fade-in space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* =====================================================
                    LEFT: INTERACTIVE CROP VIEWPORT
                ====================================================== */}
                <div className="lg:col-span-7 flex flex-col space-y-4">
                  <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">

                    {/* Viewport Header */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border-b border-border/80 bg-surface/50 text-[12px]">
                      <div className="flex items-center gap-2 truncate">
                        <span className="h-2 w-2 rounded-full bg-accent" />

                        <span className="font-mono text-[11px] text-muted truncate max-w-[140px] xs:max-w-[200px]">
                          {file.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="font-mono text-[11px] text-muted">
                          <span className="hidden xs:inline">
                            Orig:{" "}
                          </span>
                          {naturalDimensions.w} ×{" "}
                          {naturalDimensions.h} px
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            setFile(null);
                            setImgUrl("");
                            setNaturalDimensions({
                              w: 0,
                              h: 0,
                            });
                          }}
                          className="text-[11px] font-mono text-muted hover:text-red-400 transition-colors"
                        >
                          Change
                        </button>
                      </div>
                    </div>

                    {/* Crop Canvas Display Area */}
                    <div className="relative flex h-[340px] sm:h-[420px] md:h-[480px] w-full items-center justify-center overflow-hidden bg-black/80 select-none">
                      <div
                        ref={containerRef}
                        className="relative h-full w-full flex items-center justify-center overflow-hidden"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt="To crop"
                          className="h-full w-full object-contain pointer-events-none transition-transform duration-75"
                          style={{
                            transform: `scale(${zoom}) rotate(${rotation}deg)`,
                            transformOrigin: "50% 50%",
                          }}
                        />

                        {/* =================================================
                            CROP OVERLAY
                        ================================================== */}
                        <div
                          className="absolute border-2 border-accent shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] cursor-move touch-none"
                          style={{
                            left: `${crop.x * 100}%`,
                            top: `${crop.y * 100}%`,
                            width: `${crop.w * 100}%`,
                            height: `${crop.h * 100}%`,
                          }}
                          onMouseDown={(e) =>
                            handlePointerDown(
                              "move",
                              e
                            )
                          }
                          onTouchStart={(e) =>
                            handlePointerDown(
                              "move",
                              e
                            )
                          }
                        >
                          {/* =================================================
                              RULE OF THIRDS GRID
                          ================================================== */}
                          {showGrid && (
                            <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                              <div className="border-r border-b border-white/25" />
                              <div className="border-r border-b border-white/25" />
                              <div className="border-b border-white/25" />

                              <div className="border-r border-b border-white/25" />
                              <div className="border-r border-b border-white/25" />
                              <div className="border-b border-white/25" />

                              <div className="border-r border-b border-white/25" />
                              <div className="border-r border-white/25" />

                              <div />
                            </div>
                          )}

                          {/* =================================================
                              NW HANDLE
                          ================================================== */}
                          <div
                            className="absolute -top-3 -left-3 h-6 w-6 sm:h-5 sm:w-5 rounded-full bg-accent border-2 border-white cursor-nw-resize shadow-md touch-none"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handlePointerDown(
                                "nw",
                                e
                              );
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                              handlePointerDown(
                                "nw",
                                e
                              );
                            }}
                          />

                          {/* =================================================
                              NE HANDLE
                          ================================================== */}
                          <div
                            className="absolute -top-3 -right-3 h-6 w-6 sm:h-5 sm:w-5 rounded-full bg-accent border-2 border-white cursor-ne-resize shadow-md touch-none"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handlePointerDown(
                                "ne",
                                e
                              );
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                              handlePointerDown(
                                "ne",
                                e
                              );
                            }}
                          />

                          {/* =================================================
                              SW HANDLE
                          ================================================== */}
                          <div
                            className="absolute -bottom-3 -left-3 h-6 w-6 sm:h-5 sm:w-5 rounded-full bg-accent border-2 border-white cursor-sw-resize shadow-md touch-none"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handlePointerDown(
                                "sw",
                                e
                              );
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                              handlePointerDown(
                                "sw",
                                e
                              );
                            }}
                          />

                          {/* =================================================
                              SE HANDLE
                          ================================================== */}
                          <div
                            className="absolute -bottom-3 -right-3 h-6 w-6 sm:h-5 sm:w-5 rounded-full bg-accent border-2 border-white cursor-se-resize shadow-md touch-none"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handlePointerDown(
                                "se",
                                e
                              );
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                              handlePointerDown(
                                "se",
                                e
                              );
                            }}
                          />

                          {/* =================================================
                              OUTPUT DIMENSION BADGE
                          ================================================== */}
                          <div className="absolute top-2 left-2 rounded-md bg-black/80 px-2 py-0.5 font-mono text-[10px] text-white pointer-events-none backdrop-blur-xs">
                            {outputWidthPx} ×{" "}
                            {outputHeightPx} px
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* =====================================================
                    RIGHT: INSPECTOR SETTINGS
                ====================================================== */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-5">

                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-accent"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                        >
                          <path d="M3.5 1.75a.75.75 0 0 0-1.5 0v1.5H.75a.75.75 0 0 0 0 1.5h1.25V12a2 2 0 0 0 2 2h7.25v1.25a.75.75 0 0 0 1.5 0V14h1.25a.75.75 0 0 0 0-1.5H12.5V4a2 2 0 0 0-2-2H4V.75a.75.75 0 0 0-.5-.75ZM4 3.5h6.5a.5.5 0 0 1 .5.5V11H4a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5Z" />
                        </svg>

                        <h3 className="text-[13px] font-semibold text-text">
                          Crop & Framing
                        </h3>
                      </div>

                      <span className="font-mono text-[11px] text-accent">
                        {outputWidthPx} ×{" "}
                        {outputHeightPx}
                      </span>
                    </div>

                    {/* =================================================
                        ASPECT RATIO
                    ================================================== */}
                    <div>
                      <span className="block text-[11px] font-mono text-muted mb-2">
                        Aspect Ratio Mode
                      </span>

                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          {
                            id: "free",
                            label: "Freeform",
                          },
                          {
                            id: "1:1",
                            label: "1:1 Square",
                          },
                          {
                            id: "4:3",
                            label: "4:3 Photo",
                          },
                          {
                            id: "16:9",
                            label: "16:9 Landscape",
                          },
                          {
                            id: "9:16",
                            label: "9:16 Portrait",
                          },
                          {
                            id: "3:2",
                            label: "3:2 DSLR",
                          },
                        ].map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() =>
                              applyRatio(
                                r.id as AspectRatioMode
                              )
                            }
                            className={`h-8 rounded-lg border px-2 text-[11px] font-mono transition-all ${
                              ratioMode === r.id
                                ? "border-accent bg-accent/10 text-accent font-semibold"
                                : "border-border bg-bg/50 text-muted hover:text-text hover:border-border-hover"
                            }`}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* =================================================
                        GRID TOGGLE
                    ================================================== */}
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-[12px] text-muted hover:text-text">
                        <input
                          type="checkbox"
                          checked={showGrid}
                          onChange={(e) =>
                            setShowGrid(
                              e.target.checked
                            )
                          }
                          className="accent-accent h-3.5 w-3.5 rounded"
                        />

                        <span>
                          Rule of thirds grid
                        </span>
                      </label>

                      <span className="font-mono text-[11px] text-muted/60">
                        3 × 3 matrix
                      </span>
                    </div>

                    {/* =================================================
                        ZOOM & ROTATION
                    ================================================== */}
                    <div className="space-y-3 pt-2 border-t border-border">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-muted">
                          Zoom Level
                        </span>

                        <span className="text-accent font-semibold">
                          {zoom.toFixed(1)}x
                        </span>
                      </div>

                      <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.1"
                        value={zoom}
                        onChange={(e) =>
                          setZoom(
                            Number(
                              e.target.value
                            )
                          )
                        }
                        className="w-full h-1.5 rounded-full bg-border accent-accent cursor-pointer"
                      />

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] font-mono text-muted">
                          Rotate ({rotation}°)
                        </span>

                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setRotation(
                                (r) =>
                                  ((r - 90) %
                                    360 +
                                    360) %
                                  360
                              )
                            }
                            className="h-7 px-2.5 rounded-md border border-border bg-bg text-muted hover:text-text hover:border-accent text-[11px] font-mono transition-colors"
                            title="Rotate 90 CCW"
                          >
                            ↺ -90°
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setRotation(
                                (r) =>
                                  (r + 90) %
                                  360
                              )
                            }
                            className="h-7 px-2.5 rounded-md border border-border bg-bg text-muted hover:text-text hover:border-accent text-[11px] font-mono transition-colors"
                            title="Rotate 90 CW"
                          >
                            ↻ +90°
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* =================================================
                        EXPORT FORMAT
                    ================================================== */}
                    <div>
                      <label className="block text-[11px] font-mono text-muted mb-1.5">
                        Export Format
                      </label>

                      <select
                        value={
                          exportFormat
                        }
                        onChange={(e) =>
                          setExportFormat(
                            e.target.value as
                              | "image/png"
                              | "image/jpeg"
                              | "image/webp"
                          )
                        }
                        className="w-full h-9 rounded-lg border border-border bg-bg px-3 text-[12px] font-mono text-text focus:border-accent focus:outline-none transition-colors"
                      >
                        <option value="image/png">
                          PNG · Lossless
                        </option>

                        <option value="image/jpeg">
                          JPG · Web standard
                        </option>

                        <option value="image/webp">
                          WebP · High efficiency
                        </option>
                      </select>
                    </div>

                    {/* =================================================
                        EXPORT BUTTON
                    ================================================== */}
                    <div className="pt-3 border-t border-border">
                      <button
                        type="button"
                        onClick={
                          handleExportCrop
                        }
                        disabled={
                          isExporting
                        }
                        className="w-full h-10 rounded-lg bg-accent text-white font-medium text-[13px] hover:bg-accent-strong disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        {isExporting ? (
                          <>
                            <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />

                            <span>
                              Exporting crop…
                            </span>
                          </>
                        ) : (
                          <>
                            <span>
                              Crop & Export
                            </span>

                            <span className="text-[11px] font-mono opacity-80">
                              (
                              {
                                outputWidthPx
                              }{" "}
                              ×{" "}
                              {
                                outputHeightPx
                              }
                              )
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}