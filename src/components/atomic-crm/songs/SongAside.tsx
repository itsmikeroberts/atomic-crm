import { useRecordContext } from "ra-core";
import { Link as RouterLink } from "react-router";
import { Button } from "@/components/ui/button";
import { EditButton } from "@/components/admin/edit-button";
import { DeleteButton } from "@/components/admin/delete-button";
import { AsideSection } from "../misc/AsideSection";
import { DateField } from "@/components/admin/date-field";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import type { Song } from "../types";

interface SongAsideProps {
  link?: "edit" | "show";
}

export const SongAside = ({ link = "edit" }: SongAsideProps) => {
  const record = useRecordContext<Song>();
  if (!record) return null;

  return (
    <aside className="w-full sm:w-80 flex flex-col gap-6">
      {link === "edit" ? (
        <EditButton label="Edit Song" />
      ) : (
        <div className="mt-6 pt-6 border-t hidden sm:flex flex-col gap-2 items-start">
          <DeleteButton label="Delete Song" />
        </div>
      )}
      <SongInfo record={record} />
      <MusicalDetails record={record} />
      <ResourceLinks record={record} />
      <AdditionalInfo record={record} />
    </aside>
  );
};

export const SongInfo = ({ record }: { record: Song }) => {
  return (
    <AsideSection title="Song Info">
      <div className="flex flex-col gap-3">
        <div className="flex flex-row items-center gap-1 min-h-[24px]">
          <span className="text-sm font-medium">Status:</span>
          <Badge variant={record.active ? "default" : "secondary"}>
            {record.active ? "Active" : "Inactive"}
          </Badge>
        </div>
        {record.genre && (
          <div className="flex flex-row items-center gap-1 min-h-[24px]">
            <span className="text-sm font-medium">Genre:</span>
            <span className="text-sm">{record.genre}</span>
          </div>
        )}
      </div>
    </AsideSection>
  );
};

export const MusicalDetails = ({ record }: { record: Song }) => {
  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AsideSection title="Musical Details">
      <div className="flex flex-col gap-3">
        {record.key && (
          <div className="flex flex-row items-center gap-1 min-h-[24px]">
            <span className="text-sm font-medium">Key:</span>
            <span className="text-sm">{record.key}</span>
          </div>
        )}
        {record.tempo && (
          <div className="flex flex-row items-center gap-1 min-h-[24px]">
            <span className="text-sm font-medium">Tempo:</span>
            <span className="text-sm">{record.tempo} BPM</span>
          </div>
        )}
        <div className="flex flex-row items-center gap-1 min-h-[24px]">
          <span className="text-sm font-medium">Duration:</span>
          <span className="text-sm">{formatDuration(record.duration)}</span>
        </div>
      </div>
    </AsideSection>
  );
};

export const ResourceLinks = ({ record }: { record: Song }) => {
  if (!record.lyrics_url && !record.chart_url) return null;

  return (
    <AsideSection title="Resources">
      <div className="flex flex-col gap-2">
        {record.lyrics_url && (
          <Button variant="outline" size="sm" asChild>
            <a
              href={record.lyrics_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View Lyrics
            </a>
          </Button>
        )}
        {record.chart_url && (
          <Button variant="outline" size="sm" asChild>
            <a
              href={record.chart_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View Chart
            </a>
          </Button>
        )}
      </div>
    </AsideSection>
  );
};

export const AdditionalInfo = ({ record }: { record: Song }) => {
  return (
    <AsideSection title="Additional Info">
      <div className="flex flex-col gap-3">
        {record.tags && record.tags.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Tags:</span>
            <div className="flex flex-wrap gap-1">
              {record.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {record.notes && (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Notes:</span>
            <p className="text-sm text-muted-foreground">{record.notes}</p>
          </div>
        )}
        <p className="text-sm text-muted-foreground mb-1">
          Created <DateField source="created_at" />
        </p>
      </div>
    </AsideSection>
  );
};
