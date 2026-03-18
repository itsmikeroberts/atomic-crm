import { Music, Tag } from "lucide-react";
import { FilterLiveForm } from "ra-core";
import { ToggleFilterButton } from "@/components/admin/toggle-filter-button";
import { SearchInput } from "@/components/admin/search-input";

import { FilterCategory } from "../filters/FilterCategory";

const genres = [
  "Rock",
  "Pop",
  "Jazz",
  "Blues",
  "Country",
  "Folk",
  "R&B",
  "Soul",
  "Funk",
  "Disco",
];

const keys = ["C", "D", "E", "F", "G", "A", "B"];

export const SongListFilter = () => {
  return (
    <div className="w-52 min-w-52 flex flex-col gap-8">
      <FilterLiveForm>
        <SearchInput source="q" />
      </FilterLiveForm>

      <FilterCategory icon={<Music className="h-4 w-4" />} label="Genre">
        {genres.map((genre) => (
          <ToggleFilterButton
            className="w-full justify-between"
            key={genre}
            value={{ "genre@eq": genre }}
            label={genre}
          />
        ))}
      </FilterCategory>

      <FilterCategory icon={<Music className="h-4 w-4" />} label="Key">
        {keys.map((key) => (
          <ToggleFilterButton
            className="w-full justify-between"
            key={key}
            value={{ "key@eq": key }}
            label={key}
          />
        ))}
      </FilterCategory>

      <FilterCategory icon={<Tag className="h-4 w-4" />} label="Status">
        <ToggleFilterButton
          className="w-full justify-between"
          value={{ "active@eq": true }}
          label="Active"
        />
        <ToggleFilterButton
          className="w-full justify-between"
          value={{ "active@eq": false }}
          label="Inactive"
        />
      </FilterCategory>
    </div>
  );
};
