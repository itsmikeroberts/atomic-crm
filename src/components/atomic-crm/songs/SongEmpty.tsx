import { Music } from "lucide-react";
import { CreateButton } from "@/components/admin/create-button";

export const SongEmpty = () => {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-center">
      <Music className="w-16 h-16 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-semibold mb-2">No songs in your repertoire</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Start building your songbook by adding songs. You can organize them by
        genre, key, and tags to easily create set lists for your gigs.
      </p>
      <CreateButton label="Add Your First Song" />
    </div>
  );
};
