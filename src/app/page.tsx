import { createClient } from "~/utils/supabase/client";
import { redirect } from "next/navigation";
import { LoginForm } from "./_components/LoginForm";

export default async function Home() {
  const supabase = createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-[3rem]">
            Welcome to <span className="text-indigo-600">VibeDoc</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Let the AI help you with your documentation
          </p>
        </div>
        
        <div className="w-full max-w-md rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
