
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const LegalPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 md:pt-24 pt-4 pb-12 container max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Legal Agreements</h1>

        <Tabs defaultValue="tos" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="tos">Terms of Service</TabsTrigger>
            <TabsTrigger value="eula">EULA & Privacy</TabsTrigger>
          </TabsList>

          <TabsContent value="tos">
            <ScrollArea className="h-[60vh] rounded-md border p-6 bg-card">
              <div className="prose prose-sm dark:prose-invert max-w-none space-y-4">
                <h2 className="text-xl font-bold">1. ACCEPTANCE OF TERMS</h2>
                <p>By registering for, accessing, or using the application platform and services provided herein ("Services"), you ("User" or "Customer") agree to be bound by these Terms of Service ("Agreement").</p>

                <h2 className="text-xl font-bold">2. ACCEPTABLE USE & SYSTEM INTEGRITY</h2>
                <p>You agree not to misuse the Services. You shall not attempt to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Circumvent layer security controls, authorization headers, or database infrastructure.</li>
                  <li>Perform automated scraping or execute requests exceeding specified Rate Limit policies (60 requests/min for public routes; 1,000 requests/min for authenticated routes).</li>
                  <li>Execute Denial-of-Service (DoS) or Distributed Denial-of-Service (DDoS) attacks against any part of the application infrastructure.</li>
                </ul>

                <h2 className="text-xl font-bold">3. SERVICE LEVEL AGREEMENT (SLA) AND MAINTENANCE</h2>
                <p>Target Uptime: We endeavor to maintain a system uptime target of 99.9%.</p>
                <p>Maintenance Windows: Scheduled maintenance will occur during off-peak hours with minimum 48 hours notice. Emergency maintenance required for critical security patches may occur without advance warning.</p>

                <h2 className="text-xl font-bold">4. LIMITATION OF LIABILITY</h2>
                <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE." WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, PUNITIVE, OR CONSEQUENTIAL DAMAGES RESULTING FROM SYSTEM DISRUPTIONS OR DATA LOSS.</p>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="eula">
            <ScrollArea className="h-[60vh] rounded-md border p-6 bg-card">
              <div className="prose prose-sm dark:prose-invert max-w-none space-y-4">
                <h2 className="text-xl font-bold">1. GRANT OF LICENSE</h2>
                <p>Subject to compliance with this Agreement, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the mobile and web client software applications solely for your internal business operations or personal use.</p>

                <h2 className="text-xl font-bold">2. DATA PROTECTION & PRIVACY POLICY</h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Data Encryption:</strong> All user inputs, data transfers, and transactional assets are encrypted in transit using TLS 1.3 and at rest using AES-256 standard encryption algorithms.</li>
                  <li><strong>Data Ownership:</strong> You retain full ownership of all data submitted to the platform. We claim no ownership over client data.</li>
                  <li><strong>Telemetry & Scrubbing:</strong> Operational logs automatically scrub Personally Identifiable Information (PII) before central analysis to preserve privacy.</li>
                </ul>

                <h2 className="text-xl font-bold">3. ACCOUNT & CREDENTIAL RESPONSIBILITY</h2>
                <p>You are responsible for safeguarding your credentials (passwords, MFA tokens, API secret keys). The platform bears no liability for security incidents arising from client-side credential compromises.</p>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default LegalPage;
