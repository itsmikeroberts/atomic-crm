import { EditBase, Form, useGetIdentity } from "ra-core";
import { Card, CardContent } from "@/components/ui/card";
import { CancelButton } from "@/components/admin/cancel-button";
import { SaveButton } from "@/components/admin/form";

import { VenueInputs } from "./VenueInputs";
import { VenueAside } from "./VenueAside";

export const VenueEdit = () => {
  const { identity } = useGetIdentity();
  if (!identity) return null;

  return (
    <EditBase
      redirect="show"
      transform={(values) => {
        // add https:// before website if not present
        if (values.website && !values.website.startsWith("http")) {
          values.website = `https://${values.website}`;
        }
        return values;
      }}
      mutationMode="pessimistic"
    >
      <div className="mt-2 flex">
        <div className="flex-1">
          <Form>
            <Card>
              <CardContent>
                <VenueInputs />
                <div
                  role="toolbar"
                  className="sticky flex pt-4 pb-4 md:pb-0 bottom-0 bg-linear-to-b from-transparent to-card to-10% flex-row justify-end gap-2"
                >
                  <CancelButton />
                  <SaveButton />
                </div>
              </CardContent>
            </Card>
          </Form>
        </div>
        <VenueAside />
      </div>
    </EditBase>
  );
};
