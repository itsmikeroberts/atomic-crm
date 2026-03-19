import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SetList, SetListSong } from "../types";

// Mock the drag-and-drop reordering logic
const arrayMove = <T,>(array: T[], from: number, to: number): T[] => {
  const newArray = [...array];
  const [removed] = newArray.splice(from, 1);
  newArray.splice(to, 0, removed);
  return newArray;
};

describe("SetListBuilder", () => {
  describe("arrayMove utility", () => {
    it("should move an item forward in the array", () => {
      const songs = [
        { id: 1, title: "Song 1" },
        { id: 2, title: "Song 2" },
        { id: 3, title: "Song 3" },
      ];

      const result = arrayMove(songs, 0, 2);

      expect(result).toEqual([
        { id: 2, title: "Song 2" },
        { id: 3, title: "Song 3" },
        { id: 1, title: "Song 1" },
      ]);
    });

    it("should move an item backward in the array", () => {
      const songs = [
        { id: 1, title: "Song 1" },
        { id: 2, title: "Song 2" },
        { id: 3, title: "Song 3" },
      ];

      const result = arrayMove(songs, 2, 0);

      expect(result).toEqual([
        { id: 3, title: "Song 3" },
        { id: 1, title: "Song 1" },
        { id: 2, title: "Song 2" },
      ]);
    });

    it("should handle moving to adjacent position", () => {
      const songs = [
        { id: 1, title: "Song 1" },
        { id: 2, title: "Song 2" },
        { id: 3, title: "Song 3" },
      ];

      const result = arrayMove(songs, 0, 1);

      expect(result).toEqual([
        { id: 2, title: "Song 2" },
        { id: 1, title: "Song 1" },
        { id: 3, title: "Song 3" },
      ]);
    });

    it("should not modify the original array", () => {
      const songs = [
        { id: 1, title: "Song 1" },
        { id: 2, title: "Song 2" },
        { id: 3, title: "Song 3" },
      ];

      const original = [...songs];
      arrayMove(songs, 0, 2);

      expect(songs).toEqual(original);
    });
  });

  describe("duration calculation", () => {
    it("should calculate total duration of songs", () => {
      const songs: SetListSong[] = [
        {
          id: 1,
          set_list_id: 1,
          song_id: 1,
          position: 0,
          title: "Song 1",
          artist: "Artist 1",
          duration: 180, // 3 minutes
          notes: "",
        },
        {
          id: 2,
          set_list_id: 1,
          song_id: 2,
          position: 1,
          title: "Song 2",
          artist: "Artist 2",
          duration: 240, // 4 minutes
          notes: "",
        },
        {
          id: 3,
          set_list_id: 1,
          song_id: 3,
          position: 2,
          title: "Song 3",
          artist: "Artist 3",
          duration: 300, // 5 minutes
          notes: "",
        },
      ];

      const totalDuration = songs.reduce(
        (sum, song) => sum + (song.duration || 0),
        0
      );

      expect(totalDuration).toBe(720); // 12 minutes total
    });

    it("should handle songs without duration", () => {
      const songs: SetListSong[] = [
        {
          id: 1,
          set_list_id: 1,
          song_id: 1,
          position: 0,
          title: "Song 1",
          artist: "Artist 1",
          duration: 180,
          notes: "",
        },
        {
          id: 2,
          set_list_id: 1,
          song_id: 2,
          position: 1,
          title: "Song 2",
          artist: "Artist 2",
          notes: "",
        },
      ];

      const totalDuration = songs.reduce(
        (sum, song) => sum + (song.duration || 0),
        0
      );

      expect(totalDuration).toBe(180);
    });
  });

  describe("formatTotalDuration", () => {
    const formatTotalDuration = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      if (hours > 0) {
        return `${hours}h ${mins}m`;
      }
      return `${mins}m`;
    };

    it("should format duration in minutes when less than an hour", () => {
      expect(formatTotalDuration(600)).toBe("10m");
      expect(formatTotalDuration(1800)).toBe("30m");
      expect(formatTotalDuration(3540)).toBe("59m");
    });

    it("should format duration with hours when 1 hour or more", () => {
      expect(formatTotalDuration(3600)).toBe("1h 0m");
      expect(formatTotalDuration(3660)).toBe("1h 1m");
      expect(formatTotalDuration(7200)).toBe("2h 0m");
      expect(formatTotalDuration(7380)).toBe("2h 3m");
    });

    it("should handle zero duration", () => {
      expect(formatTotalDuration(0)).toBe("0m");
    });

    it("should round down partial minutes", () => {
      expect(formatTotalDuration(659)).toBe("10m"); // 10 minutes 59 seconds
      expect(formatTotalDuration(3659)).toBe("1h 0m"); // 1 hour 0 minutes 59 seconds
    });
  });

  describe("song position updates", () => {
    it("should update positions after reordering", () => {
      const songs: SetListSong[] = [
        {
          id: 1,
          set_list_id: 1,
          song_id: 1,
          position: 0,
          title: "Song 1",
          artist: "Artist 1",
          notes: "",
        },
        {
          id: 2,
          set_list_id: 1,
          song_id: 2,
          position: 1,
          title: "Song 2",
          artist: "Artist 2",
          notes: "",
        },
        {
          id: 3,
          set_list_id: 1,
          song_id: 3,
          position: 2,
          title: "Song 3",
          artist: "Artist 3",
          notes: "",
        },
      ];

      const reordered = arrayMove(songs, 0, 2);
      const withUpdatedPositions = reordered.map((song, index) => ({
        ...song,
        position: index,
      }));

      expect(withUpdatedPositions[0].position).toBe(0);
      expect(withUpdatedPositions[1].position).toBe(1);
      expect(withUpdatedPositions[2].position).toBe(2);
      expect(withUpdatedPositions[0].id).toBe(2);
      expect(withUpdatedPositions[2].id).toBe(1);
    });

    it("should update positions after removing a song", () => {
      const songs: SetListSong[] = [
        {
          id: 1,
          set_list_id: 1,
          song_id: 1,
          position: 0,
          title: "Song 1",
          artist: "Artist 1",
          notes: "",
        },
        {
          id: 2,
          set_list_id: 1,
          song_id: 2,
          position: 1,
          title: "Song 2",
          artist: "Artist 2",
          notes: "",
        },
        {
          id: 3,
          set_list_id: 1,
          song_id: 3,
          position: 2,
          title: "Song 3",
          artist: "Artist 3",
          notes: "",
        },
      ];

      const afterRemoval = songs.filter((song) => song.id !== 2);
      const withUpdatedPositions = afterRemoval.map((song, index) => ({
        ...song,
        position: index,
      }));

      expect(withUpdatedPositions).toHaveLength(2);
      expect(withUpdatedPositions[0].position).toBe(0);
      expect(withUpdatedPositions[1].position).toBe(1);
      expect(withUpdatedPositions[0].id).toBe(1);
      expect(withUpdatedPositions[1].id).toBe(3);
    });
  });

  describe("song notes management", () => {
    it("should update notes for a specific song", () => {
      const songs: SetListSong[] = [
        {
          id: 1,
          set_list_id: 1,
          song_id: 1,
          position: 0,
          title: "Song 1",
          artist: "Artist 1",
          notes: "",
        },
        {
          id: 2,
          set_list_id: 1,
          song_id: 2,
          position: 1,
          title: "Song 2",
          artist: "Artist 2",
          notes: "",
        },
      ];

      const updatedSongs = songs.map((s) =>
        s.id === 1 ? { ...s, notes: "Extended intro" } : s
      );

      expect(updatedSongs[0].notes).toBe("Extended intro");
      expect(updatedSongs[1].notes).toBe("");
    });
  });
});
