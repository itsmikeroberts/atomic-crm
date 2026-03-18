import { useListContext } from "ra-core";
import { List } from "@/components/admin/list";
import { TopToolbar } from "../layout/TopToolbar";
import { CreateButton } from "@/components/admin/create-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Link } from "react-router";
import type { QuoteTemplate } from "../types";

export const QuoteTemplateList = () => {
  return (
    <List
      actions={<QuoteTemplateListActions />}
      sort={{ field: "created_at", order: "DESC" }}
      perPage={25}
    >
      <QuoteTemplateGrid />
    </List>
  );
};

const QuoteTemplateGrid = () => {
  const { data, isPending } = useListContext<QuoteTemplate>();

  if (isPending) return <div>Loading...</div>;
  if (!data || data.length === 0) return <div>No templates found</div>;

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {data.map((template) => (
            <div
              key={template.id}
              className="p-4 flex items-center justify-between hover:bg-muted/50"
            >
              <div className="flex-1">
                <div className="font-medium">{template.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {template.created_at && (
                    <>Created: {new Date(template.created_at).toLocaleDateString()}</>
                  )}
                  {template.is_default && (
                    <span className="ml-2 text-primary font-medium">
                      (Default)
                    </span>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/quote_templates/${template.id}`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const QuoteTemplateListActions = () => {
  return (
    <TopToolbar>
      <CreateButton />
    </TopToolbar>
  );
};
