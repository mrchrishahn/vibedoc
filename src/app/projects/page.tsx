import { ProjectList } from "~/app/_components/projects/ProjectList";
import { CreateProjectButton } from "~/app/_components/projects/CreateProjectButton";

export default function ProjectsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Projects</h1>
        <CreateProjectButton />
      </div>
      <ProjectList />
    </div>
  );
}
