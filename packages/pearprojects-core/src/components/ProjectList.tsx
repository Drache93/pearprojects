import type { ProjectData } from "../types/project";
import { Project } from "./Project";

export function ProjectList(props: { projects: ProjectData[] }) {
  return (
    <div className="project-list">
      {props.projects.map((project) => (
        <Project key={project.id} project={project} />
      ))}
    </div>
  );
}
