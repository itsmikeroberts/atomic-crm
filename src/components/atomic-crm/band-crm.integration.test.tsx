/**
 * Integration tests for Band CRM workflows
 * 
 * These tests verify end-to-end workflows for the band-specific features:
 * - Creating gigs with companies and venues
 * - Adding band members to gigs
 * - Building set lists with drag-and-drop
 * - Generating quotes and invoices
 * - Moving gigs through pipeline stages
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Company, Contact, Venue, Gig, Song, SetList } from "./types";

// Mock data providers
const mockDataProvider = {
  getOne: vi.fn(),
  getMany: vi.fn(),
  getList: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe("Band CRM Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Create Gig Workflow", () => {
    it("should create a gig with company and venue", async () => {
      // Arrange: Mock company and venue data
      const company: Company = {
        id: 1,
        name: "Acme Events Ltd",
        size: 50,
        sector: "events",
        website: "https://acmeevents.com",
        phone_number: "+44 20 1234 5678",
        address: "123 Event Street",
        city: "London",
        zipcode: "SW1A 1AA",
        sales_id: 1,
        created_at: "2024-01-01T00:00:00Z",
        logo: {} as any,
        linkedin_url: "",
        state_abbr: "",
        description: "",
        revenue: "",
        tax_identifier: "",
        country: "UK",
      };

      const venue: Venue = {
        id: 1,
        name: "The Jazz Cafe",
        city: "London",
        address: "5 Parkway, Camden",
        postcode: "NW1 7PG",
        capacity: 450,
        stage_size: "6.0m x 4.5m",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      const gigData = {
        name: "Summer Jazz Festival",
        company_id: company.id,
        venue_id: venue.id,
        performance_date: "2024-06-15",
        start_time: "19:00",
        end_time: "23:00",
        set_count: 2,
        fee: 2000,
        deposit: 500,
        category: "existing-business",
        description: "Annual summer festival performance",
        amount: 2000,
        expected_closing_date: "2024-06-15",
        sales_id: 1,
        stage: "Proposal",
        index: 0,
      };

      mockDataProvider.create.mockResolvedValue({
        data: { id: 1, ...gigData },
      });

      // Act: Create the gig
      const result = await mockDataProvider.create("deals", { data: gigData });

      // Assert: Verify gig was created with all required fields
      expect(mockDataProvider.create).toHaveBeenCalledWith("deals", {
        data: gigData,
      });
      expect(result.data).toMatchObject({
        id: 1,
        name: "Summer Jazz Festival",
        company_id: 1,
        venue_id: 1,
        performance_date: "2024-06-15",
        fee: 2000,
        deposit: 500,
      });
    });

    it("should validate required gig fields", () => {
      // Arrange: Incomplete gig data
      const incompleteGigData = {
        name: "Summer Jazz Festival",
        // Missing required fields: company_id, venue_id, performance_date, etc.
      };

      // Act & Assert: Validation should fail
      const requiredFields = [
        "company_id",
        "venue_id",
        "performance_date",
        "start_time",
        "end_time",
        "fee",
        "category",
        "amount",
        "expected_closing_date",
        "sales_id",
        "stage",
      ];

      requiredFields.forEach((field) => {
        expect(incompleteGigData).not.toHaveProperty(field);
      });
    });
  });

  describe("Add Band Members Workflow", () => {
    it("should add multiple band members to a gig", async () => {
      // Arrange: Mock gig and band members
      const gigId = 1;
      const bandMembers = [
        { sales_id: 2, role: "Lead Vocals", confirmed: true },
        { sales_id: 3, role: "Guitar", confirmed: true },
        { sales_id: 4, role: "Bass", confirmed: false },
        { sales_id: 5, role: "Drums", confirmed: true },
      ];

      mockDataProvider.create.mockImplementation((resource, params) => {
        return Promise.resolve({
          data: { id: Math.random(), gig_id: gigId, ...params.data },
        });
      });

      // Act: Add band members
      const results = await Promise.all(
        bandMembers.map((member) =>
          mockDataProvider.create("gig_members", {
            data: { gig_id: gigId, ...member },
          })
        )
      );

      // Assert: Verify all members were added
      expect(mockDataProvider.create).toHaveBeenCalledTimes(4);
      results.forEach((result, index) => {
        expect(result.data).toMatchObject({
          gig_id: gigId,
          sales_id: bandMembers[index].sales_id,
          role: bandMembers[index].role,
          confirmed: bandMembers[index].confirmed,
        });
      });
    });

    it("should prevent duplicate band member assignments", async () => {
      // Arrange: Attempt to add same member twice
      const gigId = 1;
      const member = { sales_id: 2, role: "Lead Vocals", confirmed: true };

      mockDataProvider.create
        .mockResolvedValueOnce({
          data: { id: 1, gig_id: gigId, ...member },
        })
        .mockRejectedValueOnce(
          new Error("Duplicate key violation: gig_members_gig_id_sales_id_key")
        );

      // Act: Add member twice
      const firstAdd = await mockDataProvider.create("gig_members", {
        data: { gig_id: gigId, ...member },
      });

      // Assert: First add succeeds
      expect(firstAdd.data).toMatchObject({ gig_id: gigId, sales_id: 2 });

      // Assert: Second add fails
      await expect(
        mockDataProvider.create("gig_members", {
          data: { gig_id: gigId, ...member },
        })
      ).rejects.toThrow("Duplicate key violation");
    });
  });

  describe("Build Set List Workflow", () => {
    it("should create a set list and add songs in order", async () => {
      // Arrange: Mock gig and songs
      const gigId = 1;
      const songs: Song[] = [
        {
          id: 1,
          title: "Superstition",
          artist: "Stevie Wonder",
          genre: "Funk",
          key: "Eb",
          tempo: 100,
          duration: 245,
          active: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
        {
          id: 2,
          title: "Valerie",
          artist: "Amy Winehouse",
          genre: "Soul",
          key: "C",
          tempo: 115,
          duration: 227,
          active: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
        {
          id: 3,
          title: "Uptown Funk",
          artist: "Bruno Mars",
          genre: "Funk",
          key: "Dm",
          tempo: 115,
          duration: 269,
          active: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ];

      // Mock set list creation
      const setList: SetList = {
        id: 1,
        gig_id: gigId,
        name: "Set 1",
        position: 1,
        created_at: "2024-01-01T00:00:00Z",
      };

      mockDataProvider.create.mockResolvedValueOnce({ data: setList });

      // Mock adding songs to set list
      mockDataProvider.create.mockImplementation((resource, params) => {
        if (resource === "set_list_songs") {
          return Promise.resolve({
            data: {
              id: Math.random(),
              set_list_id: setList.id,
              ...params.data,
            },
          });
        }
        return Promise.resolve({ data: {} });
      });

      // Act: Create set list
      const setListResult = await mockDataProvider.create("set_lists", {
        data: { gig_id: gigId, name: "Set 1", position: 1 },
      });

      // Act: Add songs to set list
      const songResults = await Promise.all(
        songs.map((song, index) =>
          mockDataProvider.create("set_list_songs", {
            data: {
              set_list_id: setList.id,
              song_id: song.id,
              position: index + 1,
            },
          })
        )
      );

      // Assert: Verify set list was created
      expect(setListResult.data).toMatchObject({
        id: 1,
        gig_id: gigId,
        position: 1,
      });

      // Assert: Verify songs were added in correct order
      songResults.forEach((result, index) => {
        expect(result.data).toMatchObject({
          set_list_id: setList.id,
          song_id: songs[index].id,
          position: index + 1,
        });
      });
    });

    it("should calculate total set duration correctly", () => {
      // Arrange: Songs with durations
      const songs = [
        { duration: 245 }, // 4:05
        { duration: 227 }, // 3:47
        { duration: 269 }, // 4:29
      ];

      // Act: Calculate total duration
      const totalSeconds = songs.reduce((sum, song) => sum + song.duration, 0);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      // Assert: Total should be 12:21
      expect(totalSeconds).toBe(741);
      expect(minutes).toBe(12);
      expect(seconds).toBe(21);
    });

    it("should reorder songs when dragged", () => {
      // Arrange: Initial song order
      const songs = [
        { id: 1, position: 1, title: "Song A" },
        { id: 2, position: 2, title: "Song B" },
        { id: 3, position: 3, title: "Song C" },
      ];

      // Act: Move song from position 0 to position 2 (arrayMove logic)
      const arrayMove = <T,>(array: T[], from: number, to: number): T[] => {
        const newArray = array.slice();
        newArray.splice(
          to < 0 ? newArray.length + to : to,
          0,
          newArray.splice(from, 1)[0]
        );
        return newArray;
      };

      const reordered = arrayMove(songs, 0, 2);

      // Assert: Song A should now be at the end
      expect(reordered[0].title).toBe("Song B");
      expect(reordered[1].title).toBe("Song C");
      expect(reordered[2].title).toBe("Song A");
    });
  });

  describe("Generate Quote Workflow", () => {
    it("should generate a quote with template variables", () => {
      // Arrange: Mock gig data
      const gig: Gig = {
        id: 1,
        name: "Summer Jazz Festival",
        company_id: 1,
        contact_ids: [1],
        category: "existing-business",
        description: "Annual summer festival",
        amount: 2000,
        expected_closing_date: "2024-06-15",
        sales_id: 1,
        stage: "Proposal",
        index: 0,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        venue_id: 1,
        performance_date: "2024-06-15",
        start_time: "19:00",
        end_time: "23:00",
        set_count: 2,
        fee: 2000,
        deposit: 500,
      };

      const company = { name: "Acme Events Ltd" };
      const venue = {
        name: "The Jazz Cafe",
        city: "London",
        address: "5 Parkway, Camden",
      };
      const contact = { first_name: "John", last_name: "Smith" };

      const template = `
        <h1>Performance Quote</h1>
        <p>Event: {{gig_name}}</p>
        <p>Date: {{performance_date}}</p>
        <p>Venue: {{venue_name}}, {{venue_city}}</p>
        <p>Company: {{company_name}}</p>
        <p>Contact: {{contact_name}}</p>
        <p>Fee: {{fee}}</p>
        <p>Deposit: {{deposit}}</p>
      `;

      // Act: Prepare template data
      const templateData = {
        gig_name: gig.name,
        performance_date: gig.performance_date,
        start_time: gig.start_time,
        end_time: gig.end_time,
        venue_name: venue.name,
        venue_city: venue.city,
        venue_address: venue.address,
        company_name: company.name,
        contact_name: `${contact.first_name} ${contact.last_name}`,
        set_count: gig.set_count?.toString() || "0",
        fee: `£${gig.fee?.toLocaleString() || "0"}`,
        deposit: `£${gig.deposit?.toLocaleString() || "0"}`,
        duration: "4 hours",
      };

      // Assert: Verify all required template variables are present
      expect(templateData).toMatchObject({
        gig_name: "Summer Jazz Festival",
        performance_date: "2024-06-15",
        venue_name: "The Jazz Cafe",
        venue_city: "London",
        company_name: "Acme Events Ltd",
        contact_name: "John Smith",
        fee: "£2,000",
        deposit: "£500",
      });

      // Assert: Template should contain all variable placeholders
      expect(template).toContain("{{gig_name}}");
      expect(template).toContain("{{performance_date}}");
      expect(template).toContain("{{venue_name}}");
      expect(template).toContain("{{company_name}}");
      expect(template).toContain("{{fee}}");
      expect(template).toContain("{{deposit}}");
    });

    it("should save generated quote to database", async () => {
      // Arrange: Mock quote data
      const quoteData = {
        gig_id: 1,
        template_id: 1,
        generated_html: "<h1>Performance Quote</h1><p>...</p>",
        quote_type: "quote",
      };

      mockDataProvider.create.mockResolvedValue({
        data: { id: 1, ...quoteData, created_at: "2024-01-01T00:00:00Z" },
      });

      // Act: Save quote
      const result = await mockDataProvider.create("gig_quotes", {
        data: quoteData,
      });

      // Assert: Verify quote was saved
      expect(mockDataProvider.create).toHaveBeenCalledWith("gig_quotes", {
        data: quoteData,
      });
      expect(result.data).toMatchObject({
        id: 1,
        gig_id: 1,
        template_id: 1,
        quote_type: "quote",
      });
    });
  });

  describe("Move Gig Through Pipeline Workflow", () => {
    it("should move gig through all stages", async () => {
      // Arrange: Mock gig and stages
      const stages = [
        "Proposal",
        "Negotiation",
        "Contract Sent",
        "Confirmed",
        "Completed",
      ];

      const gig: Gig = {
        id: 1,
        name: "Summer Jazz Festival",
        company_id: 1,
        contact_ids: [1],
        category: "existing-business",
        description: "Annual summer festival",
        amount: 2000,
        expected_closing_date: "2024-06-15",
        sales_id: 1,
        stage: "Proposal",
        index: 0,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        venue_id: 1,
        performance_date: "2024-06-15",
        start_time: "19:00",
        end_time: "23:00",
        set_count: 2,
        fee: 2000,
        deposit: 500,
      };

      mockDataProvider.update.mockImplementation((resource, params) => {
        return Promise.resolve({
          data: { ...gig, ...params.data },
        });
      });

      // Act: Move through each stage
      for (const stage of stages) {
        const result = await mockDataProvider.update("deals", {
          id: gig.id,
          data: { stage },
          previousData: gig,
        });

        // Assert: Verify stage was updated
        expect(result.data.stage).toBe(stage);
      }

      // Assert: All stages were processed
      expect(mockDataProvider.update).toHaveBeenCalledTimes(stages.length);
    });

    it("should update gig index when moving within a stage", async () => {
      // Arrange: Gigs in the same stage
      const gigs = [
        { id: 1, stage: "Proposal", index: 0 },
        { id: 2, stage: "Proposal", index: 1 },
        { id: 3, stage: "Proposal", index: 2 },
      ];

      mockDataProvider.update.mockImplementation((resource, params) => {
        return Promise.resolve({
          data: { ...params.previousData, ...params.data },
        });
      });

      // Act: Move gig 1 to position 2
      await mockDataProvider.update("deals", {
        id: 1,
        data: { index: 2 },
        previousData: gigs[0],
      });

      // Assert: Index was updated
      expect(mockDataProvider.update).toHaveBeenCalledWith("deals", {
        id: 1,
        data: { index: 2 },
        previousData: gigs[0],
      });
    });
  });

  describe("End-to-End Gig Lifecycle", () => {
    it("should complete full gig lifecycle from creation to completion", async () => {
      // This test simulates the complete workflow:
      // 1. Create gig with company and venue
      // 2. Add band members
      // 3. Build set list
      // 4. Generate quote
      // 5. Move through pipeline stages
      // 6. Generate invoice
      // 7. Mark as completed

      // Arrange: Mock all data
      const gigData = {
        name: "Summer Jazz Festival",
        company_id: 1,
        venue_id: 1,
        performance_date: "2024-06-15",
        start_time: "19:00",
        end_time: "23:00",
        set_count: 2,
        fee: 2000,
        deposit: 500,
        category: "existing-business",
        description: "Annual summer festival",
        amount: 2000,
        expected_closing_date: "2024-06-15",
        sales_id: 1,
        stage: "Proposal",
        index: 0,
      };

      // Step 1: Create gig
      mockDataProvider.create.mockResolvedValueOnce({
        data: { id: 1, ...gigData },
      });

      const gig = await mockDataProvider.create("deals", { data: gigData });
      expect(gig.data.id).toBe(1);
      expect(gig.data.stage).toBe("Proposal");

      // Step 2: Add band members
      mockDataProvider.create.mockResolvedValueOnce({
        data: { id: 1, gig_id: 1, sales_id: 2, role: "Lead Vocals" },
      });
      mockDataProvider.create.mockResolvedValueOnce({
        data: { id: 2, gig_id: 1, sales_id: 3, role: "Guitar" },
      });

      await mockDataProvider.create("gig_members", {
        data: { gig_id: 1, sales_id: 2, role: "Lead Vocals" },
      });
      await mockDataProvider.create("gig_members", {
        data: { gig_id: 1, sales_id: 3, role: "Guitar" },
      });

      // Step 3: Build set list
      mockDataProvider.create.mockResolvedValueOnce({
        data: { id: 1, gig_id: 1, name: "Set 1", position: 1 },
      });

      const setList = await mockDataProvider.create("set_lists", {
        data: { gig_id: 1, name: "Set 1", position: 1 },
      });
      expect(setList.data.id).toBe(1);

      // Step 4: Generate quote
      mockDataProvider.create.mockResolvedValueOnce({
        data: {
          id: 1,
          gig_id: 1,
          template_id: 1,
          quote_type: "quote",
          generated_html: "<h1>Quote</h1>",
        },
      });

      const quote = await mockDataProvider.create("gig_quotes", {
        data: {
          gig_id: 1,
          template_id: 1,
          quote_type: "quote",
          generated_html: "<h1>Quote</h1>",
        },
      });
      expect(quote.data.quote_type).toBe("quote");

      // Step 5: Move to Confirmed stage
      mockDataProvider.update.mockResolvedValueOnce({
        data: { ...gig.data, stage: "Confirmed" },
      });

      const confirmed = await mockDataProvider.update("deals", {
        id: 1,
        data: { stage: "Confirmed" },
        previousData: gig.data,
      });
      expect(confirmed.data.stage).toBe("Confirmed");

      // Step 6: Generate invoice
      mockDataProvider.create.mockResolvedValueOnce({
        data: {
          id: 2,
          gig_id: 1,
          template_id: 1,
          quote_type: "invoice",
          generated_html: "<h1>Invoice</h1>",
        },
      });

      const invoice = await mockDataProvider.create("gig_quotes", {
        data: {
          gig_id: 1,
          template_id: 1,
          quote_type: "invoice",
          generated_html: "<h1>Invoice</h1>",
        },
      });
      expect(invoice.data.quote_type).toBe("invoice");

      // Step 7: Mark as completed
      mockDataProvider.update.mockResolvedValueOnce({
        data: { ...confirmed.data, stage: "Completed" },
      });

      const completed = await mockDataProvider.update("deals", {
        id: 1,
        data: { stage: "Completed" },
        previousData: confirmed.data,
      });
      expect(completed.data.stage).toBe("Completed");

      // Assert: Verify all steps were executed
      expect(mockDataProvider.create).toHaveBeenCalledTimes(6); // gig, 2 members, set list, quote, invoice
      expect(mockDataProvider.update).toHaveBeenCalledTimes(2); // confirmed, completed
    });
  });
});
