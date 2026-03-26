import { format, isValid } from "date-fns";
import {
  InfiniteListBase,
  RecordContextProvider,
  useListContext,
  useTimeout,
} from "ra-core";
import { Link } from "react-router";
import { ReferenceField } from "@/components/admin/reference-field";
import { TextField } from "@/components/admin/text-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, RotateCcw } from "lucide-react";

import { InfinitePagination } from "../misc/InfinitePagination";
import { MobileContent } from "../layout/MobileContent";
import MobileHeader from "../layout/MobileHeader";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Gig } from "../types";
import { findDealLabel } from "./deal";

export const GigListMobile = () => {
  return (
    <InfiniteListBase
      resource="deals"
      perPage={20}
      filter={{ "archived_at@is": null }}
      sort={{ field: "performance_date", order: "ASC" }}
      queryOptions={{
        onError: () => {
          /* Disable error notification as GigListLayoutMobile handles it */
        },
      }}
    >
      <GigListLayoutMobile />
    </InfiniteListBase>
  );
};

const GigListLayoutMobile = () => {
  const { isPending, data, error } = useListContext();

  return (
    <div>
      <MobileHeader>
        <h1 className="text-xl font-semibold">Gigs</h1>
      </MobileHeader>
      <MobileContent>
        <GigListContentMobile />
        {!error && !isPending && data && data.length > 0 && (
          <div className="flex justify-center mt-4">
            <InfinitePagination />
          </div>
        )}
      </MobileContent>
    </div>
  );
};

const GigListContentMobile = () => {
  const {
    data: gigs,
    error,
    isPending,
    refetch,
  } = useListContext<Gig>();
  const oneSecondHasPassed = useTimeout(1000);

  if (isPending) {
    if (!oneSecondHasPassed) {
      return null;
    }
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <Skeleton className="w-32 h-6 mb-2" />
              <Skeleton className="w-full h-5 mb-2" />
              <Skeleton className="w-48 h-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error && !gigs) {
    return (
      <div className="p-4">
        <div className="text-center text-muted-foreground mb-4">
          Error loading gigs
        </div>
        <div className="text-center mt-2">
          <Button
            onClick={() => {
              refetch();
            }}
          >
            <RotateCcw />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!gigs || gigs.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center text-muted-foreground">No gigs found</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {gigs.map((gig) => (
        <RecordContextProvider key={gig.id} value={gig}>
          <GigCardMobile gig={gig} />
        </RecordContextProvider>
      ))}
    </div>
  );
};

const GigCardMobile = ({ gig }: { gig: Gig }) => {
  const { dealStages } = useConfigurationContext();

  // Format performance date
  const performanceDate = gig.performance_date
    ? isValid(new Date(gig.performance_date))
      ? format(new Date(gig.performance_date), "EEE, MMM d, yyyy")
      : gig.performance_date
    : null;

  // Format time
  const timeDisplay =
    gig.start_time && gig.end_time
      ? `${gig.start_time} - ${gig.end_time}`
      : gig.start_time
        ? gig.start_time
        : null;

  // Get stage label
  const stageLabel = findDealLabel(dealStages, gig.stage);

  // Format fee
  const feeDisplay = gig.amount
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(gig.amount)
    : null;

  return (
    <Link to={`/deals/${gig.id}/show`}>
      <Card className="hover:bg-muted/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg">{gig.name}</h3>
            {stageLabel && (
              <Badge variant="outline" className="ml-2 shrink-0">
                {stageLabel}
              </Badge>
            )}
          </div>

          {performanceDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span>{performanceDate}</span>
              {timeDisplay && <span className="ml-2">{timeDisplay}</span>}
            </div>
          )}

          {gig.venue_id && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <MapPin className="h-4 w-4" />
              <ReferenceField source="venue_id" reference="venues" link={false}>
                <TextField source="name" />
              </ReferenceField>
            </div>
          )}

          {feeDisplay && (
            <div className="text-sm font-medium text-foreground mt-2">
              {feeDisplay}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};
