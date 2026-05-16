import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Review = { id: string; author_name: string; author_role: string | null; rating: number; title: string | null; body: string; created_at: string };

const fallback: Review[] = [
  { id: "f1", author_name: "Sarah K.", author_role: "Retail Owner", rating: 5, title: "Saved our POS in an hour", body: "Our system was down right before peak hours. Wiga Tech had us back up faster than I thought possible. Lifesavers.", created_at: "" },
  { id: "f2", author_name: "James M.", author_role: "Startup Founder", rating: 5, title: "Practical, no jargon", body: "Finally, a tech consultant who explains things in plain English. Their automation cut our admin work in half.", created_at: "" },
  { id: "f3", author_name: "Linda W.", author_role: "Office Manager", rating: 5, title: "Reliable IT partner", body: "Whenever something breaks, one message and they're on it. Highly recommend for any small business.", created_at: "" },
];

const ReviewsCarousel = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    supabase
      .from("reviews")
      .select("id, author_name, author_role, rating, title, body, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data && data.length > 0) setReviews(data as Review[]);
        else setReviews(fallback);
      });
  }, []);

  return (
    <section className="section-padding bg-secondary/50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <p className="text-accent font-medium mb-2 text-sm uppercase tracking-wide">Reviews</p>
          <h2 className="text-3xl md:text-4xl font-semibold mb-3">What Our Customers Say</h2>
          <p className="text-muted-foreground">Real stories from businesses we've helped grow and run smoother.</p>
        </motion.div>

        <Carousel opts={{ align: "start", loop: true }} className="w-full">
          <CarouselContent className="-ml-4">
            {reviews.map((r) => (
              <CarouselItem key={r.id} className="pl-4 basis-[90%] sm:basis-1/2 lg:basis-1/3">
                <div className="bg-card border border-border rounded-xl p-6 shadow-card h-full flex flex-col">
                  <Quote className="text-accent/30 mb-3" size={28} />
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < r.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}
                      />
                    ))}
                  </div>
                  {r.title && <h3 className="font-semibold mb-2">{r.title}</h3>}
                  <p className="text-sm text-muted-foreground flex-1 mb-4">{r.body}</p>
                  <div className="pt-4 border-t border-border">
                    <p className="font-medium text-sm">{r.author_name}</p>
                    {r.author_role && <p className="text-xs text-muted-foreground">{r.author_role}</p>}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>

        <div className="text-center mt-8">
          <Link to="/reviews" className={cn(buttonVariants({ variant: "outline" }))}>
            Read all reviews & share yours
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ReviewsCarousel;
