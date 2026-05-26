import Link from "next/link";
import { getAllForms, getUnsubmittedValidForms } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FileText, ArrowRight, ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";
import { parseISO } from "date-fns";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();
  const forms = session && (await getUnsubmittedValidForms(session.id));

  return (
    <>
      <section
        className="relative text-center  bg-cover bg-center py-48 px-4"
        style={{
          backgroundImage: "var(--background-image-hero)",
        }}
      >
        <div className="absolute inset-0 bg-background/50" />
        <div className="container mx-auto relative z-2">
          <div className="mx-auto max-w-2xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Femida Forms
            </h1>
            <p className="text-lg text-muted-foreground">
              Приймай участь в конкурсах та опитуваннях на Discord-сервері
              GoITeens. Реєстрація через Discord обов'язкова
            </p>
            {!session && (
              <Link href="/login">
                <Button size="lg" className="mt-4">
                  Увійти через Discord
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {session && (
        <section className="py-12 px-4">
          <div className="container mx-auto ">
            <h2 className="mb-6 text-2xl font-semibold">Доступні форми</h2>
            {forms?.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    На жаль, зараз немає доступних форм
                  </p>
                  {session?.role === "ADMIN" && (
                    <Link href="/admin/forms/new" className="mt-4">
                      <Button>Створити форму</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {forms?.map((form) => (
                  <Link key={form.id} href={`/forms/${form.id}`}>
                    <Card className="h-full transition-colors hover:border-primary/50">
                      <CardHeader>
                        <div className="flex items-start gap-3">
                          <div className="rounded-md bg-primary/10 p-2">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">
                              {form.title}
                            </CardTitle>
                            {form.description && (
                              <CardDescription className="mt-1 line-clamp-2">
                                {form.description}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="mt-auto">
                        {form.expires_at && (
                          <p className="text-sm text-muted-foreground">
                            Відкрита до:{" "}
                            {format(
                              toZonedTime(
                                parseISO(form.expires_at!),
                                "Europe/Kyiv",
                              ),
                              "d MMMM yyyy HH:mm",
                              { locale: uk },
                            )}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {form.fields.length} пол
                          {form.fields.length >= 5
                            ? "ів"
                            : form.fields.length === 1
                              ? "е"
                              : "я"}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
