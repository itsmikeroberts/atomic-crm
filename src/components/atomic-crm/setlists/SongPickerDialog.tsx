import { useState } from "react";
import { useGetList } from "react-admin";
import { Search, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Song } from "../types";

export interface SongPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectSong: (song: Song) => void;
  excludeSongIds?: (string | number)[];
}

export const SongPickerDialog = ({
  open,
  onClose,
  onSelectSong,
  excludeSongIds = [],
}: SongPickerDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: songs, isLoading } = useGetList<Song>("songs", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "title", order: "ASC" },
    filter: searchQuery
      ? {
          title: searchQuery,
        }
      : {},
  });

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const filteredSongs = songs?.filter(
    (song) => !excludeSongIds.includes(song.id)
  );

  const handleSelectSong = (song: Song) => {
    onSelectSong(song);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add Song to Set List</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search songs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[400px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                Loading songs...
              </div>
            ) : filteredSongs && filteredSongs.length > 0 ? (
              <div className="space-y-2">
                {filteredSongs.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{song.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {song.artist}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {song.key && (
                          <span className="font-mono">{song.key}</span>
                        )}
                        <span className="font-mono">
                          {formatDuration(song.duration)}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSelectSong(song)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                {searchQuery
                  ? "No songs found matching your search"
                  : "No songs available"}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
