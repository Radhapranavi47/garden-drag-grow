import { useRef } from "react";
import { Helmet } from "react-helmet-async";
import GardenCanvas, { GardenCanvasHandle } from "@/components/garden/GardenCanvas";
import { PlantPalette } from "@/components/garden/PlantPalette";
import { Button } from "@/components/ui/button";

const Index = () => {
  const gardenRef = useRef<GardenCanvasHandle>(null);


  const handleClear = () => gardenRef.current?.clear();

  return (
    <>
      <Helmet>
        <title>Community Garden — Design Your Garden</title>
        <meta name="description" content="Community Garden planner: pick flowers and plants, drag and drop them anywhere, and create your dream garden layout." />
        <link rel="canonical" href="/" />
      </Helmet>

      <header className="hero-gradient">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-center">
            Community Garden Planner
          </h1>
          <p className="mt-4 md:mt-6 text-center text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Select your favorite flowers and plants, then drag and drop them anywhere inside your garden. Add as many as you want.
          </p>
          <div className="mt-8 flex justify-center">
            <a href="#garden" className="story-link">
              <Button size="lg">Start Planting</Button>
            </a>
          </div>
        </div>
      </header>

      <main id="garden" className="container mx-auto px-4 py-10 md:py-14">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <aside className="lg:col-span-1 animate-fade-in">
            <PlantPalette onClear={handleClear} />
          </aside>
          <article className="lg:col-span-2 animate-scale-in">
            <GardenCanvas ref={gardenRef} />
          </article>
        </section>
      </main>
    </>
  );
};

export default Index;
