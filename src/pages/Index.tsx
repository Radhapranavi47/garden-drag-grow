import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import GardenCanvas, { GardenCanvasHandle } from "@/components/garden/GardenCanvas";
import { PlantPalette } from "@/components/garden/PlantPalette";
import { Button } from "@/components/ui/button";
import { NamePromptDialog } from "@/components/guest/NamePromptDialog";
import { PlantCountsCard } from "@/components/garden/PlantCountsCard";

const Index = () => {
  const gardenRef = useRef<GardenCanvasHandle>(null);
  const [guestName, setGuestName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  useEffect(() => {
    const readName = () => {
      try {
        setGuestName(localStorage.getItem("garden_guest_name"));
      } catch {}
    };
    readName();

    const onName = () => readName();
    window.addEventListener("guest-name-updated", onName as unknown as EventListener);

    const updateAdmin = () => {
      try {
        setIsAdmin(window.location.hash.toLowerCase().includes("admin"));
      } catch {}
    };
    updateAdmin();
    window.addEventListener("hashchange", updateAdmin);

    return () => {
      window.removeEventListener("guest-name-updated", onName as unknown as EventListener);
      window.removeEventListener("hashchange", updateAdmin);
    };
  }, []);

  const handleClear = () => { gardenRef.current?.clear(); setCounts({}); };
  const handleAdded = () => {
    const n = (guestName || "Guest").trim() || "Guest";
    setCounts((prev) => ({ ...prev, [n]: (prev[n] || 0) + 1 }));
  };

  return (
    <>
      <Helmet>
        <title>Welcome to Pranu's Garden — Design Your Garden</title>
        <meta name="description" content="Community Garden planner: pick flowers and plants, drag and drop them anywhere, and create your dream garden layout." />
        <link rel="canonical" href="/" />
      </Helmet>

      <header className="hero-gradient">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-center">
            Welcome to Pranu's Garden
          </h1>
          <p className="mt-4 md:mt-6 text-center text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Select your favorite flowers and plants, then drag and drop them anywhere inside your garden. Add as many as you want.
          </p>
          {guestName && (
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Planting as {guestName}
            </p>
          )}
          <div className="mt-8 flex flex-col items-center gap-3">
            <a href="#garden" className="story-link">
              <Button size="lg">Start Planting</Button>
            </a>
          </div>
        </div>
      </header>

      <main id="garden" className="container mx-auto px-4 py-10 md:py-14">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <aside className="lg:col-span-1 animate-fade-in">
            <PlantPalette onClear={isAdmin ? handleClear : undefined} />
          </aside>
          <article className="lg:col-span-2 animate-scale-in relative">
            <PlantCountsCard total={totalCount} counts={counts} />
            <GardenCanvas ref={gardenRef} onAdd={() => handleAdded()} />
          </article>
        </section>
      </main>
      <NamePromptDialog />
    </>
  );
};

export default Index;
