import { useRecordContext, useGetManyReference, ShowBase, useShowContext } from "ra-core";
import { Link as RouterLink } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TextField } from "@/components/admin/text-field";
import { ReferenceManyField } from "@/components/admin/reference-many-field";
import { RecordContextProvider } from "ra-core";
import { MobileContent } from "../layout/MobileContent";
import MobileHeader from "../layout/MobileHeader";
import { SongAside } from "./SongAside";
import type { Song, SetList } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

export const SongShow = () => {
  const isMobile = useIsMobile();
  return (
    <ShowBase>
      <div className="flex flex-col sm:flex-row gap-4">
        {isMobile ? <SongShowContentMobile /> : <SongShowContent />}
        {!isMobile && <SongAside link="show" />}
      </div>
    </ShowBase>
  );
};

const SongShowContentMobile = () => {
  const { record, isPending } = useShowContext<Song>();
  if (isPending || !record) return null;

  return (
    <>
      <MobileHeader>
        <h1 className="text-xl font-semibold">{record.title}</h1>
      </MobileHeader>
      <MobileContent>
        <SongShowContent />
      </MobileContent>
    </>
  );
};

const SongShowContent = () => {
  const { record, isPending } = useShowContext<Song>();
  const [currentTab, setCurrentTab] = useState("setlists");

  if (isPending || !record) return null;

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
  };

  return (
    <div className="flex-1">
      <Card>
        <CardContent>
          <div className="flex flex-col gap-4 pt-6">
            <div>
              <h1 className="text-2xl font-bold">{record.title}</h1>
              {record.artist && (
                <p className="text-muted-foreground">{record.artist}</p>
              )}
            </div>
            <Tabs defaultValue={currentTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="setlists">Set Lists</TabsTrigger>
              </TabsList>

              <TabsContent value="setlists">
                <div className="text-center py-8 text-muted-foreground">
                  <p>Set list integration coming in Phase 6</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
