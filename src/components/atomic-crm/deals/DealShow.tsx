import { useMutation } from "@tanstack/react-query";
import { isValid } from "date-fns";
import { Archive, ArchiveRestore, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  ShowBase,
  useDataProvider,
  useNotify,
  useRecordContext,
  useRedirect,
  useRefresh,
  useUpdate,
} from "ra-core";
import { Link } from "react-router";
import { DeleteButton } from "@/components/admin/delete-button";
import { EditButton } from "@/components/admin/edit-button";
import { ReferenceArrayField } from "@/components/admin/reference-array-field";
import { ReferenceField } from "@/components/admin/reference-field";
import { ReferenceManyField } from "@/components/admin/reference-many-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

import { CompanyAvatar } from "../companies/CompanyAvatar";
import { GigMembers } from "../gig-members/GigMembers";
import { GigQuoteButton } from "../gigs/GigQuoteButton";
import { GigInvoiceButton } from "../gigs/GigInvoiceButton";
import { MobileBackButton } from "../misc/MobileBackButton";
import { MobileContent } from "../layout/MobileContent";
import MobileHeader from "../layout/MobileHeader";
import { NoteCreate } from "../notes/NoteCreate";
import { NotesIterator } from "../notes/NotesIterator";
import { useConfigurationContext } from "../root/ConfigurationContext";
import { GigSetLists } from "../setlists/GigSetLists";
import type { Deal, Gig } from "../types";
import { ContactList } from "./ContactList";
import { findDealLabel } from "./deal";
import { formatISODateString } from "./dealUtils";

