import { describe, it, expect } from "vitest";
import { renderTemplate, prepareTemplateData } from "./templateRenderer";
import type { Gig } from "../types";

describe("templateRenderer", () => {
  describe("renderTemplate", () => {
    it("should render a simple template with variables", () => {
      const template = "<h1>{{gig_name}}</h1><p>{{venue_name}}</p>";
      const data = {
        gig_name: "Summer Festival",
        company_name: "",
        venue_name: "The Jazz Cafe",
        venue_city: "",
        venue_address: "",
        performance_date: "",
        start_time: "",
        end_time: "",
        fee: "",
        deposit: "",
        set_count: "",
        contact_name: "",
      };

      const result = renderTemplate(template, data);

      expect(result).toBe("<h1>Summer Festival</h1><p>The Jazz Cafe</p>");
    });

    it("should handle missing variables gracefully", () => {
      const template = "<h1>{{gig_name}}</h1><p>{{missing_variable}}</p>";
      const data = {
        gig_name: "Summer Festival",
        company_name: "",
        venue_name: "",
        venue_city: "",
        venue_address: "",
        performance_date: "",
        start_time: "",
        end_time: "",
        fee: "",
        deposit: "",
        set_count: "",
        contact_name: "",
      };

      const result = renderTemplate(template, data);

      expect(result).toBe("<h1>Summer Festival</h1><p></p>");
    });

    it("should render complex templates with multiple variables", () => {
      const template = `
        <div>
          <h1>{{gig_name}}</h1>
          <p>Venue: {{venue_name}}, {{venue_city}}</p>
          <p>Date: {{performance_date}}</p>
          <p>Time: {{start_time}} - {{end_time}}</p>
          <p>Fee: {{fee}}</p>
        </div>
      `;
      const data = {
        gig_name: "Summer Festival",
        company_name: "ABC Events",
        venue_name: "The Jazz Cafe",
        venue_city: "London",
        venue_address: "123 Main St",
        performance_date: "Saturday, June 15, 2024",
        start_time: "19:00",
        end_time: "23:00",
        fee: "$2,000.00",
        deposit: "$500.00",
        set_count: "2",
        contact_name: "John Doe",
      };

      const result = renderTemplate(template, data);

      expect(result).toContain("Summer Festival");
      expect(result).toContain("The Jazz Cafe, London");
      expect(result).toContain("Saturday, June 15, 2024");
      expect(result).toContain("19:00 - 23:00");
      expect(result).toContain("$2,000.00");
    });

  });

  describe("prepareTemplateData", () => {
    it("should prepare template data from gig record", () => {
      const gig: Gig = {
        id: 1,
        name: "Summer Festival",
        company_id: 1,
        venue_id: 1,
        performance_date: "2024-06-15",
        start_time: "19:00",
        end_time: "23:00",
        amount: 2000,
        deposit: 500,
        set_count: 2,
        contact_ids: [1],
        sales_id: 1,
        stage: "Proposal",
        category: "existing-business",
        description: "",
        expected_closing_date: "2024-06-15",
        index: 0,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      const company = { name: "ABC Events" };
      const venue = {
        name: "The Jazz Cafe",
        city: "London",
        address: "123 Main St",
      };
      const contacts = [{ first_name: "John", last_name: "Doe" }];

      const result = prepareTemplateData(gig, company, venue, contacts);

      expect(result.gig_name).toBe("Summer Festival");
      expect(result.company_name).toBe("ABC Events");
      expect(result.venue_name).toBe("The Jazz Cafe");
      expect(result.venue_city).toBe("London");
      expect(result.venue_address).toBe("123 Main St");
      expect(result.performance_date).toBe("Saturday, June 15, 2024");
      expect(result.start_time).toBe("19:00");
      expect(result.end_time).toBe("23:00");
      expect(result.fee).toBe("$2,000.00");
      expect(result.deposit).toBe("$500.00");
      expect(result.set_count).toBe(2);
      expect(result.contact_name).toBe("John Doe");
    });

    it("should handle missing optional data", () => {
      const gig: Gig = {
        id: 1,
        name: "Summer Festival",
        company_id: 1,
        contact_ids: [],
        category: "existing-business",
        description: "",
        amount: 0,
        expected_closing_date: "2024-01-01",
        sales_id: 1,
        stage: "Proposal",
        index: 0,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      const result = prepareTemplateData(gig, null, null, null);

      expect(result.gig_name).toBe("Summer Festival");
      expect(result.company_name).toBe("");
      expect(result.venue_name).toBe("");
      expect(result.venue_city).toBe("");
      expect(result.venue_address).toBe("");
      expect(result.performance_date).toBe("");
      expect(result.start_time).toBe("");
      expect(result.end_time).toBe("");
      expect(result.fee).toBe("");
      expect(result.deposit).toBe("");
      expect(result.set_count).toBe("");
      expect(result.contact_name).toBe("");
    });

    it("should format currency correctly", () => {
      const gig: Gig = {
        id: 1,
        name: "Test Gig",
        company_id: 1,
        contact_ids: [],
        category: "existing-business",
        description: "",
        amount: 1234.56,
        deposit: 123.45,
        expected_closing_date: "2024-01-01",
        sales_id: 1,
        stage: "Proposal",
        index: 0,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      const result = prepareTemplateData(gig);

      expect(result.fee).toBe("$1,234.56");
      expect(result.deposit).toBe("$123.45");
    });

    it("should format date correctly", () => {
      const gig: Gig = {
        id: 1,
        name: "Test Gig",
        company_id: 1,
        contact_ids: [],
        category: "existing-business",
        description: "",
        amount: 0,
        performance_date: "2024-12-25",
        expected_closing_date: "2024-12-25",
        sales_id: 1,
        stage: "Proposal",
        index: 0,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      const result = prepareTemplateData(gig);

      expect(result.performance_date).toBe("Wednesday, December 25, 2024");
    });

    it("should handle multiple contacts and use the first one", () => {
      const gig: Gig = {
        id: 1,
        name: "Test Gig",
        company_id: 1,
        contact_ids: [1, 2, 3],
        category: "existing-business",
        description: "",
        amount: 0,
        expected_closing_date: "2024-01-01",
        sales_id: 1,
        stage: "Proposal",
        index: 0,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      const contacts = [
        { first_name: "John", last_name: "Doe" },
        { first_name: "Jane", last_name: "Smith" },
        { first_name: "Bob", last_name: "Johnson" },
      ];

      const result = prepareTemplateData(gig, null, null, contacts);

      expect(result.contact_name).toBe("John Doe");
    });
  });
});
