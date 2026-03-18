import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Clock } from "lucide-react";
import { useDataProvider, useNotify } from "ra-core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SetListSongItem } from "./SetListSongItem";
import { SongPickerDialog } from "./SongPickerDialog";
import type { SetList, SetListSong, Song } from "../types";
import type { Identifier } from "ra-core";

export interface SetListBuilderProps {
  setList: SetList;
  gigId: Identifier;
  onUpdate?: () => void;
}

export const SetListBuilder = ({
  setList,
  gigId,
  onUpdate,
}: SetListBuilderProps) => {
  const [songs, setSongs] = useState<SetListSong[]>(setList.songs || []);
  const [showSongPicker, setShowSongPicker] = useState(false);
  const dataProvider = useDataProvider();
  const notify = useNotify();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setSongs(setList.songs || []);
  }, [setList.songs]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = songs.findIndex((song) => song.id === active.id);
      const newIndex = songs.findIndex((song) => song.id === over.id);

      const newSongs = arrayMove(songs, oldIndex, newIndex);
      setSongs(newSongs);

      // Update positions in database
      try {
        await Promise.all(
          newSongs.map((song, index) =>
            dataProvider.update("set_list_songs", {
              id: song.id,
              data: { position: index },
              previousData: song,
            })
          )
        );
        onUpdate?.();
      } catch (error) {
        notify("Error updating song order", { type: "error" });
        setSongs(songs); // Revert on error
      }
    }
  };

  const handleAddSong = async (song: Song) => {
    try {
      const newPosition = songs.length;
      const { data: newSetListSong } = await dataProvider.create<SetListSong>(
        "set_list_songs",
        {
          data: {
            set_list_id: setList.id,
            song_id: song.id,
            position: newPosition,
            notes: "",
          },
        }
      );

      // Add song details to the new set list song
      const enrichedSong: SetListSong = {
        ...newSetListSong,
        title: song.title,
        artist: song.artist,
        key: song.key,
        duration: song.duration,
      };

      setSongs([...songs, enrichedSong]);
      setShowSongPicker(false);
      notify("Song added to set list", { type: "success" });
      onUpdate?.();
    } catch (error) {
      notify("Error adding song to set list", { type: "error" });
    }
  };

  const handleRemoveSong = async (songId: string | number) => {
    try {
      await dataProvider.delete("set_list_songs", {
        id: songId,
        previousData: songs.find((s) => s.id === songId),
      });

      const newSongs = songs.filter((song) => song.id !== songId);
      
      // Update positions for remaining songs
      await Promise.all(
        newSongs.map((song, index) =>
          dataProvider.update("set_list_songs", {
            id: song.id,
            data: { position: index },
            previousData: song,
          })
        )
      );

      setSongs(newSongs);
      notify("Song removed from set list", { type: "success" });
      onUpdate?.();
    } catch (error) {
      notify("Error removing song from set list", { type: "error" });
    }
  };

  const handleNotesChange = async (
    songId: string | number,
    notes: string
  ) => {
    const song = songs.find((s) => s.id === songId);
    if (!song) return;

    try {
      await dataProvider.update("set_list_songs", {
        id: songId,
        data: { notes },
        previousData: song,
      });

      setSongs(
        songs.map((s) => (s.id === songId ? { ...s, notes } : s))
      );
    } catch (error) {
      notify("Error updating song notes", { type: "error" });
    }
  };

  const totalDuration = songs.reduce(
    (sum, song) => sum + (song.duration || 0),
    0
  );

  const formatTotalDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{setList.name}</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formatTotalDuration(totalDuration)}</span>
                <span className="text-xs">
                  ({songs.length} {songs.length === 1 ? "song" : "songs"})
                </span>
              </div>
              <Button onClick={() => setShowSongPicker(true)} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Song
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {songs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No songs in this set list yet</p>
              <Button onClick={() => setShowSongPicker(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Song
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={songs.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {songs.map((song) => (
                    <SetListSongItem
                      key={song.id}
                      song={song}
                      onRemove={handleRemoveSong}
                      onNotesChange={handleNotesChange}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      <SongPickerDialog
        open={showSongPicker}
        onClose={() => setShowSongPicker(false)}
        onSelectSong={handleAddSong}
        excludeSongIds={songs.map((s) => s.song_id)}
      />
    </>
  );
};
