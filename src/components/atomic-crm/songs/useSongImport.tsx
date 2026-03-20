import { useDataProvider, type DataProvider } from "ra-core";
import { useCallback } from "react";

export type SongImportSchema = {
  title: string;
  artist: string;
  key: string;
  tempo: string;
  duration: string;
  genre: string;
  notes: string;
  lyrics_url: string;
  chart_url: string;
  tags: string;
  active: string;
};

export function useSongImport() {
  const dataProvider = useDataProvider();

  const processBatch = useCallback(
    async (batch: SongImportSchema[]) => {
      await Promise.all(
        batch.map(async (row) => {
          // Parse tags from comma-separated string
          const tags =
            row.tags
              ?.split(",")
              ?.map((t) => t.trim())
              ?.filter((t) => t) ?? [];

          // Parse numeric fields
          const tempo = row.tempo ? parseInt(row.tempo, 10) : null;
          const duration = row.duration ? parseInt(row.duration, 10) : null;

          // Parse boolean active field (defaults to true)
          const active = row.active !== "false" && row.active !== "0";

          return dataProvider.create("songs", {
            data: {
              title: row.title,
              artist: row.artist || null,
              key: row.key || null,
              tempo: tempo,
              duration: duration,
              genre: row.genre || null,
              notes: row.notes || null,
              lyrics_url: row.lyrics_url || null,
              chart_url: row.chart_url || null,
              tags: tags.length > 0 ? tags : null,
              active: active,
              created_at: new Date().toISOString(),
            },
          });
        }),
      );
    },
    [dataProvider],
  );

  return processBatch;
}
