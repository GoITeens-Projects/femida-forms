import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, isAdmin } from "@/lib/auth";
import { getAllForms, getAllSubmissions } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  FileText,
  Users,
  BarChart3,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { CopyFormLinkButton } from "@/components/CopyFormLinkBtn";

const appURL = process.env.NEXT_PUBLIC_APP_URL ?? "https://forms.femidabot.com";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();

  if (!session || !isAdmin(session)) {
    redirect("/");
  }

  const forms = await getAllForms();
  const submissions = await getAllSubmissions();

  const stats = {
    totalForms: forms.length,
    totalSubmissions: submissions.length,
    recentSubmissions: submissions.slice(0, 5),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage forms and view submissions
          </p>
        </div>
        <Link href="/admin/forms/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Form
          </Button>
        </Link>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalForms}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Submissions
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalForms > 0
                ? Math.round(
                    (stats.totalSubmissions / stats.totalForms) * 100,
                  ) / 100
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">avg per form</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Forms</CardTitle>
            <CardDescription>Manage your forms</CardDescription>
          </CardHeader>
          <CardContent>
            {forms.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">
                No forms yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Fields</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forms.map((form) => (
                    <TableRow key={form.id}>
                      <TableCell className="font-medium">
                        {form.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{form.fields.length}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <CopyFormLinkButton url={appURL + `/forms/${form.id}`} />
                          <Link href={`/admin/forms/${form.id}/submissions`}>
                            <Button variant="ghost" size="icon-sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/forms/${form.id}/edit`}>
                            <Button variant="ghost" size="icon-sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>Latest form responses</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentSubmissions.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">
                No submissions yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Form</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">
                        {submission.user?.username || "Unknown"}
                      </TableCell>
                      <TableCell>
                        {submission.form?.title || "Unknown"}
                      </TableCell>
                      <TableCell>
                        {new Date(submission.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
