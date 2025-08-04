import type { ProjectData } from "../types/project";
import { VoteButtons } from "./VoteButtons";

export function Project(props: { project: ProjectData }) {
  const { project } = props;

  return (
    <div className="project-card" id={`project-${project.id}`}>
      <div className="project-header">
        <div className="project-logo">
          <span className="logo-emoji">{project.logo}</span>
        </div>
        <div className="project-info">
          <h3 className="project-title">{project.title}</h3>
          <p className="project-description">{project.description}</p>
        </div>
      </div>
      <div className="project-votes">
        <VoteButtons
          projectId={project.id}
          upvotes={project.upvotes}
          downvotes={project.downvotes}
        />
      </div>
    </div>
  );
}
