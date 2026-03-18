import { useState } from "react";
import { useDataProvider, useNotify, useRecordContext, useRefresh } from "ra-core";
import { Button } from "@/components/ui/button";
import { Receipt } from "lucide-react";
import { InvoicePreviewDialog } from "../quotes/InvoicePreviewDialog";
import type { Gig } from "../types";

export const GigInvoiceButton = () => {
  const record = useRecordContext<Gig>();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateInvoice = async () => {
    if (!record) return;

    setLoading(true);
    try {
      // Fetch related data
      const [companyData, venueData] = await Promise.all([
        record.company_id
          ? dataProvider.getOne("companies", { id: record.company_id })
          : Promise.resolve(null),
        record.venue_id
          ? dataProvider.getOne("venues", { id: record.venue_id })
          : Promise.resolve(null),
      ]);

      const company = companyData?.data;
      const venue = venueData?.data;

      // Calculate amounts
      const fee = record.amount || 0;
      const deposit = record.deposit || 0;
      const balance = fee - deposit;

      // Generate invoice HTML
      const invoiceHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .invoice-title {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .invoice-number {
              font-size: 14px;
              color: #666;
            }
            .section {
              margin-bottom: 30px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #333;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .info-label {
              font-weight: bold;
              color: #666;
            }
            .info-value {
              color: #333;
            }
            .totals {
              margin-top: 30px;
              border-top: 2px solid #333;
              padding-top: 20px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 16px;
            }
            .total-row.balance {
              font-size: 20px;
              font-weight: bold;
              color: #000;
              border-top: 2px solid #333;
              margin-top: 10px;
              padding-top: 15px;
            }
            .payment-terms {
              margin-top: 30px;
              padding: 15px;
              background-color: #f5f5f5;
              border-radius: 5px;
            }
            .payment-terms-title {
              font-weight: bold;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-number">Invoice #${record.id}</div>
          </div>

          <div class="section">
            <div class="section-title">Bill To</div>
            <div class="info-row">
              <span class="info-label">Company:</span>
              <span class="info-value">${company?.name || "N/A"}</span>
            </div>
            ${
              company?.address
                ? `
            <div class="info-row">
              <span class="info-label">Address:</span>
              <span class="info-value">${company.address}</span>
            </div>
            `
                : ""
            }
          </div>

          <div class="section">
            <div class="section-title">Performance Details</div>
            <div class="info-row">
              <span class="info-label">Event:</span>
              <span class="info-value">${record.name || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Venue:</span>
              <span class="info-value">${venue?.name || "N/A"}</span>
            </div>
            ${
              venue?.address
                ? `
            <div class="info-row">
              <span class="info-label">Location:</span>
              <span class="info-value">${venue.address}${venue.city ? `, ${venue.city}` : ""}</span>
            </div>
            `
                : ""
            }
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span class="info-value">${
                record.performance_date
                  ? new Date(record.performance_date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"
              }</span>
            </div>
            ${
              record.start_time
                ? `
            <div class="info-row">
              <span class="info-label">Time:</span>
              <span class="info-value">${record.start_time}${record.end_time ? ` - ${record.end_time}` : ""}</span>
            </div>
            `
                : ""
            }
          </div>

          <div class="totals">
            <div class="total-row">
              <span>Performance Fee:</span>
              <span>${new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(fee)}</span>
            </div>
            ${
              deposit > 0
                ? `
            <div class="total-row">
              <span>Deposit Paid:</span>
              <span>-${new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(deposit)}</span>
            </div>
            `
                : ""
            }
            <div class="total-row balance">
              <span>Balance Due:</span>
              <span>${new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(balance)}</span>
            </div>
          </div>

          <div class="payment-terms">
            <div class="payment-terms-title">Payment Terms</div>
            <p>Payment is due upon receipt of this invoice. Please make checks payable to [Your Band Name] or contact us for electronic payment options.</p>
            <p>Thank you for your business!</p>
          </div>
        </body>
        </html>
      `;

      setHtmlContent(invoiceHtml);
      setPreviewOpen(true);
    } catch (error) {
      console.error("Error generating invoice:", error);
      notify("Error generating invoice", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsSent = async () => {
    if (!record) return;

    try {
      // Update gig with invoice_sent_at timestamp
      await dataProvider.update("deals", {
        id: record.id,
        data: {
          invoice_sent_at: new Date().toISOString(),
        },
        previousData: record,
      });

      notify("Invoice marked as sent", { type: "success" });
      setPreviewOpen(false);
      refresh();
    } catch (error) {
      console.error("Error marking invoice as sent:", error);
      notify("Error marking invoice as sent", { type: "error" });
    }
  };

  if (!record) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleGenerateInvoice}
        disabled={loading}
      >
        <Receipt className="h-4 w-4 mr-2" />
        {loading ? "Generating..." : "Generate Invoice"}
      </Button>
      <InvoicePreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        htmlContent={htmlContent}
        onPrint={handleMarkAsSent}
      />
    </>
  );
};
