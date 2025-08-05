import { ProjectList } from "./components/ProjectList";
import type { ProjectData } from "./types/project";
import fs from "bare-fs";

// @ts-ignore
import path from "bare-path";

const stylesPath = path.join(__dirname, "../dist", "output.css");
console.log("stylesPath: ", stylesPath);
const styles = fs.readFileSync(stylesPath, "utf8");

export function App({ projects }: { projects: ProjectData[] }) {
  return (
    <>
      <style>{styles}</style>
      <ProjectList projects={projects} />
    </>
  );
}
