import { QueryBuilder } from "@/components/query-builder";

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12">
      <div className="container mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Query Builder</h1>
          <p className="mt-2 text-muted-foreground">
            Connect to your databases and analyze data with custom queries
          </p>
        </div>
        <QueryBuilder />
      </div>
    </main>
  );
}
