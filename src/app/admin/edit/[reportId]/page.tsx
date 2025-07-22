import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function EditReportPage({ params }: { params: { reportId: string } }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Edit Report</CardTitle>
          <CardDescription>
            Editing report with ID: {params.reportId}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            The form to edit this report would go here. This is a placeholder page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
