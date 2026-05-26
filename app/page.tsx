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

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();
  const forms = session && (await getUnsubmittedValidForms(session.id));

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12 text-center">
        <div className="mx-auto max-w-2xl space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Femida Forms
          </h1>
          <p className="text-lg text-muted-foreground">
            Create, customize, and collect responses with our powerful form
            builder. Sign in with Discord to get started.
          </p>
          {!session && (
            <Link href="/login">
              <Button size="lg" className="mt-4">
                Sign In with Discord
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {session && (
        <section>
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
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {form.fields.length} field
                        {form.fields.length !== 1 ? "s" : ""}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
