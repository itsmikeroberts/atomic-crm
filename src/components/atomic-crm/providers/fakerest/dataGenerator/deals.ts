import { add, format } from "date-fns";
import { datatype, lorem, random } from "faker/locale/en_US";

import {
  defaultDealCategories,
  defaultDealStages,
} from "../../../root/defaultConfiguration";
import type { Deal, Gig } from "../../../types";
import type { Db } from "./types";
import { randomDate } from "./utils";

export const generateDeals = (db: Db): Gig[] => {
  const deals = Array.from(Array(50).keys()).map((id) => {
    const company = random.arrayElement(db.companies);
    company.nb_deals++;
    const contacts = random.arrayElements(
      db.contacts.filter((contact) => contact.company_id === company.id),
      datatype.number({ min: 1, max: 3 }),
    );
    const lowercaseName = lorem.words();
    const created_at = randomDate(new Date(company.created_at)).toISOString();

    const expected_closing_date = randomDate(
      new Date(created_at),
      add(new Date(created_at), { months: 6 }),
    )
      .toISOString()
      .split("T")[0];

    // Gig-specific fields
    const venue = db.venues ? random.arrayElement(db.venues) : undefined;
    if (venue && venue.nb_deals !== undefined) {
      venue.nb_deals++;
    }
    
    const performance_date = randomDate(
      new Date(created_at),
      add(new Date(created_at), { months: 6 }),
    );
    
    const fee = datatype.number({ min: 300, max: 2000 });
    const deposit = Math.floor(fee * 0.5);
    
    const gig: Gig = {
      id,
      name: lowercaseName[0].toUpperCase() + lowercaseName.slice(1),
      company_id: company.id,
      contact_ids: contacts.map((contact) => contact.id),
      category: random.arrayElement(defaultDealCategories).value,
      stage: random.arrayElement(defaultDealStages).value,
      description: lorem.paragraphs(datatype.number({ min: 1, max: 4 })),
      amount: fee,
      created_at,
      updated_at: randomDate(new Date(created_at)).toISOString(),
      expected_closing_date,
      sales_id: company.sales_id || 0,
      index: 0,
      // Gig-specific fields
      venue_id: venue?.id,
      performance_date: format(performance_date, "yyyy-MM-dd"),
      start_time: random.arrayElement(["19:00", "20:00", "21:00", "18:30", "19:30"]),
      end_time: random.arrayElement(["23:00", "00:00", "01:00", "23:30", "00:30"]),
      set_count: datatype.number({ min: 1, max: 3 }),
      fee,
      deposit,
      deposit_paid: datatype.boolean(),
      travel_expenses: datatype.number({ min: 0, max: 100 }),
      quote_sent_at: datatype.boolean() ? randomDate(new Date(created_at)).toISOString() : undefined,
      invoice_sent_at: undefined,
    };
    
    return gig;
  });
  // compute index based on stage
  defaultDealStages.forEach((stage) => {
    deals
      .filter((deal) => deal.stage === stage.value)
      .forEach((deal, index) => {
        const dealIndex = deals.findIndex(d => d.id === deal.id);
        if (dealIndex !== -1) {
          deals[dealIndex].index = index;
        }
      });
  });
  return deals;
};
