import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import rose from "@/assets/rose.png";
import sunflower from "@/assets/sunflower.png";
import tulip from "@/assets/tulip.png";
import fern from "@/assets/fern.png";

type Plant = {
  id: string;
  name: string;
  src: string;
  alt: string;
};

const PLANTS: Plant[] = [
  { id: "rose", name: "Rose", src: rose, alt: "Red rose flower with stem and leaves" },
  { id: "sunflower", name: "Sunflower", src: sunflower, alt: "Bright yellow sunflower head with leaves" },
  { id: "tulip", name: "Tulip", src: tulip, alt: "Pink tulip with green stem" },
  { id: "fern", name: "Fern", src: fern, alt: "Lush green fern frond" },
];

export const PlantPalette: FC<{ onClear?: () => void }>
  = ({ onClear }) => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">Plant Palette</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {PLANTS.map((plant) => (
          <div key={plant.id} className="group rounded-md border p-2 bg-card hover-scale" draggable onDragStart={(e) => { e.dataTransfer.setData("application/json", JSON.stringify({ src: plant.src, label: plant.name })); e.dataTransfer.effectAllowed = "copy"; }} title="Drag into the garden canvas">
            <img
              src={plant.src}
              alt={`${plant.alt} icon`}
              loading="lazy"
              className="mx-auto h-20 w-20 object-contain"
            />
            <div className="mt-2 flex items-center justify-center">
              <span className="text-sm">{plant.name}</span>
            </div>
          </div>
        ))}
        {onClear && (
          <div className="col-span-2 flex justify-end">
            <Button variant="secondary" onClick={onClear} aria-label="Clear garden">
              Clear Garden
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
