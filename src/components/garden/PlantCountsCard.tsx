import { FC, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Counts = Record<string, number>;

export const PlantCountsCard: FC<{ total: number; counts: Counts }>
  = ({ total, counts }) => {
  const items = useMemo(() => Object.entries(counts).sort((a, b) => b[1] - a[1]), [counts]);

  return (
    <div className="absolute top-2 right-2 z-20">
      <Popover>
        <PopoverTrigger asChild>
          <button aria-label="Show planters and counts" className="focus:outline-none">
            <Card className="px-4 py-2 shadow-md">
              <div className="text-sm font-medium">Total plants</div>
              <div className="text-2xl font-bold leading-tight">{total}</div>
            </Card>
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64">
          <div className="mb-2 font-medium">Planters</div>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No plants yet.</p>
          ) : (
            <ul className="space-y-1">
              {items.map(([name, count]) => (
                <li key={name} className="flex items-center justify-between">
                  <span className="truncate max-w-[12rem]" title={name}>{name}</span>
                  <span className="font-medium">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};
