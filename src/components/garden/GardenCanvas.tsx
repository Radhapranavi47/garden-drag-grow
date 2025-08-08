import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { Canvas as FabricCanvas, Image as FabricImage } from "fabric";
import { toast } from "sonner";

export type GardenCanvasHandle = {
  addPlant: (url: string, label?: string) => void;
  clear: () => void;
};

const CANVAS_HEIGHT = 480; // responsive width, fixed height

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
      selection: true,
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
    addPlant: (url: string, label?: string) => {
      if (!fabricCanvas) return;
      FabricImage.fromURL(url).then((img) => {
        if (!img) return;
        // Scale to a reasonable size
        const targetWidth = 96; // px
        const scale = targetWidth / (img.width || targetWidth);
        (img as any).set({
          left: fabricCanvas.getWidth() / 2,
          top: 120,
          originX: "center",
          originY: "center",
          selectable: true,
          hoverCursor: "grab",
        });
        img.scale(scale);
        fabricCanvas.add(img);
        fabricCanvas.setActiveObject(img);
        fabricCanvas.renderAll();
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
        >
          <canvas ref={canvasRef} className="w-full" />
        </div>
      </div>
      <p className="text-center text-sm text-muted-foreground mt-2">
        Tip: drag plants anywhere. Use handles to rotate/resize. Add as many as you like!
      </p>
    </div>
  );
});

export default GardenCanvas;
