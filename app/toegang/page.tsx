import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function login(formData: FormData) {
  "use server";
  const wachtwoord = formData.get("wachtwoord") as string;
  if (wachtwoord === process.env.SITE_PASSWORD) {
    cookies().set("site-auth", wachtwoord, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
    redirect("/");
  }
  redirect("/toegang?fout=1");
}

export default function ToegangPage({
  searchParams,
}: {
  searchParams: { fout?: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 w-full max-w-sm">
        <h1 className="text-lg font-bold text-gray-900 mb-1">Werfverslag App</h1>
        <p className="text-sm text-gray-500 mb-6">Voer het wachtwoord in om verder te gaan.</p>
        <form action={login} className="flex flex-col gap-3">
          <input
            type="password"
            name="wachtwoord"
            placeholder="Wachtwoord"
            autoFocus
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {searchParams.fout && (
            <p className="text-xs text-red-500">Wachtwoord onjuist. Probeer opnieuw.</p>
          )}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            Ga verder
          </button>
        </form>
      </div>
    </div>
  );
}
