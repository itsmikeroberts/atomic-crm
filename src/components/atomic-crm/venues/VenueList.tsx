import { RecordContextProvider, useGetIdentity, useListContext } from "ra-core";
import { CreateButton } from "@/components/admin/create-button";
import { ExportButton } from "@/components/admin/export-button";
import { List } from "@/components/admin/list";
import { ListPagination } from "@/components/admin/list-pagination";
import { SortButton } from "@/components/admin/sort-button";

import { TopToolbar } from "../layout/TopToolbar";
import { VenueEmpty } from "./VenueEmpty";
import { VenueListFilter } from "./VenueListFilter";
import { VenueCard } from "./VenueCard";
import type { Venue } from "../types";

export const VenueList = () => {
  const { identity } = useGetIdentity();
  if (!identity) return null;

  return (
    <List
      title={false}
      perPage={25}
      sort={{ field: "name", order: "ASC" }}
      actions={<VenueListActions />}
      pagination={<ListPagination rowsPerPageOptions={[10, 25, 50, 100]} />}
    >
      <VenueListLayout />
    </List>
  );
};

const VenueListLayout = () => {
  const { data, isPending, filterValues } = useListContext();
  const hasFilters = filterValues && Object.keys(filterValues).length > 0;

  if (isPending) return null;
  if (!data?.length && !hasFilters) return <VenueEmpty />;

  return (
    <div className="w-full flex flex-row gap-8">
      <VenueListFilter />
      <div className="flex flex-col flex-1 gap-4">
        <VenueGrid />
      </div>
    </div>
  );
};

const VenueGrid = () => {
  const { data, isPending } = useListContext<Venue>();

  if (isPending) return null;

  return (
    <div
      className="w-full gap-2 grid"
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      }}
    >
      {data?.map((record) => (
        <RecordContextProvider key={record.id} value={record}>
          <VenueCard />
        </RecordContextProvider>
      ))}

      {data?.length === 0 && <div className="p-2">No venues found</div>}
    </div>
  );
};

const VenueListActions = () => {
  return (
    <TopToolbar>
      <SortButton fields={["name", "city", "capacity", "created_at"]} />
      <ExportButton />
      <CreateButton label="New Venue" />
    </TopToolbar>
  );
};
