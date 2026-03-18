import { useState } from "react";
import { useDataProvider, useNotify, useRecordContext, useRefresh } from "ra-core";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { QuotePreviewDialog } from "../quotes/QuotePreviewDialog";
import Handlebars from "handlebars";
import type { Gig, QuoteTemplate } from "../types";

export const GigQuoteButton = () => {
  const record = useRecordContext<Gig>();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateQuote = async () => {
    if (!record) return;

    setLoading(true);
    try {
      // Fetch the default quote template
      const { data: templates } = await dataProvider.getList<QuoteTemplate>(
        "quote_templates",
        {
          pagination: { page: 1, perPage: 1 },
          sort: { field: "is_default", order: "DESC" },
          filter: { is_default: true },
        }
      );

      if (!templates || templates.length === 0) {
        notify("No default quote template found", { type: "error" });
        setLoading(false);
        return;
      }

      const template = templates[0];

      // Fetch related data
      const [companyData, venueData, contactsData] = await Promise.all([
        record.company_id
          ? dataProvider.getOne("companies", { id: record.company_id })
          : Promise.resolve(null),
        record.venue_id
          ? dataProvider.getOne("venues", { id: record.venue_id })
          : Promise.resolve(null),
        record.contact_ids && record.contact_ids.length > 0
          ? dataProvider.getMany("contacts", { ids: record.contact_ids })
          : Promise.resolve(null),
      ]);

      // Prepare template variables
      const templateData = {
        gig_name: record.name || "",
        company_name: companyData?.data?.name || "",
        venue_name: venueData?.data?.name || "",
        venue_city: venueData?.data?.city || "",
        venue_address: venueData?.data?.address || "",
        performance_date: record.performance_date
          ? new Date(record.performance_date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "",
        start_time: record.start_time || "",
        end_time: record.end_time || "",
        fee: record.amount
          ? new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(record.amount)
          : "",
        deposit: record.deposit
          ? new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(record.deposit)
          : "",
        set_count: record.set_count || "",
        contact_name:
          contactsData?.data && contactsData.data.length > 0
            ? `${contactsData.data[0].first_name} ${contactsData.data[0].last_name}`
            : "",
      };

      // Compile and render template
      const compiledTemplate = Handlebars.compile(template.body_html);
      const renderedHtml = compiledTemplate(templateData);

      setHtmlContent(renderedHtml);
      setPreviewOpen(true);
    } catch (error) {
      console.error("Error generating quote:", error);
      notify("Error generating quote", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuote = async () => {
    if (!record) return;

    try {
      // Save quote to gig_quotes table
      await dataProvider.create("gig_quotes", {
        data: {
          gig_id: record.id,
          rendered_html: htmlContent,
          sent_at: new Date().toISOString(),
          version: 1,
        },
      });

      // Update gig stage to "Quoted" and set quote_sent_at
      await dataProvider.update("deals", {
        id: record.id,
        data: {
          stage: "Quoted",
          quote_sent_at: new Date().toISOString(),
        },
        previousData: record,
      });

      notify("Quote saved and sent successfully", { type: "success" });
      setPreviewOpen(false);
      refresh();
    } catch (error) {
      console.error("Error saving quote:", error);
      notify("Error saving quote", { type: "error" });
    }
  };

  if (!record) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleGenerateQuote}
        disabled={loading}
      >
        <FileText className="h-4 w-4 mr-2" />
        {loading ? "Generating..." : "Generate Quote"}
      </Button>
      <QuotePreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        htmlContent={htmlContent}
        onPrint={handleSaveQuote}
      />
    </>
  );
};
