
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getReports, getCurrentUser } from "@/app/actions";
import { AdminHeader } from "./admin-header";
import { ReportsTable } from "./reports-table";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const reports = await getReports();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <AdminHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">
            Administrator Dashboard
          </h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>
              View, search, filter, and manage all submitted reports.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReportsTable reports={reports} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
