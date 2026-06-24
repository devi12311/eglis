import { signInAdmin } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { normalizeLocale } from "@/lib/i18n/config";

const errors: Record<string, string> = {
  config: "Supabase env vars are missing. Fill .env.local before using admin.",
  credentials: "Supabase Auth rejected this email/password. Create the user in Authentication first, then add it to public.admins.",
  session: "Your admin session expired. Sign in again.",
  "not-allowed": "This user is not in the public.admins allowlist."
};

export default async function AdminLoginPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const { error } = await searchParams;
  const locale = normalizeLocale(rawLocale);
  const errorMessage = error ? errors[error] : null;

  return (
    <main className="grid min-h-screen place-items-center bg-caravan-cream p-5 text-on-background">
      <form action={signInAdmin} className="grid w-full max-w-md gap-6 border-2 border-on-background bg-surface p-6 shadow-hard">
        <input name="locale" type="hidden" value={locale} />
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-burnt-earth">Admin login</p>
          <h1 className="mt-3 font-display text-5xl font-black uppercase">Back office</h1>
        </div>
        {errorMessage ? (
          <p className="border-2 border-burnt-earth bg-caravan-cream p-3 text-sm font-bold text-burnt-earth">{errorMessage}</p>
        ) : null}
        <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
          Email
          <input className="border-0 border-b-2 border-on-background bg-transparent py-3 font-body text-base normal-case tracking-normal" name="email" required type="email" />
        </label>
        <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
          Password
          <input className="border-0 border-b-2 border-on-background bg-transparent py-3 font-body text-base normal-case tracking-normal" name="password" required type="password" />
        </label>
        <Button type="submit">Sign in</Button>
        <a className="font-mono text-xs uppercase tracking-[0.12em] text-burnt-earth" href={`/${locale}`}>
          Back to site
        </a>
      </form>
    </main>
  );
}
