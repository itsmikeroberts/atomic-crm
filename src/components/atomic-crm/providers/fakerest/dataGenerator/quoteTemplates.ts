import type { QuoteTemplate } from "../../../types";
import type { Db } from "./types";
import { randomDate } from "./utils";

const defaultQuoteTemplate = `
<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #333;">Performance Quote</h1>
  
  <div style="margin: 20px 0;">
    <h2 style="color: #666;">Event Details</h2>
    <p><strong>Event:</strong> {{deal_name}}</p>
    <p><strong>Date:</strong> {{performance_date}}</p>
    <p><strong>Time:</strong> {{start_time}} - {{end_time}}</p>
    <p><strong>Venue:</strong> {{venue_name}}</p>
    <p><strong>Address:</strong> {{venue_address}}, {{venue_city}}, {{venue_postcode}}</p>
  </div>
  
  <div style="margin: 20px 0;">
    <h2 style="color: #666;">Performance Details</h2>
    <p><strong>Number of Sets:</strong> {{set_count}}</p>
    <p><strong>Band Members:</strong> {{band_member_count}}</p>
  </div>
  
  <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
    <h2 style="color: #666;">Pricing</h2>
    <p><strong>Performance Fee:</strong> £{{fee}}</p>
    {{#if deposit}}
    <p><strong>Deposit Required:</strong> £{{deposit}}</p>
    {{/if}}
    {{#if travel_expenses}}
    <p><strong>Travel Expenses:</strong> £{{travel_expenses}}</p>
    {{/if}}
  </div>
  
  <div style="margin: 20px 0;">
    <p style="font-size: 12px; color: #999;">
      This quote is valid for 30 days from the date of issue.
      A deposit of 50% is required to secure the booking.
    </p>
  </div>
</div>
`;

const weddingQuoteTemplate = `
<div style="font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #fafafa;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #8b7355; font-size: 32px; margin-bottom: 10px;">Wedding Performance Quote</h1>
    <p style="color: #666; font-style: italic;">Making your special day unforgettable</p>
  </div>
  
  <div style="background-color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
    <h2 style="color: #8b7355; border-bottom: 2px solid #8b7355; padding-bottom: 10px;">Event Details</h2>
    <table style="width: 100%; margin-top: 15px;">
      <tr><td style="padding: 5px;"><strong>Couple:</strong></td><td style="padding: 5px;">{{deal_name}}</td></tr>
      <tr><td style="padding: 5px;"><strong>Wedding Date:</strong></td><td style="padding: 5px;">{{performance_date}}</td></tr>
      <tr><td style="padding: 5px;"><strong>Performance Time:</strong></td><td style="padding: 5px;">{{start_time}} - {{end_time}}</td></tr>
      <tr><td style="padding: 5px;"><strong>Venue:</strong></td><td style="padding: 5px;">{{venue_name}}</td></tr>
      <tr><td style="padding: 5px;"><strong>Location:</strong></td><td style="padding: 5px;">{{venue_city}}</td></tr>
    </table>
  </div>
  
  <div style="background-color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
    <h2 style="color: #8b7355; border-bottom: 2px solid #8b7355; padding-bottom: 10px;">Package Includes</h2>
    <ul style="list-style-type: none; padding-left: 0;">
      <li style="padding: 8px 0; border-bottom: 1px solid #eee;">✓ {{set_count}} sets of live music</li>
      <li style="padding: 8px 0; border-bottom: 1px solid #eee;">✓ Professional sound system</li>
      <li style="padding: 8px 0; border-bottom: 1px solid #eee;">✓ Lighting equipment</li>
      <li style="padding: 8px 0; border-bottom: 1px solid #eee;">✓ Background music during breaks</li>
      <li style="padding: 8px 0;">✓ First dance song (if requested)</li>
    </ul>
  </div>
  
  <div style="background-color: #8b7355; color: white; padding: 20px; border-radius: 10px; text-align: center;">
    <h2 style="margin-top: 0;">Investment</h2>
    <p style="font-size: 36px; margin: 10px 0;"><strong>£{{fee}}</strong></p>
    {{#if deposit}}
    <p style="font-size: 14px;">Deposit: £{{deposit}} to secure your date</p>
    {{/if}}
  </div>
  
  <div style="margin-top: 20px; padding: 15px; background-color: #fff3e0; border-left: 4px solid #8b7355;">
    <p style="margin: 0; font-size: 12px; color: #666;">
      <strong>Terms:</strong> Quote valid for 14 days. 50% deposit required to confirm booking. 
      Balance due 7 days before the event. Cancellation policy applies.
    </p>
  </div>
</div>
`;

