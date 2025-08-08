import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { Canvas as FabricCanvas, Image as FabricImage } from "fabric";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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

type GardenCanvasProps = { onAdd?: (label?: string) => void; onInitialCounts?: (counts: Record<string, number>) => void; onRemove?: (label?: string) => void };

const GardenCanvas = forwardRef<GardenCanvasHandle, GardenCanvasProps>(function GardenCanvas({ onAdd, onInitialCounts, onRemove }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);

// Track objects and realtime channel
const objectsById = useRef<Map<string, any>>(new Map());
const renderedIds = useRef<Set<string>>(new Set());
const rtChannelRef = useRef<any>(null);


// Helper to render a DB row onto the canvas
const addRowToCanvas = async (row: any) => {
  if (!fabricCanvas) return;
  if (objectsById.current.has(row.id)) return;
  try {
    const dataUrl = await removeWhiteBackground(row.url);
    const img = await FabricImage.fromURL(dataUrl);
    if (!img) return;
      (img as any).set({
        left: row.x,
        top: row.y,
        originX: "center",
        originY: "center",
        selectable: true,
        hasControls: false,
        hasBorders: false,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: false,
        hoverCursor: "move",
        borderColor: "rgba(0,0,0,0)",
        cornerColor: "rgba(0,0,0,0)",
        cornerStrokeColor: "rgba(0,0,0,0)",
        transparentCorners: true,
      });
    (img as any).data = { id: row.id, label: row.label };
    objectsById.current.set(row.id, img);
    fabricCanvas.add(img);
    fabricCanvas.renderAll();
  } catch {
    const img = await FabricImage.fromURL(row.url);
    if (!img) return;
    (img as any).set({
      left: row.x,
      top: row.y,
      originX: "center",
      originY: "center",
      selectable: true,
      hasControls: false,
      hasBorders: false,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: false,
      hoverCursor: "move",
      borderColor: "rgba(0,0,0,0)",
      cornerColor: "rgba(0,0,0,0)",
      cornerStrokeColor: "rgba(0,0,0,0)",
      transparentCorners: true,
    });
    (img as any).data = { id: row.id, label: row.label };
    objectsById.current.set(row.id, img);
    fabricCanvas.add(img);
    fabricCanvas.renderAll();
  }
};
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

    canvas.selectionColor = "rgba(0,0,0,0)";
    canvas.selectionBorderColor = "rgba(0,0,0,0)";

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

// Load existing items and subscribe to realtime changes
useEffect(() => {
  if (!fabricCanvas) return;
  let mounted = true;

  const load = async () => {
    const { data, error } = await supabase
      .from('garden_items')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Load garden_items error', error);
      return;
    }
    if (!mounted) return;
    const counts: Record<string, number> = {};
    for (const row of data || []) {
      await addRowToCanvas(row);
      const key = (row.label || 'Plant').trim() || 'Plant';
      counts[key] = (counts[key] || 0) + 1;
    }
    try { onInitialCounts?.(counts); } catch {}
  };

  load();

  const channel = supabase
    .channel('public:garden_items')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'garden_items' }, async (payload) => {
      const row = (payload as any).new;
      if (renderedIds.current.has(row.id)) return;
      await addRowToCanvas(row);
      try { onAdd?.(row.label); } catch {}
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'garden_items' }, (payload) => {
      const row = (payload as any).new;
      const obj = objectsById.current.get(row.id);
      if (obj && fabricCanvas) {
        (obj as any).set({ left: row.x, top: row.y, angle: row.angle || 0 });
        fabricCanvas.renderAll();
      }
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'garden_items' }, (payload) => {
      const row = (payload as any).old;
      const obj = objectsById.current.get(row.id);
      if (obj && fabricCanvas) {
        fabricCanvas.remove(obj);
        objectsById.current.delete(row.id);
        fabricCanvas.renderAll();
        try { onRemove?.(row.label); } catch {}
        if (objectsById.current.size === 0) {
          try { onInitialCounts?.({}); } catch {}
        }
      }
    })
    .subscribe();

  rtChannelRef.current = channel;

  return () => {
    mounted = false;
    if (rtChannelRef.current) {
      supabase.removeChannel(rtChannelRef.current);
      rtChannelRef.current = null;
    }
  };
}, [fabricCanvas, onAdd, onInitialCounts]);

  // Sync moves/rotations to DB and handle Delete key
  useEffect(() => {
    if (!fabricCanvas) return;

    const onModified = (e: any) => {
      const obj = e.target as any;
      if (!obj || !obj.data?.id) return;
      const { left, top, angle } = obj;
      supabase
        .from('garden_items')
        .update({ x: left, y: top, angle: angle || 0 })
        .eq('id', obj.data.id);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      const obj = fabricCanvas.getActiveObject() as any;
      if (!obj || !obj.data?.id) return;
      e.preventDefault();
      // Optimistic removal; realtime will broadcast DELETE
      supabase.from('garden_items').delete().eq('id', obj.data.id);
      fabricCanvas.remove(obj);
      objectsById.current.delete(obj.data.id);
      fabricCanvas.renderAll();
    };

    fabricCanvas.on('object:modified', onModified);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      fabricCanvas.off('object:modified', onModified);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [fabricCanvas]);

  // Expose imperative methods
  useImperativeHandle(ref, () => ({
addPlant: (url: string, label?: string, at?: { x: number; y: number }) => {
  if (!fabricCanvas) return;
  const left = at?.x ?? fabricCanvas.getWidth() / 2;
  const top = at?.y ?? 120;
  // Insert into shared table; realtime will broadcast to everyone
  supabase
    .from('garden_items')
    .insert({
      label: label || 'Plant',
      url,
      x: left,
      y: top,
      scale: 1,
      angle: 0,
    })
    .select()
    .single()
    .then(async ({ data, error }) => {
      if (error || !data) {
        toast("Couldn't add plant, please try again");
        return;
      }
      renderedIds.current.add(data.id);
      await addRowToCanvas(data);
      try { onAdd?.(label); } catch {}
    });
},
clear: () => {
  if (!fabricCanvas) return;
  objectsById.current.clear();
  renderedIds.current.clear();
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
// Insert into DB; realtime will render across all clients
supabase
  .from('garden_items')
  .insert({ label: label || 'Plant', url: src, x, y, scale: 1, angle: 0 })
  .select()
  .single()
  .then(async ({ data, error }) => {
    if (error || !data) {
      toast("Couldn't add plant, please try again");
      return;
    }
    renderedIds.current.add(data.id);
    await addRowToCanvas(data);
    try { onAdd?.(label); } catch {}
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
