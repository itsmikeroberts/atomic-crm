import {
  EditBase,
  Form,
  useNotify,
  useRecordContext,
  useRedirect,
} from "ra-core";
import { Link } from "react-router";
import { DeleteButton } from "@/components/admin/delete-button";
import { ReferenceField } from "@/components/admin/reference-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

import { FormToolbar } from "../layout/FormToolbar";
import { MobileBackButton } from "../misc/MobileBackButton";
import { MobileContent } from "../layout/MobileContent";
import MobileHeader from "../layout/MobileHeader";
import { CompanyAvatar } from "../companies/CompanyAvatar";
import type { Deal } from "../types";
import { DealInputs } from "./DealInputs";

export const DealEdit = ({ open, id }: { open?: boolean; id?: string }) => {
  const isMobile = useIsMobile();
  const redirect = useRedirect();
  const notify = useNotify();

  // On mobile, render full screen without Dialog (used as a route component)
  if (isMobile) {
    return (
      <EditBase
        mutationMode="pessimistic"
        mutationOptions={{
          onSuccess: (data) => {
            notify("Deal updated");
            redirect(`/deals/${data.id}/show`);
          },
        }}
      >
        <DealEditContentMobile />
      </EditBase>
    );
  }

  // Desktop: existing Dialog implementation (used as overlay on list)
  const handleClose = () => {
    redirect("/deals", undefined, undefined, undefined, {
      _scrollToTop: false,
    });
  };

  return (
    <Dialog open={open} onOpenChange={() => handleClose()}>
      <DialogContent className="lg:max-w-4xl p-4 overflow-y-auto max-h-9/10 top-1/20 translate-y-0">
        {id ? (
          <EditBase
            id={id}
            mutationMode="pessimistic"
            mutationOptions={{
              onSuccess: () => {
                notify("Deal updated");
                redirect(`/deals/${id}/show`, undefined, undefined, undefined, {
                  _scrollToTop: false,
                });
              },
            }}
          >
            <EditHeader />
            <Form>
              <DealInputs />
              <FormToolbar />
            </Form>
          </EditBase>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

const DealEditContentMobile = () => {
  const deal = useRecordContext<Deal>();
  if (!deal) return null;

  return (
    <>
      <MobileHeader>
        <MobileBackButton to={`/deals/${deal.id}/show`} />
        <h1 className="text-xl font-semibold truncate flex-1">
          Edit {deal.name}
        </h1>
      </MobileHeader>
      <MobileContent>
        <Form>
          <DealInputs />
          <FormToolbar />
        </Form>
      </MobileContent>
    </>
  );
};

function EditHeader() {
  const deal = useRecordContext<Deal>();
  if (!deal) {
    return null;
  }

  return (
    <DialogTitle className="pb-0">
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <ReferenceField source="company_id" reference="companies" link="show">
            <CompanyAvatar />
          </ReferenceField>
          <h2 className="text-2xl font-semibold">Edit {deal.name} deal</h2>
        </div>
        <div className="flex gap-2 pr-12">
          <DeleteButton />
          <Button asChild variant="outline" className="h-9">
            <Link to={`/deals/${deal.id}/show`}>Back to deal</Link>
          </Button>
        </div>
      </div>
    </DialogTitle>
  );
}
