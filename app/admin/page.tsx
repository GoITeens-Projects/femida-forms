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
import { Plus, FileText, Users, BarChart3, Pencil, Table2 } from "lucide-react";
import { CopyFormLinkButton } from "@/components/copy-form-link-btn";
import { DeleteFormButton } from "@/components/delete-form-btn";
import { DuplicateFormButton } from "@/components/duplicate-form-btn";
import { DesktopTooltip } from "@/components/ui/desktop-tooltip";

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
          <h1 className="text-3xl font-bold">Адмін панель</h1>
          <p className="text-muted-foreground">
            Управління формами та перегляд надісланих відповідей
          </p>
        </div>
        <Link href="/admin/forms/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Створити форму
          </Button>
        </Link>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Загальна кількість форм
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.totalForms}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Загальна кількість відповідей
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.totalSubmissions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Кількість відповідей
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {stats.totalForms > 0
                ? Math.round(
                    (stats.totalSubmissions / stats.totalForms) * 100,
                  ) / 100
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              середнє значення на форму
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Форми</CardTitle>
            <CardDescription>Керуйте своїми формами</CardDescription>
          </CardHeader>
          <CardContent>
            {forms.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">
                Поки що немає форм
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Назва</TableHead>
                    <TableHead>Поля</TableHead>
                    <TableHead className="text-right">Дії</TableHead>
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
                          <DesktopTooltip content="Скопіювати посилання">
                            <div>
                              <CopyFormLinkButton
                                url={appURL + `/forms/${form.id}`}
                              />
                            </div>
                          </DesktopTooltip>

                          <DesktopTooltip content="Відповіді">
                            <Link href={`/admin/forms/${form.id}/submissions`}>
                              <Button variant="ghost" size="icon-sm">
                                <Table2 className="h-4 w-4" />
                              </Button>
                            </Link>
                          </DesktopTooltip>

                          <DesktopTooltip content="Створити дублікат">
                            <div>
                              <DuplicateFormButton formId={form.id} />
                            </div>
                          </DesktopTooltip>

                          <DesktopTooltip content="Редагувати">
                            <Link href={`/admin/forms/${form.id}/edit`}>
                              <Button variant="ghost" size="icon-sm">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                          </DesktopTooltip>

                          <DesktopTooltip content="Видалити" >
                            <div>
                              <DeleteFormButton
                                formId={form.id}
                                formTitle={form.title}
                              />
                            </div>
                          </DesktopTooltip>
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
            <CardTitle>Нещодавні відповіді</CardTitle>
            <CardDescription>Останні відповіді на форму</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentSubmissions.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">
                Поки що немає відповідей
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Користувач</TableHead>
                    <TableHead>Форма</TableHead>
                    <TableHead>Дата</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">
                        {submission.user?.username || "Невідомо"}
                      </TableCell>
                      <TableCell>
                        {submission.form?.title || "Невідомо"}
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
