import { TextInput } from "@/components/admin/text-input";
import { NumberInput } from "@/components/admin/number-input";
import { SelectInput } from "@/components/admin/select-input";
import { BooleanInput } from "@/components/admin/boolean-input";
import { ArrayInput } from "@/components/admin/array-input";
import { SimpleFormIterator } from "@/components/admin/simple-form-iterator";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const musicalKeys = [
  { id: "C", name: "C" },
  { id: "C#", name: "C#" },
  { id: "D", name: "D" },
  { id: "D#", name: "D#" },
  { id: "E", name: "E" },
  { id: "F", name: "F" },
  { id: "F#", name: "F#" },
  { id: "G", name: "G" },
  { id: "G#", name: "G#" },
  { id: "A", name: "A" },
  { id: "A#", name: "A#" },
  { id: "B", name: "B" },
];

const genres = [
  { id: "Rock", name: "Rock" },
  { id: "Pop", name: "Pop" },
  { id: "Jazz", name: "Jazz" },
  { id: "Blues", name: "Blues" },
  { id: "Country", name: "Country" },
  { id: "Folk", name: "Folk" },
  { id: "R&B", name: "R&B" },
  { id: "Soul", name: "Soul" },
  { id: "Funk", name: "Funk" },
  { id: "Disco", name: "Disco" },
  { id: "Electronic", name: "Electronic" },
  { id: "Hip Hop", name: "Hip Hop" },
  { id: "Metal", name: "Metal" },
  { id: "Punk", name: "Punk" },
  { id: "Reggae", name: "Reggae" },
  { id: "Latin", name: "Latin" },
  { id: "Classical", name: "Classical" },
  { id: "Other", name: "Other" },
];

export const SongInputs = () => {
  return (
    <>
      <SongBasicInputs />
      <Separator className="my-6" />
      <SongMusicalInputs />
      <Separator className="my-6" />
      <SongResourceInputs />
      <Separator className="my-6" />
      <SongAdditionalInputs />
    </>
  );
};

const SongBasicInputs = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          <TextInput
            source="title"
            label="Title"
            helperText={false}
            isRequired
          />
          <TextInput source="artist" label="Artist" helperText={false} />
          <BooleanInput
            source="active"
            label="Active in Repertoire"
            helperText="Inactive songs won't appear in set list builder"
            defaultValue={true}
          />
        </div>
      </CardContent>
    </Card>
  );
};

const SongMusicalInputs = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Musical Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SelectInput
              source="key"
              label="Key"
              choices={musicalKeys}
              helperText={false}
            />
            <NumberInput
              source="tempo"
              label="Tempo (BPM)"
              helperText={false}
              min={0}
            />
            <NumberInput
              source="duration"
              label="Duration (seconds)"
              helperText={false}
              min={0}
            />
          </div>
          <SelectInput
            source="genre"
            label="Genre"
            choices={genres}
            helperText={false}
          />
        </div>
      </CardContent>
    </Card>
  );
};

const SongResourceInputs = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Resources</h3>
          <TextInput
            source="lyrics_url"
            label="Lyrics URL"
            helperText={false}
            type="url"
          />
          <TextInput
            source="chart_url"
            label="Chart/Sheet Music URL"
            helperText={false}
            type="url"
          />
        </div>
      </CardContent>
    </Card>
  );
};

const SongAdditionalInputs = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Additional Information</h3>
          <ArrayInput source="tags" helperText={false}>
            <SimpleFormIterator disableReordering fullWidth getItemLabel={false}>
              <TextInput
                source=""
                label="Tag"
                helperText={false}
                placeholder="e.g., wedding, upbeat, slow"
              />
            </SimpleFormIterator>
          </ArrayInput>
          <TextInput
            source="notes"
            label="Notes"
            helperText={false}
            multiline
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};
