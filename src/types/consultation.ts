
import { z } from "zod";

export const consultationSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(100),
  description: z.string().min(10, "Please provide more detail (at least 10 characters)").max(2000),
  service_id: z.string().uuid().nullable().optional(),
  attachment_urls: z.array(z.string()).default([]),
});

export type ConsultationFormValues = z.infer<typeof consultationSchema>;

export type Consultation = {
  id: string;
  created_at: string;
  customer_id: string;
  subject: string;
  description: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'resolved' | 'rejected';
  service_id: string | null;
  technician_id: string | null;
  attachment_urls: string[];
  resolved_at: string | null;
  assigned_at: string | null;
  completed_at: string | null;
  diagnostics: string | null;
  job_notes: string | null;
  cost: number;
  rejected_reason: string | null;
};
