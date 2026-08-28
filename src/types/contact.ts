
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Invalid phone number").max(20),
  service: z.string().min(1, "Please select a service"),
  details: z.string().min(10, "Please provide more details").max(2000),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
