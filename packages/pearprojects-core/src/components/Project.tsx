import type { ProjectData } from "../types/project";
import { VoteButtons } from "./VoteButtons";

export function Project({ project }: { project: ProjectData }) {
  return (
    <div className="bg-slate-700 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border">
      <div className="flex flex-col sm:flex-row">
        <div className="p-4 bg-dark-purple flex items-center justify-center">
          <span className="text-4xl font-bold text-deep-blue">
            {project.logo}
          </span>
        </div>
        <div className="p-4 flex flex-col sm:flex-row flex-grow items-start sm:items-center justify-between w-full">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-white mb-2 truncate">
              {project.title}
            </h3>
            <p className="text-gray-300 mb-0 text-base leading-relaxed">
              {project.description}
            </p>
          </div>
        </div>
        <div className="sm:mt-0 sm:ml-6 flex-shrink-0 flex items-center px-4">
          <VoteButtons
            projectId={project.id}
            upvotes={project.upvotes}
            downvotes={project.downvotes}
          />
        </div>
      </div>
    </div>
  );
}
