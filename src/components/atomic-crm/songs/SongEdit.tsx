import { EditBase, Form } from "ra-core";
import { CancelButton } from "@/components/admin/cancel-button";
import { SaveButton } from "@/components/admin/form";
import { SongInputs } from "./SongInputs";

export const SongEdit = () => {
  return (
    <EditBase
      mutationMode="pessimistic"
      transform={(values) => ({
        ...values,
        updated_at: new Date().toISOString(),
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
    </EditBase>
  );
};
