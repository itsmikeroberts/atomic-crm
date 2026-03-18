import { useState, useEffect } from "react";
import { useDataProvider, useNotify, useRecordContext } from "ra-core";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SetListBuilder } from "./SetListBuilder";
import type { Gig, SetList } from "../types";

export const GigSetLists = () => {
  const record = useRecordContext<Gig>();
  const [setLists, setSetLists] = useState<SetList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dataProvider = useDataProvider();
  const notify = useNotify();

  const loadSetLists = async () => {
    if (!record?.id) return;

    try {
      setIsLoading(true);
      const { data } = await dataProvider.getList<SetList>("set_lists", {
        pagination: { page: 1, perPage: 100 },
        sort: { field: "position", order: "ASC" },
        filter: { gig_id: record.id },
      });

      // Load songs for each set list
      const setListsWithSongs = await Promise.all(
        data.map(async (setList) => {
          const { data: songs } = await dataProvider.getList(
            "set_list_songs",
            {
              pagination: { page: 1, perPage: 100 },
              sort: { field: "position", order: "ASC" },
              filter: { set_list_id: setList.id },
            }
          );
          return { ...setList, songs };
        })
      );

      setSetLists(setListsWithSongs);
    } catch (error) {
      notify("Error loading set lists", { type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSetLists();
  }, [record?.id]);

  const handleAddSetList = async () => {
    if (!record?.id) return;

    try {
      const newPosition = setLists.length;
      const setName = `Set ${newPosition + 1}`;

      const { data: newSetList } = await dataProvider.create<SetList>(
        "set_lists",
        {
          data: {
            gig_id: record.id,
            name: setName,
            position: newPosition,
          },
        }
      );

      setSetLists([...setLists, { ...newSetList, songs: [] }]);
      notify("Set list created", { type: "success" });
    } catch (error) {
      notify("Error creating set list", { type: "error" });
    }
  };

  if (!record) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Loading set lists...
      </div>
    );
  }

  if (setLists.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          No set lists created for this gig yet
        </p>
        <Button onClick={handleAddSetList}>
          <Plus className="h-4 w-4 mr-2" />
          Create First Set List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Set Lists</h3>
        <Button onClick={handleAddSetList} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Set
        </Button>
      </div>

      <Tabs defaultValue={setLists[0]?.id?.toString()} className="w-full">
        <TabsList className="w-full justify-start">
          {setLists.map((setList) => (
            <TabsTrigger key={setList.id} value={setList.id.toString()}>
              {setList.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {setLists.map((setList) => (
          <TabsContent key={setList.id} value={setList.id.toString()}>
            <SetListBuilder
              setList={setList}
              gigId={record.id}
              onUpdate={loadSetLists}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
