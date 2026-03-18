import { Building2, Globe, MapPin, Phone, Users } from "lucide-react";
import { useRecordContext } from "ra-core";
import { EditButton } from "@/components/admin/edit-button";
import { DeleteButton } from "@/components/admin/delete-button";
import { ShowButton } from "@/components/admin/show-button";
import { TextField } from "@/components/admin/text-field";
import { DateField } from "@/components/admin/date-field";
import { UrlField } from "@/components/admin/url-field";

import { AsideSection } from "../misc/AsideSection";
import type { Venue } from "../types";

interface VenueAsideProps {
  link?: string;
}

export const VenueAside = ({ link = "edit" }: VenueAsideProps) => {
  const record = useRecordContext<Venue>();
  if (!record) return null;

  return (
    <div className="hidden sm:block w-92 min-w-92 space-y-4">
      <div className="flex flex-row space-x-1">
        {link === "edit" ? (
          <EditButton label="Edit Venue" />
        ) : (
          <ShowButton label="Show Venue" />
        )}
      </div>

      <VenueInfo record={record} />

      <AddressInfo record={record} />

      <TechnicalInfo record={record} />

      <ContactInfo record={record} />

      <AdditionalInfo record={record} />

      {link !== "edit" && (
        <div className="mt-6 pt-6 border-t hidden sm:flex flex-col gap-2 items-start">
          <DeleteButton
            className="h-6 cursor-pointer hover:bg-destructive/10! text-destructive! border-destructive! focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40"
            size="sm"
          />
        </div>
      )}
    </div>
  );
};

export const VenueInfo = ({ record }: { record: Venue }) => {
  if (!record.website) {
    return null;
  }

  return (
    <AsideSection title="Venue Info">
      {record.website && (
        <div className="flex flex-row items-center gap-1 min-h-[24px]">
          <Globe className="w-4 h-4" />
          <UrlField
            source="website"
            target="_blank"
            rel="noopener"
            content={record.website
              .replace("http://", "")
              .replace("https://", "")}
          />
        </div>
      )}
    </AsideSection>
  );
};

export const AddressInfo = ({ record }: { record: Venue }) => {
  if (
    !record.address &&
    !record.city &&
    !record.postcode &&
    !record.country
  ) {
    return null;
  }

  return (
    <AsideSection title="Address" noGap>
      {record.address && (
        <div className="flex flex-row items-center gap-1">
          <MapPin className="w-4 h-4" />
          <TextField source="address" />
        </div>
      )}
      <TextField source="city" />
      <TextField source="postcode" />
      <TextField source="country" />
    </AsideSection>
  );
};

export const TechnicalInfo = ({ record }: { record: Venue }) => {
  if (
    !record.capacity &&
    !record.stage_size &&
    !record.parking_info &&
    !record.load_in_notes
  ) {
    return null;
  }

  return (
    <AsideSection title="Technical Details">
      {record.capacity && (
        <div className="flex flex-row items-center gap-1">
          <Users className="w-4 h-4" />
          <span>Capacity: {record.capacity}</span>
        </div>
      )}
      {record.stage_size && (
        <div className="flex flex-row items-center gap-1">
          <Building2 className="w-4 h-4" />
          <span>Stage: {record.stage_size}</span>
        </div>
      )}
      {record.parking_info && (
        <div className="text-sm">
          <strong>Parking:</strong> {record.parking_info}
        </div>
      )}
      {record.load_in_notes && (
        <div className="text-sm">
          <strong>Load-in:</strong> {record.load_in_notes}
        </div>
      )}
    </AsideSection>
  );
};

export const ContactInfo = ({ record }: { record: Venue }) => {
  if (
    !record.contact_name &&
    !record.contact_phone &&
    !record.contact_email
  ) {
    return null;
  }

  return (
    <AsideSection title="Contact">
      {record.contact_name && (
        <span className="text-sm">{record.contact_name}</span>
      )}
      {record.contact_phone && (
        <div className="flex flex-row items-center gap-1">
          <Phone className="w-4 h-4" />
          <TextField source="contact_phone" />
        </div>
      )}
      {record.contact_email && (
        <a
          href={`mailto:${record.contact_email}`}
          className="text-sm underline hover:no-underline"
        >
          {record.contact_email}
        </a>
      )}
    </AsideSection>
  );
};

export const AdditionalInfo = ({ record }: { record: Venue }) => {
  if (!record.created_at && !record.notes) {
    return null;
  }

  return (
    <AsideSection title="Additional Info">
      {record.notes && <p className="text-sm mb-1">{record.notes}</p>}
      {record.created_at && (
        <p className="text-sm text-muted-foreground mb-1">
          Added on{" "}
          <DateField
            source="created_at"
            record={record}
            options={{
              year: "numeric",
              month: "long",
              day: "numeric",
            }}
          />
        </p>
      )}
    </AsideSection>
  );
};
