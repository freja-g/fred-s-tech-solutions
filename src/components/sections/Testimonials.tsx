import { motion } from "framer-motion";
import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "CEO, TechStart Inc.",
    content:
      "Fred transformed our chaotic IT infrastructure into a streamlined system. His practical approach saved us countless hours and significantly reduced our downtime.",
    rating: 5,
  },
  {
    name: "James Rodriguez",
    role: "Operations Manager, Swift Logistics",
    content:
      "When our systems crashed before a major deadline, Fred diagnosed and fixed the issue within hours. His calm, methodical approach was exactly what we needed.",
    rating: 5,
  },
  {
    name: "Emily Chen",
    role: "Founder, DataDriven Solutions",
    content:
      "Fred helped us make sense of our data chaos. His analysis tools and recommendations were practical, actionable, and delivered real results.",
    rating: 5,
  },
  {
    name: "Michael Thompson",
    role: "CTO, GrowthPath Startup",
    content:
      "As a non-technical founder, I appreciated Fred's ability to explain complex issues in simple terms. He's now my go-to advisor for all tech decisions.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Clients Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real feedback from businesses and individuals I've helped solve their technical challenges.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <Carousel
            opts={{
              align: "center",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem
                  key={index}
                  className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/2"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="h-full"
                  >
                    <div className="bg-card border border-border rounded-xl p-6 h-full flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300">
                      {/* Stars */}
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                            viewport={{ once: true }}
                          >
                            <Star className="w-5 h-5 fill-primary text-primary" />
                          </motion.div>
                        ))}
                      </div>

                      {/* Quote */}
                      <blockquote className="text-foreground/90 leading-relaxed flex-grow mb-6">
                        "{testimonial.content}"
                      </blockquote>

                      {/* Author */}
                      <div className="border-t border-border pt-4">
                        <p className="font-semibold text-foreground">
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-12 bg-card border-border hover:bg-accent" />
            <CarouselNext className="hidden md:flex -right-12 bg-card border-border hover:bg-accent" />
          </Carousel>

          {/* Mobile dots indicator hint */}
          <p className="text-center text-sm text-muted-foreground mt-6 md:hidden">
            Swipe to see more testimonials
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
