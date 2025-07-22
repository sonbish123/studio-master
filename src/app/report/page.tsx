
import { ReportForm } from "@/components/report-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Shield } from "lucide-react";
import Link from "next/link";

export default async function ReportPage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background font-body py-8 sm:py-12 md:py-16">
      <div className="w-full max-w-4xl px-4">
        <Card className="shadow-lg border-2 border-primary/10">
          <CardHeader className="bg-card-foreground/5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="bg-primary p-3 rounded-lg text-primary-foreground">
                <Building2 className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl md:text-3xl font-headline text-primary">
                  Daily Progress Tracker
                </CardTitle>
                <CardDescription className="text-base md:text-lg text-muted-foreground mt-1">
                  Submit your daily inspection and certification report.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline">
                  <Link href="/admin">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <ReportForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
