
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ContactFormValues, contactSchema } from "@/types/contact";

export const useContact = () => {
  const { toast } = useToast();
  const nav = useNavigate();

  const handleExternalSubmit = (values: ContactFormValues, method: "whatsapp" | "email") => {
    const result = contactSchema.safeParse(values);
    if (!result.success) {
      toast({
        title: "Validation error",
        description: result.error.issues[0].message,
        variant: "destructive"
      });
      return;
    }

    const { name, email, phone, service, details } = values;
    const message = `New consultation request from GiCOFix Solutions:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\n\nDetails:\n${details}`;

    if (method === "whatsapp") {
      const whatsappHref = `https://wa.me/254742123999?text=${encodeURIComponent(message)}`;
      window.open(whatsappHref, "_blank");
    } else {
      const mailtoHref = `mailto:wigatechnologies@gmail.com?subject=${encodeURIComponent(
        `Consultation Request from ${name}`
      )}&body=${encodeURIComponent(message)}`;
      window.location.href = mailtoHref;
    }

    toast({
      title: "Redirecting...",
      description: "Your consultation request is ready to send.",
    });
  };

  const handleInAppSubmit = (values: ContactFormValues) => {
    const result = contactSchema.safeParse(values);
    if (!result.success) {
      toast({
        title: "Validation error",
        description: result.error.issues[0].message,
        variant: "destructive"
      });
      return;
    }

    const params = new URLSearchParams();
    params.set("service", values.service);
    params.set("details", values.details);

    toast({
      title: "Finishing request",
      description: "Please confirm your details and add any photos if needed.",
    });
    nav(`/book?${params.toString()}`);
  };

  return { handleExternalSubmit, handleInAppSubmit };
};
