import { redirect } from "next/navigation";
import Link from "next/link";
import { toZonedTime, format } from "date-fns-tz";
import { getSession, isAdmin } from "@/lib/auth";
import {
  getContestByFormId,
  getFormById,
  getSubmissionsByFormId,
  getVotesByContestId,
  getVotesByFormId,
} from "@/lib/db";
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
import { CopyLinkButton } from "@/components/copy-link-btn";

export const dynamic = "force-dynamic";

interface VotesPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Результати голосування за роботи",
};

export default async function VotesPage({ params }: VotesPageProps) {
  const session = await getSession();

  if (!session || !isAdmin(session)) {
    redirect("/");
  }

  const { id } = await params;
  const form = await getFormById(id);

  if (!form) {
    redirect("/admin");
  }

  const votes = await getVotesByFormId(form.id);

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
            {votes.length} голос
            {votes.length === 1 ? "" : votes.length < 5 ? "и" : "ів"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Голоси</CardTitle>
          <CardDescription>
            Усі результати голосування за роботи, надіслані на цю форму
          </CardDescription>
        </CardHeader>
        <CardContent>
          {votes.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Поки що немає голосів
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="[&_td]:align-top">
                <TableHeader>
                  <TableRow>
                    <TableHead>Користувач</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Країна</TableHead>
                    <TableHead>Місто</TableHead>
                    <TableHead>ISP</TableHead>
                    <TableHead>Браузер</TableHead>
                    <TableHead>ОС</TableHead>
                    <TableHead>Мова</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {votes.map((vote) => (
                    <TableRow key={vote.id} className="align-top">
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={vote.user?.avatar || undefined} />
                            <AvatarFallback>
                              {vote.user?.username?.charAt(0)?.toUpperCase() ||
                                "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {vote.user?.username || "Невідомо"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {vote.user.discord_id}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {format(
                          toZonedTime(vote.created_at, "Europe/Kiev"),
                          "dd.MM.yyyy, HH:mm:ss",
                          { timeZone: "Europe/Kiev" },
                        )}
                      </TableCell>
                      <TableCell>
                        {vote.backend_fingerprint.geo.country},{" "}
                        {vote.backend_fingerprint.geo.region}
                      </TableCell>
                      <TableCell>{vote.backend_fingerprint.geo.city}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex flex-col">
                          <span>{vote.backend_fingerprint.asn.isp}</span>
                          <span className="text-xs text-muted-foreground">
                            {vote.backend_fingerprint.asn.ip}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {vote.backend_fingerprint.browser.name}{" "}
                        {vote.backend_fingerprint.browser.version}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {vote.backend_fingerprint.os.name}{" "}
                        {vote.backend_fingerprint.os.version}
                      </TableCell>
                      <TableCell>
                        {vote.backend_fingerprint.acceptLanguage ?? "—"}
                      </TableCell>
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
