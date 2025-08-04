import { ProjectList } from "./components/ProjectList";
import type { ProjectData } from "./types/project";
import fs from "bare-fs";

// @ts-ignore
import path from "bare-path";

const styles = fs.readFileSync(path.join(__dirname, "styles.css"), "utf8");

export function App({ projects }: { projects: ProjectData[] }) {
  return (
    <>
      <style>{styles}</style>
      <div className="container">
        <header>
          <h1>Project List</h1>
          <p>Discover and vote on amazing projects</p>
        </header>
        <ProjectList projects={projects} />
      </div>
    </>
  );
}
