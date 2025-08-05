import type { ProjectData } from "../types/project";
import { Project } from "./Project";

export function ProjectList({ projects }: { projects: ProjectData[] }) {
  return (
    <div className="flex flex-col gap-6">
      {projects.map((project) => (
        <Project key={project.id} project={project} />
      ))}
    </div>
  );
}
