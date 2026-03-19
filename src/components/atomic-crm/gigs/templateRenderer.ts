import Handlebars from "handlebars";
import type { Gig } from "../types";

export interface TemplateData {
  gig_name: string;
  company_name: string;
  venue_name: string;
  venue_city: string;
  venue_address: string;
  performance_date: string;
  start_time: string;
  end_time: string;
  fee: string;
  deposit: string;
  set_count: string | number;
  contact_name: string;
}

/**
 * Renders a Handlebars template with the provided data
 * @param templateHtml - The Handlebars template string
 * @param data - The data to render the template with
 * @returns The rendered HTML string
 */
export const renderTemplate = (
  templateHtml: string,
  data: TemplateData
): string => {
  const compiledTemplate = Handlebars.compile(templateHtml);
  return compiledTemplate(data);
};

/**
 * Prepares template data from a gig record and related entities
 * @param gig - The gig record
 * @param company - The company data (optional)
 * @param venue - The venue data (optional)
 * @param contacts - The contacts data (optional)
 * @returns Template data object
 */
export const prepareTemplateData = (
  gig: Gig,
  company?: { name: string } | null,
  venue?: { name: string; city: string; address: string } | null,
  contacts?: Array<{ first_name: string; last_name: string }> | null
): TemplateData => {
  return {
    gig_name: gig.name || "",
    company_name: company?.name || "",
    venue_name: venue?.name || "",
    venue_city: venue?.city || "",
    venue_address: venue?.address || "",
    performance_date: gig.performance_date
      ? new Date(gig.performance_date).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "",
    start_time: gig.start_time || "",
    end_time: gig.end_time || "",
    fee: gig.amount
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(gig.amount)
      : "",
    deposit: gig.deposit
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(gig.deposit)
      : "",
    set_count: gig.set_count || "",
    contact_name:
      contacts && contacts.length > 0
        ? `${contacts[0].first_name} ${contacts[0].last_name}`
        : "",
  };
};
