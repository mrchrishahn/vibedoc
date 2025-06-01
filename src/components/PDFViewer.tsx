"use client";

import { useEffect, useRef, useState } from "react";

import * as pdfjsLib from "pdfjs-dist";

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  file: string | Uint8Array;
  className?: string;
}

type PDFPageProxy = pdfjsLib.PDFPageProxy;
type PDFDocumentProxy = pdfjsLib.PDFDocumentProxy;
type RenderTask = pdfjsLib.RenderTask;

export default function PDFViewer({ file, className = "" }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.5);
  const [error, setError] = useState<string | null>(null);
  const renderTask = useRef<RenderTask | null>(null);
  const pdfDataRef = useRef<ArrayBuffer | null>(null);

  useEffect(() => {
    let pdfDoc: PDFDocumentProxy | null = null;
    let isCurrentRender = true;

    const renderPage = async () => {
      if (!canvasRef.current || !pdfDoc) return;

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;

      try {
        // Get the page
        const page = await pdfDoc.getPage(pageNumber);
        if (!isCurrentRender) return;

        // Calculate viewport
        const viewport = page.getViewport({ scale });

        // Set canvas dimensions
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Prepare render context
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        // Cancel any ongoing render task
        if (renderTask.current) {
          renderTask.current.cancel();
        }

        // Render the page
        renderTask.current = page.render(renderContext);
        await renderTask.current.promise;

        if (!isCurrentRender) return;
        renderTask.current = null;
      } catch (err) {
        if (err instanceof Error && err.message !== "Rendering cancelled") {
          console.error("Error rendering page:", err);
          setError("Failed to render PDF page. Please try again.");
        }
      }
    };

    const loadPDF = async () => {
      try {
        setError(null);

        // Load the PDF
        let pdfData: ArrayBuffer;
        if (typeof file === "string") {
          const response = await fetch(file);
          pdfData = await response.arrayBuffer();
        } else {
          // Create a copy of the Uint8Array to prevent detachment
          pdfData = file.buffer.slice(0);
        }

        console.log("pdfData", pdfData);

        // Store the PDF data for reuse
        pdfDataRef.current = pdfData.slice(0);

        // Load the document
        pdfDoc = await pdfjsLib.getDocument({
          data: pdfData,
          password: undefined,
        }).promise;
        if (!isCurrentRender) return;

        setNumPages(pdfDoc.numPages);

        setTimeout(() => {
          renderPage().catch((e) => {
            console.error("Error rendering page:", e);
          });
        }, 500);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError("Failed to load PDF. Please try again.");
      }
    };

    void loadPDF();

    return () => {
      isCurrentRender = false;
      if (renderTask.current) {
        renderTask.current.cancel();
      }
    };
  }, [file, pageNumber, scale]);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const handleZoomOut = () => {
    setScale((s) => {
      const newScale = Math.max(s - 0.25, 0.5);
      // If we have stored PDF data and are changing scale, reload with fresh buffer
      if (pdfDataRef.current && newScale !== s) {
        const freshData = pdfDataRef.current.slice(0);
        void pdfjsLib.getDocument({ data: freshData }).promise;
      }
      return newScale;
    });
  };

  if (error) {
    return (
      <div className={`flex flex-col ${className}`}>
        <div className="flex min-h-[400px] items-center justify-center rounded border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPageNumber((page) => Math.max(1, page - 1))}
            disabled={pageNumber <= 1}
            className="rounded bg-gray-200 px-3 py-1 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={() =>
              setPageNumber((page) => Math.min(numPages, page + 1))
            }
            disabled={pageNumber >= numPages}
            className="rounded bg-gray-200 px-3 py-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="rounded bg-gray-200 px-3 py-1 text-sm"
            title="Zoom Out"
          >
            -
          </button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <button
            onClick={handleZoomIn}
            className="rounded bg-gray-200 px-3 py-1 text-sm"
            title="Zoom In"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto border border-gray-300 bg-gray-100">
        <div className="flex min-h-full items-center justify-center p-4">
          <canvas ref={canvasRef} className="shadow-lg" />
        </div>
      </div>
    </div>
  );
}
