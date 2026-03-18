import { CreateBase, Form, useGetIdentity } from "ra-core";
import { Card, CardContent } from "@/components/ui/card";
import { CancelButton } from "@/components/admin/cancel-button";
import { SaveButton } from "@/components/admin/form";

import { SongInputs } from "./SongInputs";

export const SongCreate = () => {
  const { identity } = useGetIdentity();
  if (!identity) return null;

  return (
    <CreateBase
      redirect="list"
      transform={(values) => ({
        ...values,
        active: values.active !== false,
        created_at: new Date().toISOString(),
      })}
    >
      <div className="mt-2 flex lg:mr-72">
        <div className="flex-1">
          <Form>
            <SongInputs />
            <div
              role="toolbar"
              className="flex justify-between items-center mt-4"
            >
              <CancelButton />
              <SaveButton />
            </div>
          </Form>
        </div>
      </div>
    </CreateBase>
  );
};
