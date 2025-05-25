import { ProjectList } from "~/app/_components/projects/ProjectList";
import { CreateProjectButton } from "~/app/_components/projects/CreateProjectButton";
import { createClient } from "~/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function ProjectsPage() {
  const supabase = createClient(await cookies());
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-sm text-gray-500">{session.user.email}</p>
        </div>
        <CreateProjectButton />
      </div>
      <ProjectList />
    </div>
  );
}
