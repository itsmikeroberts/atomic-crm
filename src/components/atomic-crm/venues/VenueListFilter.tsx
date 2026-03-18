import { Building2, MapPin } from "lucide-react";
import { FilterLiveForm } from "ra-core";
import { ToggleFilterButton } from "@/components/admin/toggle-filter-button";
import { SearchInput } from "@/components/admin/search-input";

import { FilterCategory } from "../filters/FilterCategory";

// Common UK cities for filtering
const cities = [
  "London",
  "Manchester",
  "Birmingham",
  "Liverpool",
  "Leeds",
  "Bristol",
  "Glasgow",
  "Edinburgh",
];

export const VenueListFilter = () => {
  return (
    <div className="w-52 min-w-52 flex flex-col gap-8">
      <FilterLiveForm>
        <SearchInput source="q" />
      </FilterLiveForm>

      <FilterCategory icon={<MapPin className="h-4 w-4" />} label="City">
        {cities.map((city) => (
          <ToggleFilterButton
            className="w-full justify-between"
            label={city}
            key={city}
            value={{ city }}
          />
        ))}
      </FilterCategory>

      <FilterCategory icon={<Building2 className="h-4 w-4" />} label="Capacity">
        <ToggleFilterButton
          className="w-full justify-between"
          label="Small (< 100)"
          value={{ "capacity@lt": 100 }}
        />
        <ToggleFilterButton
          className="w-full justify-between"
          label="Medium (100-300)"
          value={{ "capacity@gte": 100, "capacity@lte": 300 }}
        />
        <ToggleFilterButton
          className="w-full justify-between"
          label="Large (> 300)"
          value={{ "capacity@gt": 300 }}
        />
      </FilterCategory>
    </div>
  );
};
