"use client";

import { useEffect, useRef, useState } from "react";
import { useDrop, useDrag } from "react-dnd";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import "pdfjs-dist/webpack";
pdfjsLib.GlobalWorkerOptions.workerSrc = window.origin + "/pdf.worker.js";

const ITEM_TYPE = "FLOW_ITEM";

export default function PdfCanvasViewer({
  file,
  flowItems,
  onItemDrop,
  onQrCodeDrop,
  qrCodePositions,
}) {
  const containerRef = useRef(null);
  const [pdf, setPdf] = useState(null);
  const [pages, setPages] = useState([]);

  useEffect(() => {
    const loadPdf = async () => {
      const loadingTask = pdfjsLib.getDocument(
        typeof file === "string" ? file : URL.createObjectURL(file)
      );
      const loadedPdf = await loadingTask.promise;
      setPdf(loadedPdf);
    };

    if (file) loadPdf();
  }, [file]);

  useEffect(() => {
    const renderPages = async () => {
      if (!pdf || !containerRef.current) return;

      containerRef.current.innerHTML = "";
      const tempPages = [];
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.0 });
        tempPages.push({ pageNum, viewport, page });
      }
      setPages(tempPages);
    };

    renderPages();
  }, [pdf]);

  return (
    <div
      ref={containerRef}
      style={{ display: "flex", flexDirection: "column", gap: "20px" }}
    >
      {pages.map(({ pageNum, viewport, page }) => (
        <DropCanvas
          key={pageNum}
          page={page}
          pageNumber={pageNum}
          viewport={viewport}
          flowItems={flowItems}
          onItemDrop={onItemDrop}
          onQrCodeDrop={onQrCodeDrop}
          qrCodePosition={qrCodePositions[pageNum]}
        />
      ))}
    </div>
  );
}

function DraggableTag({ item, index, position }) {
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      style={{
        position: "absolute",
        top: position.y,
        left: position.x,
        opacity: isDragging ? 0.4 : 1,
        cursor: "move",
        pointerEvents: "auto",
        userSelect: "none",
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: "#1976d2",
          color: "#fff",
          padding: "8px 10px",
          borderRadius: 16,
          fontSize: 13,
        }}
      >
        {item.fullname || `İmzacı ${index + 1}`}
      </div>
    </div>
  );
}

function DraggableQrCodeTag({ position }) {
  const [{ isDragging }, drag] = useDrag({
    type: "QR_CODE",
    item: { type: "QR_CODE" },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      style={{
        position: "absolute",
        top: position.y,
        left: position.x,
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
        userSelect: "none",
        pointerEvents: "auto",
        zIndex: 100,
      }}
    >
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/4/41/QR_Code_Example.svg" // `public/qr-code.svg` içine yerleştir
        alt="QR Kod"
        width={60}
        height={60}
        style={{ display: "block" }}
      />
    </div>
  );
}

function DropCanvas({
  page,
  pageNumber,
  viewport,
  flowItems,
  onItemDrop,
  onQrCodeDrop,
  qrCodePosition,
}) {
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);

  const [{ isOver }, drop] = useDrop({
    accept: [ITEM_TYPE, "QR_CODE"],
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.floor(offset.x - rect.left);
      const y = Math.floor(offset.y - rect.top);

      if (item.type === "QR_CODE") {
        const position = { x, y };
        const canvasWidth = rect.width;
        const canvasHeight = rect.height;
        onQrCodeDrop(pageNumber, position, canvasWidth, canvasHeight);
      } else {
        onItemDrop(item.index, pageNumber, { x, y });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  useEffect(() => {
    const render = async () => {
      if (!canvasRef.current) return;

      const context = canvasRef.current.getContext("2d");

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const task = page.render({ canvasContext: context, viewport });
      renderTaskRef.current = task;

      try {
        await task.promise;
      } catch (error) {
        if (error?.name !== "RenderingCancelledException") {
          console.error("PDF render hatası:", error);
        }
      }
    };

    render();
  }, [page, viewport]);

  return (
    <div
      style={{
        position: "relative",
        border: isOver ? "2px dashed green" : "1px solid #ccc",
        display: "inline-block",
      }}
      ref={drop}
    >
      <canvas
        ref={canvasRef}
        width={viewport.width}
        height={viewport.height}
        style={{ display: "block", transform: "none" }}
      />
      {flowItems
        .filter((item) => item.page === pageNumber && item.position)
        .map((item, index) => (
          <DraggableTag
            key={index}
            item={item}
            index={index}
            position={item.position}
          />
        ))}

      {qrCodePosition && <DraggableQrCodeTag position={qrCodePosition} />}
    </div>
  );
}
