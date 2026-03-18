import { useListContext, RecordContextProvider } from "ra-core";
import { Link as RouterLink } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Music, Clock, Gauge, Key as KeyIcon, ExternalLink } from "lucide-react";
import type { Song } from "../types";

const times = (nbChildren: number, fn: (key: number) => any) =>
  Array.from({ length: nbChildren }, (_, key) => fn(key));

const LoadingGridList = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {times(15, (key) => (
      <Card key={key}>
        <CardContent className="p-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const LoadedGridList = () => {
  const { data, isPending } = useListContext<Song>();

  if (isPending) return <LoadingGridList />;
  if (!data || data.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((record) => (
        <RecordContextProvider key={record.id} value={record}>
          <SongCard />
        </RecordContextProvider>
      ))}
    </div>
  );
};

export const GridList = () => {
  const { isPending } = useListContext();
  return isPending ? <LoadingGridList /> : <LoadedGridList />;
};

const SongCard = () => {
  const record = useListContext<Song>().data?.find(() => true);
  if (!record) return null;

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <RouterLink
          to={`/songs/${record.id}/show`}
          className="block space-y-3"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate flex items-center gap-2">
                <Music className="h-4 w-4 flex-shrink-0" />
                {record.title}
              </h3>
              {record.artist && (
                <p className="text-sm text-muted-foreground truncate">
                  {record.artist}
                </p>
              )}
            </div>
            {!record.active && (
              <Badge variant="secondary" className="ml-2">
                Inactive
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {record.key && (
              <div className="flex items-center gap-1">
                <KeyIcon className="h-3 w-3" />
                <span>{record.key}</span>
              </div>
            )}
            {record.tempo && (
              <div className="flex items-center gap-1">
                <Gauge className="h-3 w-3" />
                <span>{record.tempo} BPM</span>
              </div>
            )}
            {record.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDuration(record.duration)}</span>
              </div>
            )}
          </div>

          {record.genre && (
            <div>
              <Badge variant="outline">{record.genre}</Badge>
            </div>
          )}

          {record.tags && record.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {record.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {record.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{record.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {record.lyrics_url && (
              <a
                href={record.lyrics_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                Lyrics <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {record.chart_url && (
              <a
                href={record.chart_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                Chart <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </RouterLink>
      </CardContent>
    </Card>
  );
};
