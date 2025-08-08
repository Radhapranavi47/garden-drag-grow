import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { Canvas as FabricCanvas, Image as FabricImage } from "fabric";
import { toast } from "sonner";

export type GardenCanvasHandle = {
  addPlant: (url: string, label?: string, at?: { x: number; y: number }) => void;
  clear: () => void;
};

const CANVAS_HEIGHT = 480; // responsive width, fixed height

// Simple chroma-key to remove white backgrounds from plant images
function removeWhiteBackground(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Could not get 2D context"));
        canvas.width = img.naturalWidth || (img as any).width;
        canvas.height = img.naturalHeight || (img as any).height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // If pixel is near-white, make it transparent
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          if (max > 235 && min > 210) {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = reject as any;
    img.src = url;
  });
}

const GardenCanvas = forwardRef<GardenCanvasHandle>(function GardenCanvas(_, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const canvas = new FabricCanvas(canvasRef.current, {
      width,
      height: CANVAS_HEIGHT,
      backgroundColor: "transparent",
      selection: false,
      preserveObjectStacking: true,
    });

    setFabricCanvas(canvas);
    toast("Garden ready! Pick a plant and start placing it.");

    const onResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      canvas.setWidth(newWidth);
      canvas.setHeight(CANVAS_HEIGHT);
      canvas.renderAll();
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      canvas.dispose();
    };
  }, []);

  // Expose imperative methods
  useImperativeHandle(ref, () => ({
    addPlant: (url: string, label?: string, at?: { x: number; y: number }) => {
      if (!fabricCanvas) return;
removeWhiteBackground(url)
        .then((dataUrl) => FabricImage.fromURL(dataUrl))
        .then((img) => {
          if (!img) return;
          const left = at?.x ?? fabricCanvas.getWidth() / 2;
          const top = at?.y ?? 120;
          (img as any).set({
            left,
            top,
            originX: "center",
            originY: "center",
            selectable: true,
            hasControls: false,
            lockScalingX: true,
            lockScalingY: true,
            lockRotation: true,
            hoverCursor: "grab",
          });
          fabricCanvas.add(img);
          fabricCanvas.setActiveObject(img);
          fabricCanvas.renderAll();
        })
        .catch(() => {
          // Fallback: add original image if processing fails
          FabricImage.fromURL(url).then((img) => {
            if (!img) return;
            const left = at?.x ?? fabricCanvas.getWidth() / 2;
            const top = at?.y ?? 120;
            (img as any).set({
              left,
              top,
              originX: "center",
              originY: "center",
              selectable: true,
              hasControls: false,
              lockScalingX: true,
              lockScalingY: true,
              lockRotation: true,
              hoverCursor: "grab",
            });
            fabricCanvas.add(img);
            fabricCanvas.setActiveObject(img);
            fabricCanvas.renderAll();
          });
        });
    },
    clear: () => {
      if (!fabricCanvas) return;
      fabricCanvas.clear();
      fabricCanvas.backgroundColor = "transparent";
      fabricCanvas.renderAll();
      toast("Garden cleared");
    },
  }), [fabricCanvas]);

  return (
    <div className="rounded-lg border bg-secondary/30 p-2 shadow-sm">
      <div className="hero-gradient rounded-md p-3">
        <div
          ref={containerRef}
          className="rounded-md border bg-background/80 backdrop-blur-sm p-2"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            try {
              const data = e.dataTransfer.getData("application/json");
              if (!data) return;
              const { src, label } = JSON.parse(data);
              if (!src) return;
              const rect = canvasRef.current?.getBoundingClientRect();
              if (!rect || !fabricCanvas) return;
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
removeWhiteBackground(src)
               .then((dataUrl) => FabricImage.fromURL(dataUrl))
               .then((img) => {
                 if (!img) return;
                 (img as any).set({
                   left: x,
                   top: y,
                   originX: "center",
                   originY: "center",
                   selectable: true,
                   hasControls: false,
                   lockScalingX: true,
                   lockScalingY: true,
                   lockRotation: true,
                   hoverCursor: "grab",
                 });
                 fabricCanvas.add(img);
                 fabricCanvas.setActiveObject(img);
                 fabricCanvas.renderAll();
               })
               .catch(() => {
                 FabricImage.fromURL(src).then((img) => {
                   if (!img) return;
                    (img as any).set({
                      left: x,
                      top: y,
                      originX: "center",
                      originY: "center",
                      selectable: true,
                      hasControls: false,
                      lockScalingX: true,
                      lockScalingY: true,
                      lockRotation: true,
                      hoverCursor: "grab",
                    });
                    fabricCanvas.add(img);
                    fabricCanvas.setActiveObject(img);
                    fabricCanvas.renderAll();
                 });
               });
            } catch {}
          }}
        >
          <canvas ref={canvasRef} className="w-full" />
        </div>
      </div>
      <p className="text-center text-sm text-muted-foreground mt-2">
        Tip: drag plants anywhere. Move only the flower—no resizing. Add as many as you like!
      </p>
    </div>
  );
});

export default GardenCanvas;
