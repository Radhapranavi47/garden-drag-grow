import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


import tulip from "@/assets/tulip.png";


type Plant = {
  id: string;
  name: string;
  src: string;
  alt: string;
};

const USER_ROSE_URL = "/lovable-uploads/f9557315-7aa6-4306-b3db-4fbfe954efb6.png";
const USER_SUNFLOWER_URL = "/lovable-uploads/df695081-6b6e-49f6-84af-0f48314f93f3.png";


const PLANTS: Plant[] = [
  { id: "rose", name: "Rose", src: USER_ROSE_URL, alt: "User uploaded rose" },
  { id: "sunflower", name: "Sunflower", src: USER_SUNFLOWER_URL, alt: "User uploaded sunflower icon" },
  { id: "tulip", name: "Tulip", src: tulip, alt: "Pink tulip with green stem" },
  { id: "grass", name: "Grass", src: tulip, alt: "Tulip icon representing grass" },
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
