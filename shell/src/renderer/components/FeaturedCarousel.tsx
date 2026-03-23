import React from 'react';
import type { RegistryEntry } from '@vibedepot/shared';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight } from "lucide-react";

interface FeaturedCarouselProps {
  apps: RegistryEntry[];
  onSelect: (app: RegistryEntry) => void;
}

export function FeaturedCarousel({ apps, onSelect }: FeaturedCarouselProps): React.ReactElement {
  return (
    <div className="relative w-full group">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {apps.map((app) => (
            <CarouselItem key={app.id} className="pl-4 md:basis-1/2 lg:basis-1/2">
              <div 
                className="relative h-[280px] w-full rounded-3xl overflow-hidden cursor-pointer group/item shadow-xl transition-all duration-500 hover:shadow-primary/20"
                onClick={() => onSelect(app)}
              >
                {/* Background Image */}
                {app.thumbnail ? (
                  <img
                    src={app.thumbnail}
                    alt={app.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-indigo-900" />
                )}
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end gap-3 translate-y-2 group-hover/item:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary hover:bg-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border-none">
                      Featured
                    </Badge>
                    {app.category && (
                      <Badge variant="outline" className="text-white border-white/30 text-[10px] uppercase tracking-wider px-2 py-0.5 backdrop-blur-md">
                        {app.category}
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-3xl font-black text-white leading-tight">
                    {app.name}
                  </h3>
                  
                  <p className="text-sm text-white/70 line-clamp-2 max-w-sm font-medium">
                    {app.description}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <Button 
                      size="sm" 
                      className="rounded-full px-6 font-bold bg-white text-black hover:bg-white/90 transition-colors"
                    >
                      Details
                      <ArrowRight className="size-4 ml-2" />
                    </Button>
                    <span className="text-xs text-white/50 font-mono">v{app.version}</span>
                  </div>
                </div>
                
                {/* Decorative Sparkle */}
                <div className="absolute top-6 right-6 p-3 rounded-full bg-white/10 backdrop-blur-md opacity-0 group-hover/item:opacity-100 transition-opacity duration-500">
                  <Sparkles className="size-5 text-white animate-pulse" />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="absolute -top-16 right-12 flex gap-2">
          <CarouselPrevious className="static translate-y-0 size-10 border-border bg-card hover:bg-accent text-foreground shadow-sm" />
          <CarouselNext className="static translate-y-0 size-10 border-border bg-card hover:bg-accent text-foreground shadow-sm" />
        </div>
      </Carousel>
    </div>
  );
}
