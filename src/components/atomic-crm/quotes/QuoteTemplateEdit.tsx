import { required } from "ra-core";
import { Edit } from "@/components/admin/edit";
import { SimpleForm } from "@/components/admin/simple-form";
import { TextInput } from "@/components/admin/text-input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export const QuoteTemplateEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <Card className="w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <TextInput source="name" label="Template Name" validate={required()} />
              <TextInput
                source="body_html"
                label="Template Content (HTML)"
                multiline
                rows={15}
                validate={required()}
              />
              <TemplateVariablesHelp />
            </div>
          </CardContent>
        </Card>
      </SimpleForm>
    </Edit>
  );
};

const TemplateVariablesHelp = () => {
  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertDescription>
        <strong>Available Template Variables:</strong>
        <ul className="mt-2 ml-4 list-disc text-sm space-y-1">
          <li>
            <code>{"{{gig_name}}"}</code> - Gig/booking name
          </li>
          <li>
            <code>{"{{company_name}}"}</code> - Hiring company
          </li>
          <li>
            <code>{"{{venue_name}}"}</code> - Venue name
          </li>
          <li>
            <code>{"{{venue_city}}"}</code> - Venue city
          </li>
          <li>
            <code>{"{{venue_address}}"}</code> - Venue address
          </li>
          <li>
            <code>{"{{performance_date}}"}</code> - Formatted date
          </li>
          <li>
            <code>{"{{start_time}}"}</code> - Start time
          </li>
          <li>
            <code>{"{{end_time}}"}</code> - End time
          </li>
          <li>
            <code>{"{{fee}}"}</code> - Performance fee
          </li>
          <li>
            <code>{"{{deposit}}"}</code> - Deposit amount
          </li>
          <li>
            <code>{"{{set_count}}"}</code> - Number of sets
          </li>
          <li>
            <code>{"{{contact_name}}"}</code> - Primary contact name
          </li>
        </ul>
      </AlertDescription>
    </Alert>
  );
};
