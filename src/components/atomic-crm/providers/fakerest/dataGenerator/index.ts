import { generateCompanies } from "./companies";
import { generateContactNotes } from "./contactNotes";
import { generateContacts } from "./contacts";
import { generateDealNotes } from "./dealNotes";
import { generateDeals } from "./deals";
import { finalize } from "./finalize";
import { generateSales } from "./sales";
import { generateTags } from "./tags";
import { generateTasks } from "./tasks";
import { generateVenues } from "./venues";
import { generateSongs } from "./songs";
import { generateQuoteTemplates } from "./quoteTemplates";
import type { Db } from "./types";

export default (): Db => {
  const db = {} as Db;
  db.sales = generateSales(db);
  db.tags = generateTags(db);
  db.companies = generateCompanies(db);
  db.venues = generateVenues(db);
  db.contacts = generateContacts(db);
  db.contact_notes = generateContactNotes(db);
  db.songs = generateSongs(db);
  db.deals = generateDeals(db);
  db.deal_notes = generateDealNotes(db);
  db.tasks = generateTasks(db);
  db.quote_templates = generateQuoteTemplates(db);
  db.gig_members = [];
  db.set_lists = [];
  db.set_list_songs = [];
  db.gig_quotes = [];
  db.configuration = [
    {
      id: 1,
      config: {} as Db["configuration"][number]["config"],
    },
  ];
  finalize(db);

  return db;
};
