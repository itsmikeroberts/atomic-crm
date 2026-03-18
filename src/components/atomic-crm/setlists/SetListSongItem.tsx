import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { SetListSong } from "../types";

export interface SetListSongItemProps {
  song: SetListSong;
  onRemove: (songId: string | number) => void;
  onNotesChange: (songId: string | number, notes: string) => void;
}

export const SetListSongItem = ({
  song,
  onRemove,
  onNotesChange,
}: SetListSongItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 p-3 bg-card border rounded-lg"
    >
      <button
        className="cursor-grab active:cursor-grabbing mt-1 text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{song.title}</p>
            <p className="text-sm text-muted-foreground truncate">
              {song.artist}
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {song.key && <span className="font-mono">{song.key}</span>}
            <span className="font-mono">{formatDuration(song.duration)}</span>
          </div>
        </div>

        {song.notes !== undefined && (
          <Textarea
            value={song.notes || ""}
            onChange={(e) => onNotesChange(song.id, e.target.value)}
            placeholder="Add notes for this song..."
            className="mt-2 min-h-[60px] text-sm"
          />
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(song.id)}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
