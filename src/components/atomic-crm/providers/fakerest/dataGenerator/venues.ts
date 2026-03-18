import { address, company, datatype, internet, lorem, phone, random } from "faker/locale/en_US";
import type { Venue } from "../../../types";
import type { Db } from "./types";
import { randomDate } from "./utils";

const ukCities = [
  "London",
  "Manchester",
  "Birmingham",
  "Liverpool",
  "Leeds",
  "Bristol",
  "Newcastle",
  "Sheffield",
  "Glasgow",
  "Edinburgh",
];

const venueNames = [
  "The Cavern Club",
  "The Jazz Cafe",
  "The Roundhouse",
  "The Garage",
  "The Forum",
  "The Ritz",
  "The Academy",
  "The Apollo",
  "The Barrowland",
  "King Tut's Wah Wah Hut",
  "The Brudenell Social Club",
  "The Deaf Institute",
  "The Leadmill",
  "The Wedgewood Rooms",
  "The Fleece",
  "Thekla",
  "The Bodega",
  "The Joiners",
  "The Lexington",
  "The Social",
];

const stageSizes = [
  "15ft x 10ft",
  "20ft x 15ft",
  "25ft x 20ft",
  "30ft x 20ft",
  "40ft x 25ft",
];

export const generateVenues = (db: Db, size = 20): Venue[] => {
  return Array.from(Array(size).keys()).map((id) => {
    const city = random.arrayElement(ukCities);
    const capacity = datatype.number({ min: 50, max: 500 });
    
    return {
      id,
      name: random.arrayElement(venueNames),
      address: address.streetAddress(),
      city,
      postcode: `${random.alphaNumeric(2).toUpperCase()}${datatype.number({ min: 1, max: 9 })} ${datatype.number({ min: 1, max: 9 })}${random.alphaNumeric(2).toUpperCase()}`,
      country: "UK",
      capacity,
      stage_size: random.arrayElement(stageSizes),
      parking_info: random.arrayElement([
        "Street parking available",
        "Car park at rear",
        "No parking - use public transport",
        "Loading bay access via side entrance",
        "Limited parking - arrive early",
      ]),
      load_in_notes: random.arrayElement([
        "Loading bay at rear, stairs to stage",
        "Ground level access, wide doors",
        "Lift available for equipment",
        "Narrow stairs - plan accordingly",
        "Load in from 2pm, soundcheck at 6pm",
      ]),
      contact_name: `${random.arrayElement(["John", "Sarah", "Mike", "Emma", "Dave", "Lisa"])} ${random.arrayElement(["Smith", "Jones", "Brown", "Wilson", "Taylor"])}`,
      contact_phone: phone.phoneNumber("07### ######"),
      contact_email: internet.email(),
      website: internet.url(),
      notes: datatype.boolean() ? lorem.sentence() : undefined,
      created_at: randomDate().toISOString(),
      updated_at: randomDate().toISOString(),
      nb_deals: 0,
    };
  });
};