export const DealShow = ({ open, id }: { open?: boolean; id?: string }) => {
  const isMobile = useIsMobile();
  const redirect = useRedirect();

  // On mobile, render full screen without Dialog (used as a route component)
  if (isMobile) {
    return (
      <ShowBase>
        <DealShowContentMobile />
      </ShowBase>
    );
  }

  // Desktop: existing Dialog implementation (used as overlay on list)
  const handleClose = () => {
    redirect("list", "deals");
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="lg:max-w-4xl p-4 overflow-y-auto max-h-9/10 top-1/20 translate-y-0">
        {id ? (
          <ShowBase id={id}>
            <DealShowContent />
          </ShowBase>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

const DealShowContentMobile = () => {
  const record = useRecordContext<Gig>();
  if (!record) return null;

  return (
    <>
      <MobileHeader>
        <MobileBackButton to="/deals" />
        <h1 className="text-xl font-semibold truncate flex-1">{record.name}</h1>
        {record.archived_at ? (
          <MobileArchivedActions record={record} />
        ) : (
          <MobileActions record={record} />
        )}
      </MobileHeader>
      <MobileContent>
        <DealShowContent />
      </MobileContent>
    </>
  );
};

const MobileActions = ({ record }: { record: Deal }) => {
  return (
    <>
      <Button
        asChild
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-full"
      >
        <Link to={`/deals/${record.id}`}>
          <Pencil className="size-5" />
          <span className="sr-only">Edit deal</span>
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreVertical className="size-5" />
            <span className="sr-only">More actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <ArchiveButtonMobile record={record} />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

const MobileArchivedActions = ({ record }: { record: Deal }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <MoreVertical className="size-5" />
          <span className="sr-only">More actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <UnarchiveButtonMobile record={record} />
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <DeleteButtonMobile />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const DealShowContent = () => {
  const { dealStages, dealCategories } = useConfigurationContext();
  const record = useRecordContext<Gig>();
  const isMobile = useIsMobile();
  if (!record) return null;

  return (
    <>
      <div className="space-y-2">
        {record.archived_at ? <ArchivedTitle /> : null}
        <div className="flex-1">
          {!isMobile && (
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <ReferenceField
                  source="company_id"
                  reference="companies"
                  link="show"
                >
                  <CompanyAvatar />
                </ReferenceField>
                <h2 className="text-2xl font-semibold">{record.name}</h2>
              </div>
              <div className={`flex gap-2 ${record.archived_at ? "" : "pr-12"}`}>
                {record.archived_at ? (
                  <>
                    <UnarchiveButton record={record} />
                    <DeleteButton />
                  </>
                ) : (
                  <>
                    <ArchiveButton record={record} />
                    <EditButton />
                  </>
                )}
              </div>
            </div>
          )}

          {isMobile && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <ReferenceField
                  source="company_id"
                  reference="companies"
                  link="show"
                >
                  <CompanyAvatar />
                </ReferenceField>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold">{record.name}</h2>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-8 m-4 flex-wrap">
            {record.performance_date && (
              <div className="flex flex-col mr-10">
                <span className="text-xs text-muted-foreground tracking-wide">
                  Performance Date
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {isValid(new Date(record.performance_date))
                      ? new Date(record.performance_date).toLocaleString()
                      : "Invalid date"}
                  </span>
                  {new Date(record.performance_date) < new Date() ? (
                    <Badge variant="secondary">Past</Badge>
                  ) : null}
                </div>
              </div>
            )}

            {record.venue_name && (
              <div className="flex flex-col mr-10">
                <span className="text-xs text-muted-foreground tracking-wide">
                  Venue
                </span>
                <span className="text-sm">{record.venue_name}</span>
              </div>
            )}

            <div className="flex flex-col mr-10">
              <span className="text-xs text-muted-foreground tracking-wide">
                Expected Booking Date
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {isValid(new Date(record.expected_closing_date))
                    ? formatISODateString(record.expected_closing_date)
                    : "Invalid date"}
                </span>
                {new Date(record.expected_closing_date) < new Date() ? (
                  <Badge variant="destructive">Past</Badge>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col mr-10">
              <span className="text-xs text-muted-foreground tracking-wide">
                Total Fee
              </span>
              <span className="text-sm">
                {record.amount.toLocaleString("en-US", {
                  notation: "compact",
                  style: "currency",
                  currency: "USD",
                  currencyDisplay: "narrowSymbol",
                  minimumSignificantDigits: 3,
                })}
              </span>
            </div>

            {record.category && (
              <div className="flex flex-col mr-10">
                <span className="text-xs text-muted-foreground tracking-wide">
                  Category
                </span>
                <span className="text-sm">
                  {dealCategories.find((c) => c.value === record.category)
                    ?.label ?? record.category}
                </span>
              </div>
            )}

            <div className="flex flex-col mr-10">
              <span className="text-xs text-muted-foreground tracking-wide">
                Stage
              </span>
              <span className="text-sm">
                {findDealLabel(dealStages, record.stage)}
              </span>
            </div>

            {record.set_count && (
              <div className="flex flex-col mr-10">
                <span className="text-xs text-muted-foreground tracking-wide">
                  Sets
                </span>
                <span className="text-sm">{record.set_count}</span>
              </div>
            )}
          </div>

          {!!record.contact_ids?.length && (
            <div className="m-4">
              <div className="flex flex-col min-h-12 mr-10">
                <span className="text-xs text-muted-foreground tracking-wide">
                  Contacts
                </span>
                <ReferenceArrayField
                  source="contact_ids"
                  reference="contacts_summary"
                >
                  <ContactList />
                </ReferenceArrayField>
              </div>
            </div>
          )}

          {record.description && (
            <div className="m-4 whitespace-pre-line">
              <span className="text-xs text-muted-foreground tracking-wide">
                Description
              </span>
              <p className="text-sm leading-6">{record.description}</p>
            </div>
          )}

          <div className="m-4">
            <div className="flex gap-2 mb-4">
              <GigQuoteButton />
              <GigInvoiceButton />
            </div>
          </div>

          <div className="m-4">
            <Separator className="mb-4" />
            <GigSetLists />
          </div>

          <div className="m-4">
            <Separator className="mb-4" />
            <GigMembers />
          </div>

          <div className="m-4">
            <Separator className="mb-4" />
            <ReferenceManyField
              target="deal_id"
              reference="deal_notes"
              sort={{ field: "date", order: "DESC" }}
              empty={<NoteCreate reference={"deals"} />}
            >
              <NotesIterator reference="deals" />
            </ReferenceManyField>
          </div>
        </div>
      </div>
    </>
  );
};

const ArchivedTitle = () => (
  <div className="bg-orange-500 px-6 py-4">
    <h3 className="text-lg font-bold text-white">Archived Deal</h3>
  </div>
);

const ArchiveButton = ({ record }: { record: Deal }) => {
  const [update] = useUpdate();
  const redirect = useRedirect();
  const notify = useNotify();
  const refresh = useRefresh();
  const handleClick = () => {
    update(
      "deals",
      {
        id: record.id,
        data: { archived_at: new Date().toISOString() },
        previousData: record,
      },
      {
        onSuccess: () => {
          redirect("list", "deals");
          notify("Deal archived", { type: "info", undoable: false });
          refresh();
        },
        onError: () => {
          notify("Error: deal not archived", { type: "error" });
        },
      },
    );
  };

  return (
    <Button
      onClick={handleClick}
      size="sm"
      variant="outline"
      className="flex items-center gap-2 h-9"
    >
      <Archive className="w-4 h-4" />
      Archive
    </Button>
  );
};

const UnarchiveButton = ({ record }: { record: Deal }) => {
  const dataProvider = useDataProvider();
  const redirect = useRedirect();
  const notify = useNotify();
  const refresh = useRefresh();

  const { mutate } = useMutation({
    mutationFn: () => dataProvider.unarchiveDeal(record),
    onSuccess: () => {
      redirect("list", "deals");
      notify("Deal unarchived", {
        type: "info",
        undoable: false,
      });
      refresh();
    },
    onError: () => {
      notify("Error: deal not unarchived", { type: "error" });
    },
  });

  const handleClick = () => {
    mutate();
  };

  return (
    <Button
      onClick={handleClick}
      size="sm"
      variant="outline"
      className="flex items-center gap-2 h-9"
    >
      <ArchiveRestore className="w-4 h-4" />
      Send back to the board
    </Button>
  );
};

const ArchiveButtonMobile = ({ record }: { record: Deal }) => {
  const [update] = useUpdate();
  const redirect = useRedirect();
  const notify = useNotify();
  const refresh = useRefresh();
  
  const handleClick = () => {
    update(
      "deals",
      {
        id: record.id,
        data: { archived_at: new Date().toISOString() },
        previousData: record,
      },
      {
        onSuccess: () => {
          redirect("list", "deals");
          notify("Deal archived", { type: "info", undoable: false });
          refresh();
        },
        onError: () => {
          notify("Error: deal not archived", { type: "error" });
        },
      },
    );
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 w-full cursor-pointer"
    >
      <Archive className="w-4 h-4" />
      Archive
    </button>
  );
};

const UnarchiveButtonMobile = ({ record }: { record: Deal }) => {
  const dataProvider = useDataProvider();
  const redirect = useRedirect();
  const notify = useNotify();
  const refresh = useRefresh();

  const { mutate } = useMutation({
    mutationFn: () => dataProvider.unarchiveDeal(record),
    onSuccess: () => {
      redirect("list", "deals");
      notify("Deal unarchived", {
        type: "info",
        undoable: false,
      });
      refresh();
    },
    onError: () => {
      notify("Error: deal not unarchived", { type: "error" });
    },
  });

  const handleClick = () => {
    mutate();
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 w-full cursor-pointer"
    >
      <ArchiveRestore className="w-4 h-4" />
      Unarchive
    </button>
  );
};

const DeleteButtonMobile = () => {
  const record = useRecordContext<Deal>();
  const redirect = useRedirect();
  const dataProvider = useDataProvider();
  const notify = useNotify();

  const { mutate } = useMutation({
    mutationFn: () => {
      if (!record) throw new Error("No record");
      return dataProvider.delete("deals", { id: record.id, previousData: record });
    },
    onSuccess: () => {
      redirect("list", "deals");
      notify("Deal deleted", { type: "info" });
    },
    onError: () => {
      notify("Error: deal not deleted", { type: "error" });
    },
  });

  const handleClick = () => {
    if (window.confirm("Are you sure you want to delete this deal?")) {
      mutate();
    }
  };

  if (!record) return null;

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 w-full cursor-pointer text-destructive"
    >
      <Trash2 className="w-4 h-4" />
      Delete
    </button>
  );
};
