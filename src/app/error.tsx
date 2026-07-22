"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="max-w-md space-y-4 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-red-600">
          Something went wrong
        </p>
        <h1 className="text-2xl font-semibold">DECOHO could not load this page.</h1>
        <p className="text-sm text-neutral-500">{error.message}</p>
        <button
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