const corporateQuoteTemplate = `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #1a1a1a; color: white; padding: 30px; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 28px;">CORPORATE EVENT QUOTE</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.8;">Professional Entertainment Services</p>
  </div>
  
  <div style="margin-bottom: 30px;">
    <h2 style="color: #1a1a1a; font-size: 20px; border-bottom: 2px solid #1a1a1a; padding-bottom: 10px;">Event Information</h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px 0; width: 40%; color: #666;">Event Name</td>
        <td style="padding: 12px 0; font-weight: bold;">{{deal_name}}</td>
      </tr>
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px 0; color: #666;">Date</td>
        <td style="padding: 12px 0; font-weight: bold;">{{performance_date}}</td>
      </tr>
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px 0; color: #666;">Time</td>
        <td style="padding: 12px 0; font-weight: bold;">{{start_time}} - {{end_time}}</td>
      </tr>
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px 0; color: #666;">Venue</td>
        <td style="padding: 12px 0; font-weight: bold;">{{venue_name}}, {{venue_city}}</td>
      </tr>
      <tr>
        <td style="padding: 12px 0; color: #666;">Number of Sets</td>
        <td style="padding: 12px 0; font-weight: bold;">{{set_count}}</td>
      </tr>
    </table>
  </div>
  
  <div style="margin-bottom: 30px;">
    <h2 style="color: #1a1a1a; font-size: 20px; border-bottom: 2px solid #1a1a1a; padding-bottom: 10px;">Service Breakdown</h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
      <tr style="background-color: #f5f5f5;">
        <td style="padding: 12px; font-weight: bold;">Description</td>
        <td style="padding: 12px; font-weight: bold; text-align: right;">Amount</td>
      </tr>
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px;">Live Performance ({{set_count}} sets)</td>
        <td style="padding: 12px; text-align: right;">£{{fee}}</td>
      </tr>
      {{#if travel_expenses}}
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px;">Travel & Logistics</td>
        <td style="padding: 12px; text-align: right;">£{{travel_expenses}}</td>
      </tr>
      {{/if}}
      <tr style="background-color: #1a1a1a; color: white;">
        <td style="padding: 15px; font-weight: bold; font-size: 18px;">TOTAL</td>
        <td style="padding: 15px; font-weight: bold; font-size: 18px; text-align: right;">£{{fee}}</td>
      </tr>
    </table>
  </div>
  
  {{#if deposit}}
  <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
    <p style="margin: 0; font-size: 16px;"><strong>Deposit Required:</strong> £{{deposit}} (50% of total)</p>
    <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Balance due 14 days prior to event</p>
  </div>
  {{/if}}
  
  <div style="margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-left: 4px solid #1a1a1a;">
    <p style="margin: 0 0 10px 0; font-weight: bold;">Terms & Conditions</p>
    <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #666; line-height: 1.6;">
      <li>Quote valid for 30 days from date of issue</li>
      <li>50% deposit required to confirm booking</li>
      <li>Final payment due 14 days before event date</li>
      <li>Cancellation policy: Full refund if cancelled 60+ days before event</li>
      <li>Technical rider and stage plot available upon request</li>
    </ul>
  </div>
</div>
`;

export const generateQuoteTemplates = (db: Db): QuoteTemplate[] => {
  return [
    {
      id: 0,
      name: "Standard Quote",
      body_html: defaultQuoteTemplate,
      is_default: true,
      created_at: randomDate().toISOString(),
      updated_at: randomDate().toISOString(),
    },
    {
      id: 1,
      name: "Wedding Quote",
      body_html: weddingQuoteTemplate,
      is_default: false,
      created_at: randomDate().toISOString(),
      updated_at: randomDate().toISOString(),
    },
    {
      id: 2,
      name: "Corporate Event Quote",
      body_html: corporateQuoteTemplate,
      is_default: false,
      created_at: randomDate().toISOString(),
      updated_at: randomDate().toISOString(),
    },
  ];
};
