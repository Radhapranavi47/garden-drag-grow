import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Plant = {
  id: string;
  name: string;
  src: string;
  alt: string;
};

const USER_ROSE_URL = "/lovable-uploads/f9557315-7aa6-4306-b3db-4fbfe954efb6.png";
const USER_SUNFLOWER_URL = "/lovable-uploads/df695081-6b6e-49f6-84af-0f48314f93f3.png";
const USER_GRASS_URL = "/lovable-uploads/3710b8bb-987c-4323-a8d4-2c77b2a69d1e.png";
const USER_LAVENDER_URL = "/lovable-uploads/816fb362-bda5-4456-83b4-27ecf2d0d071.png";

const PLANTS: Plant[] = [
  { id: "rose", name: "Rose", src: USER_ROSE_URL, alt: "User uploaded rose" },
  { id: "sunflower", name: "Sunflower", src: USER_SUNFLOWER_URL, alt: "User uploaded sunflower icon" },
  { id: "grass", name: "Grass", src: USER_GRASS_URL, alt: "User uploaded grass" },
  { id: "lavender", name: "Lavender", src: USER_LAVENDER_URL, alt: "User uploaded lavender flower" },
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
          <div key={plant.id} className="group rounded-md border p-2 bg-card hover-scale animate-fade-in" draggable onDragStart={(e) => { e.dataTransfer.setData("application/json", JSON.stringify({ src: plant.src, label: plant.name })); e.dataTransfer.effectAllowed = "copy"; }} title="Drag into the garden canvas">
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="secondary" aria-label="Clear garden">Clear Garden</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear the garden for everyone?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all plants from the shared board for all users. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onClear?.()}>Clear</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
      </CardContent>
    </Card>
  );
};
