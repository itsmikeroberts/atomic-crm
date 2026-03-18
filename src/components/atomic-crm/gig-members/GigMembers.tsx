import { useState, useEffect } from "react";
import {
  useDataProvider,
  useNotify,
  useRecordContext,
  useGetList,
} from "ra-core";
import { Plus, Check, X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Gig, GigMember, Sale } from "../types";

export const GigMembers = () => {
  const record = useRecordContext<Gig>();
  const [members, setMembers] = useState<GigMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const dataProvider = useDataProvider();
  const notify = useNotify();

  // Load available band members (sales/users)
  const { data: availableSales } = useGetList<Sale>("sales", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "first_name", order: "ASC" },
  });

  const loadMembers = async () => {
    if (!record?.id) return;

    try {
      setIsLoading(true);
      const { data } = await dataProvider.getList<GigMember>("gig_members", {
        pagination: { page: 1, perPage: 100 },
        sort: { field: "created_at", order: "ASC" },
        filter: { gig_id: record.id },
      });
      setMembers(data);
    } catch (error) {
      notify("Error loading gig members", { type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [record?.id]);

  const handleToggleConfirmed = async (member: GigMember) => {
    try {
      await dataProvider.update("gig_members", {
        id: member.id,
        data: { confirmed: !member.confirmed },
        previousData: member,
      });

      setMembers(
        members.map((m) =>
          m.id === member.id ? { ...m, confirmed: !m.confirmed } : m
        )
      );
      notify(
        member.confirmed
          ? "Member marked as unconfirmed"
          : "Member confirmed for gig",
        { type: "success" }
      );
    } catch (error) {
      notify("Error updating member status", { type: "error" });
    }
  };

  const handleRemoveMember = async (memberId: string | number) => {
    try {
      await dataProvider.delete("gig_members", {
        id: memberId,
        previousData: members.find((m) => m.id === memberId),
      });

      setMembers(members.filter((m) => m.id !== memberId));
      notify("Member removed from gig", { type: "success" });
    } catch (error) {
      notify("Error removing member", { type: "error" });
    }
  };

  if (!record) return null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Band Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Loading members...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Band Members</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Member
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <AddMemberForm
            gigId={record.id}
            existingMemberIds={members.map((m) => m.sales_id)}
            availableSales={availableSales || []}
            onAdd={(newMember) => {
              setMembers([...members, newMember]);
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No band members assigned yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">
                      {member.sales_name || "Unknown"}
                    </p>
                    {member.confirmed && (
                      <Badge variant="default" className="text-xs">
                        Confirmed
                      </Badge>
                    )}
                  </div>
                  {member.role && (
                    <p className="text-xs text-muted-foreground">
                      {member.role}
                    </p>
                  )}
                  {member.sales_email && (
                    <p className="text-xs text-muted-foreground">
                      {member.sales_email}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant={member.confirmed ? "default" : "outline"}
                    onClick={() => handleToggleConfirmed(member)}
                    title={
                      member.confirmed
                        ? "Mark as unconfirmed"
                        : "Mark as confirmed"
                    }
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface AddMemberFormProps {
  gigId: string | number;
  existingMemberIds: (string | number)[];
  availableSales: Sale[];
  onAdd: (member: GigMember) => void;
  onCancel: () => void;
}

const AddMemberForm = ({
  gigId,
  existingMemberIds,
  availableSales,
  onAdd,
  onCancel,
}: AddMemberFormProps) => {
  const [selectedSalesId, setSelectedSalesId] = useState<string>("");
  const [role, setRole] = useState("");
  const dataProvider = useDataProvider();
  const notify = useNotify();

  const availableMembers = availableSales.filter(
    (sale) => !existingMemberIds.includes(sale.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSalesId) {
      notify("Please select a band member", { type: "warning" });
      return;
    }

    try {
      const selectedSale = availableSales.find(
        (s) => s.id.toString() === selectedSalesId
      );

      const { data: newMember } = await dataProvider.create<GigMember>(
        "gig_members",
        {
          data: {
            gig_id: gigId,
            sales_id: selectedSalesId,
            role: role || undefined,
            confirmed: false,
          },
        }
      );

      // Enrich with sales data
      const enrichedMember: GigMember = {
        ...newMember,
        sales_name: selectedSale
          ? `${selectedSale.first_name} ${selectedSale.last_name}`
          : undefined,
        sales_email: selectedSale?.email,
      };

      onAdd(enrichedMember);
      notify("Band member added to gig", { type: "success" });
    } catch (error) {
      notify("Error adding band member", { type: "error" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mb-4 p-4 border rounded-lg bg-muted/50">
      <div className="space-y-2">
        <label className="text-sm font-medium">Band Member</label>
        <Select value={selectedSalesId} onValueChange={setSelectedSalesId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a member..." />
          </SelectTrigger>
          <SelectContent>
            {availableMembers.map((sale) => (
              <SelectItem key={sale.id} value={sale.id.toString()}>
                {sale.first_name} {sale.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Role (optional)</label>
        <Input
          placeholder="e.g., Lead Guitar, Dep, etc."
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm">
          Add Member
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
