"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppStore } from "@/store/useAppStore";
import { useApi } from "@/hooks/useApi";

export function MarketplaceSelector() {
  const { selectedMarketplace, setSelectedMarketplace } = useAppStore();
  const [open, setOpen] = useState(false);
  const { data: marketplaces, loading, fetchData } = useApi<string[]>("/analytics/marketplaces");

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading || !marketplaces) {
    return (
      <div className="flex items-center gap-2 h-10">
        <Store className="h-4 w-4 animate-pulse text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[240px] justify-between h-10"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Store className="h-4 w-4 shrink-0" />
            <span className="truncate">{selectedMarketplace || "Select..."}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No marketplace found.</CommandEmpty>
            <CommandGroup>
              {marketplaces.map((marketplace) => (
                <CommandItem
                  key={marketplace}
                  value={marketplace}
                  onSelect={(currentValue) => {
                    setSelectedMarketplace(currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedMarketplace === marketplace ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {marketplace}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
