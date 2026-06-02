import { redirect } from "next/navigation";
import Link from "next/link";
import { toZonedTime, format } from "date-fns-tz";
import { getSession, isAdmin } from "@/lib/auth";
import { getFormById, getSubmissionsByFormId } from "@/lib/db";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import type { FormField } from "@/lib/types";

export const dynamic = "force-dynamic";

interface SubmissionsPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Відповіді на форму",
};

export default async function SubmissionsPage({
  params,
}: SubmissionsPageProps) {
  const session = await getSession();

  if (!session || !isAdmin(session)) {
    redirect("/");
  }

  const { id } = await params;
  const form = await getFormById(id);

  if (!form) {
    redirect("/admin");
  }

  const submissions = await getSubmissionsByFormId(id);

  const exportToCSV = () => {
    const headers = ["Користувач", "Дата", ...form.fields.map((f) => f.label)];
    const rows = submissions.map((s) => [
      s.user?.username || "Невідомо",
      new Date(s.created_at).toISOString(),
      ...form.fields.map((f) => {
        const value = s.answers[f.id];
        if (typeof value === "boolean") return value ? "Yes" : "No";
        if (Array.isArray(value)) return value.join(", ");
        return String(value || "");
      }),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map((c) => `"${c}"`).join(",")),
    ].join("\n");
    return `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
  };

  const renderAnswer = (
    field: FormField,
    answer: string | string[] | boolean | undefined,
  ) => {
    if (answer === undefined || answer === null || answer === "") {
      return <span className="text-muted-foreground">-</span>;
    }

    if (typeof answer === "boolean") {
      return answer ? "Так" : "Ні";
    }

    if (field.type === "FILE" && typeof answer === "string") {
      return (
        <a
          href={answer}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          Дивитись файл
          <ExternalLink className="h-3 w-3" />
        </a>
      );
    }

    if (field.type === "LINK") {
      return Array.isArray(answer) ? (
        <div className="flex flex-col gap-1">
          {answer.map((l, i) => (
            <a
              key={"linkf" + i}
              href={l}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline  max-w-60"
            >
              <span className="truncate">{l}</span>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          ))}
        </div>
      ) : (
        <a
          href={answer}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          {answer}
          <ExternalLink className="h-3 w-3" />
        </a>
      );
    }

    if (Array.isArray(answer)) {
      return answer.join(", ");
    }

    return String(answer);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href="/admin"
            className="mb-2 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Назад до Адмін панелі
          </Link>
          <h1 className="text-3xl font-bold">{form.title}</h1>
          <p className="text-muted-foreground">
            {submissions.length} відповід{submissions.length !== 1 ? "і" : "ь"}
          </p>
        </div>
        {submissions.length > 0 && (
          <a href={exportToCSV()} download={`${form.title}-submissions.csv`}>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Експортувати в CSV
            </Button>
          </a>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Відповіді</CardTitle>
          <CardDescription>Усі відповіді на цю форму</CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Поки що немає відповідей
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="[&_td]:align-top">
                <TableHeader>
                  <TableRow>
                    <TableHead className="">Discord ID</TableHead>
                    <TableHead className="">Користувач</TableHead>
                    <TableHead>Дата</TableHead>
                    {form.fields.map((field) => (
                      <TableHead key={field.id}>{field.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id} className="align-top">
                      <TableCell>{submission.user.discord_id}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={submission.user?.avatar || undefined}
                            />
                            <AvatarFallback>
                              {submission.user?.username
                                ?.charAt(0)
                                ?.toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {submission.user?.username || "Невідомо"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {format(
                          toZonedTime(submission.created_at, "Europe/Kiev"),
                          "dd.MM.yyyy, HH:mm:ss",
                          { timeZone: "Europe/Kiev" },
                        )}
                      </TableCell>
                      {form.fields.map((field) => (
                        <TableCell key={field.id}>
                          {renderAnswer(field, submission.answers[field.id])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
