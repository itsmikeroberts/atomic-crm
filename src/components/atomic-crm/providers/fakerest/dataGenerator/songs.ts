import { datatype, lorem, music, random } from "faker/locale/en_US";
import type { Song } from "../../../types";
import type { Db } from "./types";
import { randomDate } from "./utils";

const songData = [
  { title: "Sweet Child O' Mine", artist: "Guns N' Roses", genre: "Rock", key: "D", tempo: 125, duration: 356 },
  { title: "Billie Jean", artist: "Michael Jackson", genre: "Pop", key: "F#m", tempo: 117, duration: 294 },
  { title: "Superstition", artist: "Stevie Wonder", genre: "Funk", key: "Eb", tempo: 100, duration: 245 },
  { title: "Hotel California", artist: "Eagles", genre: "Rock", key: "Bm", tempo: 74, duration: 391 },
  { title: "Wonderwall", artist: "Oasis", genre: "Rock", key: "F#m", tempo: 87, duration: 258 },
  { title: "Don't Stop Believin'", artist: "Journey", genre: "Rock", key: "E", tempo: 119, duration: 251 },
  { title: "Uptown Funk", artist: "Bruno Mars", genre: "Funk", key: "Dm", tempo: 115, duration: 269 },
  { title: "Mr. Brightside", artist: "The Killers", genre: "Rock", key: "D", tempo: 148, duration: 222 },
  { title: "Valerie", artist: "Amy Winehouse", genre: "Soul", key: "Eb", tempo: 112, duration: 231 },
  { title: "I Wanna Dance with Somebody", artist: "Whitney Houston", genre: "Pop", key: "F", tempo: 119, duration: 291 },
  { title: "September", artist: "Earth, Wind & Fire", genre: "Funk", key: "Eb", tempo: 126, duration: 215 },
  { title: "Livin' on a Prayer", artist: "Bon Jovi", genre: "Rock", key: "Em", tempo: 123, duration: 249 },
  { title: "Crazy Little Thing Called Love", artist: "Queen", genre: "Rock", key: "D", tempo: 156, duration: 163 },
  { title: "I Will Survive", artist: "Gloria Gaynor", genre: "Disco", key: "Am", tempo: 117, duration: 198 },
  { title: "Shake It Off", artist: "Taylor Swift", genre: "Pop", key: "G", tempo: 160, duration: 219 },
  { title: "Dancing Queen", artist: "ABBA", genre: "Pop", key: "A", tempo: 101, duration: 230 },
  { title: "Bohemian Rhapsody", artist: "Queen", genre: "Rock", key: "Bb", tempo: 72, duration: 354 },
  { title: "Take On Me", artist: "a-ha", genre: "Pop", key: "A", tempo: 169, duration: 225 },
  { title: "Every Breath You Take", artist: "The Police", genre: "Rock", key: "Ab", tempo: 117, duration: 253 },
  { title: "Sweet Home Alabama", artist: "Lynyrd Skynyrd", genre: "Rock", key: "D", tempo: 100, duration: 284 },
  { title: "Fly Me to the Moon", artist: "Frank Sinatra", genre: "Jazz", key: "C", tempo: 140, duration: 148 },
  { title: "Summertime", artist: "George Gershwin", genre: "Jazz", key: "Am", tempo: 70, duration: 180 },
  { title: "Autumn Leaves", artist: "Joseph Kosma", genre: "Jazz", key: "Gm", tempo: 120, duration: 210 },
  { title: "All of Me", artist: "Gerald Marks", genre: "Jazz", key: "C", tempo: 110, duration: 195 },
  { title: "Blue Bossa", artist: "Kenny Dorham", genre: "Jazz", key: "Cm", tempo: 140, duration: 240 },
  { title: "Thinking Out Loud", artist: "Ed Sheeran", genre: "Pop", key: "D", tempo: 79, duration: 281 },
  { title: "Perfect", artist: "Ed Sheeran", genre: "Pop", key: "Ab", tempo: 95, duration: 263 },
  { title: "A Thousand Years", artist: "Christina Perri", genre: "Pop", key: "Bb", tempo: 46, duration: 285 },
  { title: "At Last", artist: "Etta James", genre: "Soul", key: "F", tempo: 50, duration: 180 },
  { title: "Can't Help Falling in Love", artist: "Elvis Presley", genre: "Pop", key: "C", tempo: 60, duration: 178 },
];

const genres = ["Rock", "Pop", "Jazz", "Funk", "Soul", "Blues", "Country", "Disco"];
const keys = ["C", "D", "E", "F", "G", "A", "B", "Cm", "Dm", "Em", "Fm", "Gm", "Am", "Bm"];

export const generateSongs = (db: Db, size = 50): Song[] => {
  const songs: Song[] = [];
  
  // Add the predefined songs
  songData.forEach((song, index) => {
    songs.push({
      id: index,
      title: song.title,
      artist: song.artist,
      key: song.key,
      tempo: song.tempo,
      duration: song.duration,
      genre: song.genre,
      notes: undefined,
      lyrics_url: datatype.boolean() ? `https://example.com/lyrics/${index}` : undefined,
      chart_url: datatype.boolean() ? `https://example.com/charts/${index}` : undefined,
      tags: random.arrayElements(["Wedding", "Party", "Corporate", "Festival"], datatype.number({ min: 0, max: 2 })),
      active: datatype.number(10) > 1, // 90% active
      created_at: randomDate().toISOString(),
      updated_at: randomDate().toISOString(),
    });
  });
  
  // Generate additional random songs if needed
  for (let i = songData.length; i < size; i++) {
    songs.push({
      id: i,
      title: `${lorem.words(datatype.number({ min: 1, max: 3 }))}`,
      artist: random.arrayElement(["Original", "Traditional", "Band Original"]),
      key: random.arrayElement(keys),
      tempo: datatype.number({ min: 60, max: 180 }),
      duration: datatype.number({ min: 120, max: 420 }),
      genre: random.arrayElement(genres),
      notes: datatype.boolean() ? lorem.sentence() : undefined,
      lyrics_url: datatype.boolean() ? `https://example.com/lyrics/${i}` : undefined,
      chart_url: datatype.boolean() ? `https://example.com/charts/${i}` : undefined,
      tags: random.arrayElements(["Wedding", "Party", "Corporate", "Festival"], datatype.number({ min: 0, max: 2 })),
      active: datatype.number(10) > 1, // 85% active
      created_at: randomDate().toISOString(),
      updated_at: randomDate().toISOString(),
    });
  }
  
  return songs;
};
