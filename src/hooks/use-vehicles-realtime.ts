import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VEHICLES_QUERY_KEY } from "@/lib/vehicles-store";

/**
 * Subscribes to all changes on `public.vehicles` and invalidates the
 * vehicles query so the public grid (and any other consumer of
 * `useVehicles`) reflects inserts / updates / deletes without a reload.
 */
export function useVehiclesRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("public:vehicles")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vehicles" },
        () => {
          queryClient.invalidateQueries({ queryKey: VEHICLES_QUERY_KEY });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
