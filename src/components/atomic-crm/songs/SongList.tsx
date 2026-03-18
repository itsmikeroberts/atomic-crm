import { useGetIdentity, useListContext } from "ra-core";
import { CreateButton } from "@/components/admin/create-button";
import { ExportButton } from "@/components/admin/export-button";
import { List } from "@/components/admin/list";
import { ListPagination } from "@/components/admin/list-pagination";
import { SortButton } from "@/components/admin/sort-button";

import { TopToolbar } from "../layout/TopToolbar";
import { SongEmpty } from "./SongEmpty";
import { SongListFilter } from "./SongListFilter";
import { GridList } from "./GridList";

export const SongList = () => {
  const { identity } = useGetIdentity();
  if (!identity) return null;

  return (
    <List
      title={false}
      perPage={25}
      sort={{ field: "title", order: "ASC" }}
      actions={<SongListActions />}
      pagination={<ListPagination rowsPerPageOptions={[10, 25, 50, 100]} />}
    >
      <SongListLayout />
    </List>
  );
};

const SongListLayout = () => {
  const { data, isPending, filterValues } = useListContext();
  const hasFilters = filterValues && Object.keys(filterValues).length > 0;

  if (isPending) return null;
  if (!data?.length && !hasFilters) return <SongEmpty />;

  return (
    <div className="w-full flex flex-row gap-8">
      <SongListFilter />
      <div className="flex flex-col flex-1 gap-4">
        <GridList />
      </div>
    </div>
  );
};

const SongListActions = () => {
  return (
    <TopToolbar>
      <SortButton fields={["title", "artist", "genre", "key"]} />
      <ExportButton />
      <CreateButton label="Add Song" />
    </TopToolbar>
  );
};
