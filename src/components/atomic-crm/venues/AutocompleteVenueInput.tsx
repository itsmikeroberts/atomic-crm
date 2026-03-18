import { useCreate, useGetIdentity, useNotify } from "ra-core";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";
import type { InputProps } from "ra-core";
import { useIsMobile } from "@/hooks/use-mobile";

export const AutocompleteVenueInput = ({
  validate,
}: Pick<InputProps, "validate">) => {
  const [create] = useCreate();
  const { identity } = useGetIdentity();
  const notify = useNotify();
  const handleCreateVenue = async (name?: string) => {
    if (!name) return;
    try {
      const newVenue = await create(
        "venues",
        {
          data: {
            name,
            created_at: new Date().toISOString(),
          },
        },
        { returnPromise: true },
      );
      return newVenue;
    } catch {
      notify("An error occurred while creating the venue", {
        type: "error",
      });
    }
  };
  const isMobile = useIsMobile();

  return (
    <AutocompleteInput
      optionText="name"
      helperText={false}
      onCreate={handleCreateVenue}
      createItemLabel="Create %{item}"
      createLabel="Start typing to create a new venue"
      validate={validate}
      modal={isMobile}
    />
  );
};
