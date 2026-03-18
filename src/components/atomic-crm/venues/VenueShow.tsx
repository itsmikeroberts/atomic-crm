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
import { VenueAside } from "./VenueAside";
import type { Venue, Gig } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

export const VenueShow = () => {
  const isMobile = useIsMobile();
  return (
    <ShowBase>
      <div className="flex flex-col sm:flex-row gap-4">
        {isMobile ? <VenueShowContentMobile /> : <VenueShowContent />}
        {!isMobile && <VenueAside link="show" />}
      </div>
    </ShowBase>
  );
};

const VenueShowContentMobile = () => {
  const { record, isPending } = useShowContext<Venue>();
  if (isPending || !record) return null;

  return (
    <>
      <MobileHeader>
        <h1 className="text-xl font-semibold">{record.name}</h1>
      </MobileHeader>
      <MobileContent>
        <VenueShowContent />
      </MobileContent>
    </>
  );
};

const VenueShowContent = () => {
  const { record, isPending } = useShowContext<Venue>();
  const [currentTab, setCurrentTab] = useState("gigs");

  if (isPending || !record) return null;

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
  };

  return (
    <div className="flex-1">
      <Card>
        <CardContent>
          <div className="flex flex-col gap-4 pt-6">
            <h1 className="text-2xl font-bold">{record.name}</h1>
            <Tabs defaultValue={currentTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="gigs">
                  Gigs
                  {record.nb_deals ? ` (${record.nb_deals})` : ""}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="gigs">
                {record.nb_deals ? (
                  <ReferenceManyField
                    reference="deals"
                    target="venue_id"
                    sort={{ field: "performance_date", order: "DESC" }}
                  >
                    <GigsIterator />
                  </ReferenceManyField>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No gigs scheduled at this venue yet</p>
                    <CreateRelatedGigButton />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const GigsIterator = () => {
  const { record } = useShowContext<Venue>();
  const { data: gigs, isPending } = useGetManyReference<Gig>(
    "deals",
    {
      target: "venue_id",
      id: record?.id,
      pagination: { page: 1, perPage: 100 },
      sort: { field: "performance_date", order: "DESC" },
    },
    { enabled: !!record?.id },
  );

  if (isPending) return null;
  if (!gigs || gigs.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {gigs.map((gig) => (
        <RecordContextProvider key={gig.id} value={gig}>
          <div className="p-0 text-sm">
            <RouterLink
              to={`/deals/${gig.id}/show`}
              className="flex flex-col gap-1 p-4 rounded-md hover:bg-accent transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  <TextField source="name" />
                </span>
                {gig.performance_date && (
                  <span className="text-muted-foreground text-xs">
                    {new Date(gig.performance_date).toLocaleDateString()}
                  </span>
                )}
              </div>
              {gig.company_name && (
                <span className="text-muted-foreground text-xs">
                  {gig.company_name}
                </span>
              )}
              {gig.stage && (
                <span className="text-xs text-muted-foreground">
                  Stage: {gig.stage}
                </span>
              )}
            </RouterLink>
            <Separator />
          </div>
        </RecordContextProvider>
      ))}
    </div>
  );
};

const CreateRelatedGigButton = () => {
  const { record } = useShowContext<Venue>();
  return (
    <Button variant="outline" asChild size="sm" className="h-9 mt-4">
      <RouterLink
        to="/deals/create"
        state={{ record: { venue_id: record?.id } }}
      >
        Add Gig
      </RouterLink>
    </Button>
  );
};
