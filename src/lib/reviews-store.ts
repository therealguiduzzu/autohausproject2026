import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getQueryClient } from "./query-client-ref";
import type { Database } from "@/integrations/supabase/types";

export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type NewReview = Database["public"]["Tables"]["reviews"]["Insert"];

export const REVIEWS_QUERY_KEY = ["reviews"] as const;

/** Öffentlich: nur freigegebene Bewertungen (RLS erzwingt das zusätzlich). */
export const publishedReviewsQuery = queryOptions({
  queryKey: [...REVIEWS_QUERY_KEY, "published"],
  queryFn: async (): Promise<Review[]> => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("published", true)
      .order("review_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  staleTime: 5 * 60_000,
});

export function usePublishedReviews(): Review[] {
  return useQuery(publishedReviewsQuery).data ?? [];
}

/** Admin: alle Bewertungen (Personal sieht laut RLS auch unveröffentlichte). */
export const allReviewsQuery = queryOptions({
  queryKey: [...REVIEWS_QUERY_KEY, "all"],
  queryFn: async (): Promise<Review[]> => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

const invalidate = () => getQueryClient()?.invalidateQueries({ queryKey: REVIEWS_QUERY_KEY });

export const reviewsStore = {
  add: async (review: NewReview) => {
    const { error } = await supabase.from("reviews").insert(review);
    invalidate();
    if (error) throw error;
  },
  setPublished: async (id: string, published: boolean) => {
    const { error } = await supabase.from("reviews").update({ published }).eq("id", id);
    invalidate();
    if (error) throw error;
  },
  remove: async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    invalidate();
    if (error) throw error;
  },
};

export function averageRating(reviews: Pick<Review, "rating">[]): number | null {
  if (reviews.length === 0) return null;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}
