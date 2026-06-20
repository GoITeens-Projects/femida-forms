"use client";
import {
  AlertCircleIcon,
  Calculator,
  ChevronRight,
  Flame,
  Medal,
  Trophy,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useState } from "react";
import { filterVotes } from "@/lib/filterVotes";
import {
  Contest,
  Submission,
  User,
  VoteResult,
  VoteWithRelations,
} from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { isAfter, parseISO } from "date-fns";
import { toZonedTime, format } from "date-fns-tz";
import clsx from "clsx";

const PLACES = [
  {
    key: "second",
    label: "2 місце",
    icon: <Medal className="h-4.5 w-4.5 text-gray-400" />,
    bgFrom: "#8a8a8a",
    bgTo: "#d4d4d4",
    badge: "bg-gray-100 text-gray-700",
    elevated: false,
  },
  {
    key: "first",
    label: "1 місце",
    icon: <Trophy className="h-4.5 w-4.5 text-amber-500" />,
    bgFrom: "#c9a84c",
    bgTo: "#f5d98b",
    badge: "bg-amber-100 text-amber-800",
    elevated: true,
  },
  {
    key: "third",
    label: "3 місце",
    icon: <Medal className="h-4.5 w-4.5 text-orange-400" />,
    bgFrom: "#a0522d",
    bgTo: "#d4845a",
    badge: "bg-orange-100 text-orange-800",
    elevated: false,
  },
] as const;

interface PodiumEntry {
  user: User;
  count: number;
}

export function PodiumCards({
  filteredVotes,
}: {
  filteredVotes: VoteResult[];
}) {
  const winners = filteredVotes
    .filter((r) => r.status.ok)
    .reduce<Record<string, PodiumEntry>>((acc, { vote }) => {
      const id = vote.submission_id;
      acc[id] ??= { user: vote.user, count: 0 };
      acc[id].count++;
      return acc;
    }, {});

  const [first, second, third] = Object.values(winners)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const entries: Record<string, PodiumEntry | undefined> = {
    first,
    second,
    third,
  };

  return (
    <div className="grid grid-cols-3 gap-3 items-end py-4">
      {PLACES.map(({ key, label, icon, bgFrom, bgTo, badge, elevated }) => {
        const entry = entries[key];
        const initials = entry?.user.username.slice(0, 2).toUpperCase() ?? "—";

        return (
          <div
            key={key}
            className={`rounded-xl border bg-background overflow-hidden flex flex-col ${elevated ? "" : "translate-y-4.5"}`}
          >
            <div
              className="relative flex items-center justify-center overflow-hidden"
              style={{ height: elevated ? 130 : 110 }}
            >
              {entry?.user.avatar && (
                <div
                  className="absolute inset-0 scale-125 blur-xl saturate-150 opacity-55"
                  style={{
                    backgroundImage: `url(${entry.user.avatar})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              )}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${bgFrom}, ${bgTo})`,
                  opacity: entry?.user.avatar ? 0 : 0.7,
                }}
              />
              <Avatar
                className="relative z-10 border-2 border-white/50"
                style={{
                  width: elevated ? 68 : 56,
                  height: elevated ? 68 : 56,
                }}
              >
                <AvatarImage src={entry?.user.avatar ?? undefined} />
                <AvatarFallback style={{ fontSize: elevated ? 24 : 18 }}>
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col p-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-tiny font-medium uppercase tracking-wide px-2 py-0.5 rounded-full mb-1.5 ${badge}`}
                >
                  {label}
                </span>
                {icon}
              </div>
              <span className="text-sm font-medium truncate">
                {entry?.user.username ?? "—"}
              </span>
              <span className="text-tiny font-medium truncate text-muted-foreground">
                {entry?.user.discord_id ?? "—"}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
                <Flame className="h-3 w-3" />
                {entry?.count ?? 0} голосів
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Expandable submission row ---

function SubmissionRow({
  submission,
  voteResults,
}: {
  submission: Submission;
  voteResults: VoteResult[];
}) {
  const [open, setOpen] = useState(false);

  const submissionVotes = voteResults.filter(
    (r) => r.vote.submission_id === submission.id,
  );
  const validCount = submissionVotes.filter((r) => r.status.ok).length;

  return (
    <>
      {/* Main submission row */}
      <TableRow
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => setOpen((v) => !v)}
      >
        <TableCell className="w-8 text-muted-foreground">
          {/* {open ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )} */}
          <ChevronRight
            className={clsx("h-4 w-4 transition", open && "rotate-90")}
          />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src={submission.user?.avatar ?? undefined} />
              <AvatarFallback>
                {submission.user?.username?.charAt(0)?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm">
                {submission.user?.username ?? "Невідомо"}
              </span>
              <span className="text-xs text-muted-foreground">
                {submission.user?.discord_id}
              </span>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <span className="flex items-center gap-1 text-sm">
            <Flame className="h-3.5 w-3.5 text-orange-400" />
            {validCount} / {submissionVotes.length}
          </span>
        </TableCell>
      </TableRow>

      {/* Expanded votes sub-table */}
      {open && (
        <TableRow className="bg-muted/30 hover:bg-muted/30">
          <TableCell colSpan={3} className="p-0">
            <div className="px-6 py-3 border-t">
              {submissionVotes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  Голосів немає
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="h-8 text-xs">Голосував</TableHead>
                      <TableHead className="h-8 text-xs">Зараховано</TableHead>
                      <TableHead className="h-8 text-xs">Причина</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissionVotes.map(({ vote, status }) => (
                      <TableRow key={vote.id}>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={vote.user?.avatar ?? undefined}
                              />
                              <AvatarFallback>
                                {vote.user?.username
                                  ?.charAt(0)
                                  ?.toUpperCase() ?? "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {vote.user?.username ?? "Невідомо"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {vote.user?.discord_id}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          {status.ok ? (
                            <Badge variant="default">Так</Badge>
                          ) : (
                            <Badge variant="destructive">Ні</Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-2 text-sm text-muted-foreground">
                          {status.reason ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// --- Main dialog ---

export function ContestResultDialog({
  allVotes,
  submissions,
  contest,
}: {
  allVotes: VoteWithRelations[];
  submissions: Submission[];
  contest: Contest | null;
}) {
  const [filteredVotes, setFilteredVotes] = useState<VoteResult[]>([]);

  const handleClick = () => {
    if (filteredVotes.length !== 0) return;
    setFilteredVotes(filterVotes(allVotes));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={handleClick}>
          <Calculator className="mr-2 h-4 w-4" />
          Розрахувати результати
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-xs sm:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Розраховані результати голосування</DialogTitle>
          <DialogDescription>
            Переможці та таблиця відфільтрованих голосів
          </DialogDescription>
        </DialogHeader>

        {contest && isAfter(parseISO(contest.ends_at), new Date()) && (
          <Alert>
            <AlertCircleIcon />
            <AlertTitle>Голосування ще не закінчено</AlertTitle>
            <AlertDescription>
              Прийом голосів триває до{" "}
              {format(
                toZonedTime(contest.ends_at, "Europe/Kiev"),
                "dd.MM.yyyy, HH:mm:ss",
                { timeZone: "Europe/Kiev" },
              )}
              . А отже, результат ще не остаточний
            </AlertDescription>
          </Alert>
        )}

        <PodiumCards filteredVotes={filteredVotes} />

        <ScrollArea className="max-h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Учасник</TableHead>
                <TableHead>Голоси (зарах. / всього)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <SubmissionRow
                  key={submission.id}
                  submission={submission}
                  voteResults={filteredVotes}
                />
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
