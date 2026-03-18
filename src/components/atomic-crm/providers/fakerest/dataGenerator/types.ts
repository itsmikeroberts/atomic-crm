import type {
  Company,
  Contact,
  ContactNote,
  Deal,
  DealNote,
  Sale,
  Tag,
  Task,
  Venue,
  Song,
  QuoteTemplate,
  GigMember,
  SetList,
  SetListSong,
} from "../../../types";
import type { ConfigurationContextValue } from "../../../root/ConfigurationContext";

export interface Db {
  companies: Required<Company>[];
  contacts: Required<Contact>[];
  contact_notes: ContactNote[];
  deals: Deal[];
  deal_notes: DealNote[];
  sales: Sale[];
  tags: Tag[];
  tasks: Task[];
  venues: Venue[];
  songs: Song[];
  quote_templates: QuoteTemplate[];
  gig_members: GigMember[];
  set_lists: SetList[];
  set_list_songs: SetListSong[];
  gig_quotes: any[]; // Will be generated on demand
  configuration: Array<{ id: number; config: ConfigurationContextValue }>;
}
