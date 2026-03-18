import { useRecordContext } from "ra-core";
import { Link } from "react-router-dom";
import { Building2, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import type { Venue } from "../types";

export const VenueCard = () => {
  const record = useRecordContext<Venue>();
  if (!record) return null;

  return (
    <Link to={`/venues/${record.id}/show`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">{record.name}</h3>
              {record.city && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{record.city}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {record.capacity && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Capacity:</span>
              <span className="font-medium">{record.capacity}</span>
            </div>
          )}
          {record.stage_size && (
            <div className="text-sm">
              <span className="text-muted-foreground">Stage:</span>{" "}
              <span className="font-medium">{record.stage_size}</span>
            </div>
          )}
          {record.address && (
            <p className="text-xs text-muted-foreground truncate">
              {record.address}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};
