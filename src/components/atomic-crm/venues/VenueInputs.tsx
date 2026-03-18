import { required } from "ra-core";
import { TextInput } from "@/components/admin/text-input";
import { NumberInput } from "@/components/admin/number-input";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

const isUrl = (url: string) => {
  if (!url) return;
  const UrlRegex = new RegExp(
    /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i,
  );
  if (!UrlRegex.test(url)) {
    return "Must be a valid URL";
  }
};

export const VenueInputs = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col gap-4 p-1">
      <VenueBasicInputs />
      <div className={`flex gap-6 ${isMobile ? "flex-col" : "flex-row"}`}>
        <div className="flex flex-col gap-10 flex-1">
          <VenueAddressInputs />
          <VenueTechnicalInputs />
        </div>
        <Separator orientation={isMobile ? "horizontal" : "vertical"} />
        <div className="flex flex-col gap-8 flex-1">
          <VenueContactInputs />
          <VenueAdditionalInputs />
        </div>
      </div>
    </div>
  );
};

const VenueBasicInputs = () => {
  return (
    <div className="flex gap-4 flex-1 flex-row">
      <TextInput
        source="name"
        className="w-full h-fit"
        validate={required()}
        helperText={false}
        placeholder="Venue name"
      />
    </div>
  );
};

const VenueAddressInputs = () => {
  return (
    <div className="flex flex-col gap-4">
      <h6 className="text-lg font-semibold">Address</h6>
      <TextInput source="address" helperText={false} />
      <TextInput source="city" helperText={false} />
      <TextInput source="postcode" helperText={false} />
      <TextInput source="country" helperText={false} defaultValue="UK" />
    </div>
  );
};

const VenueTechnicalInputs = () => {
  return (
    <div className="flex flex-col gap-4">
      <h6 className="text-lg font-semibold">Technical Details</h6>
      <NumberInput source="capacity" helperText={false} />
      <TextInput
        source="stage_size"
        helperText={false}
        placeholder="e.g. 20ft x 15ft"
      />
      <TextInput
        source="parking_info"
        multiline
        helperText={false}
        placeholder="Parking availability and access"
      />
      <TextInput
        source="load_in_notes"
        multiline
        helperText={false}
        placeholder="Loading bay access, stairs, etc."
      />
    </div>
  );
};

const VenueContactInputs = () => {
  return (
    <div className="flex flex-col gap-4">
      <h6 className="text-lg font-semibold">Venue Contact</h6>
      <TextInput
        source="contact_name"
        helperText={false}
        placeholder="Venue contact person"
      />
      <TextInput source="contact_phone" helperText={false} />
      <TextInput source="contact_email" helperText={false} type="email" />
      <TextInput source="website" helperText={false} validate={isUrl} />
    </div>
  );
};

const VenueAdditionalInputs = () => {
  return (
    <div className="flex flex-col gap-4">
      <h6 className="text-lg font-semibold">Additional Information</h6>
      <TextInput
        source="notes"
        multiline
        helperText={false}
        placeholder="General notes about the venue"
      />
    </div>
  );
};
