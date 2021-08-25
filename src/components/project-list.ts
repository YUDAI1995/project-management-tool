import Component from "./base-components.js";
import { DragTarget } from "../models/drag-drop.js";
import { Project, ProjectStatus } from "../models/project.js";
import { autobind } from "../decorators/autobind.js";
import { projectState } from "../state/project-state.js";
import { ProjectItem } from "./project-item.js";

// projectList Class
export class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  // Componentクラスにあるため削除
  // templeteElement: HTMLTemplateElement;
  // hostElement: HTMLDivElement;
  // element: HTMLElement;

  assignedProjects: Project[]; // リストに割り当てられたプロジェクト配列

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);

    // 不要
    // this.templeteElement = document.getElementById(
    //   "project-list"
    // )! as HTMLTemplateElement;

    //this.hostElement = document.getElementById("app")! as HTMLDivElement;
    this.assignedProjects = [];

    // 表示処理 // 不要
    // const importedNode = document.importNode(
    //   this.templeteElement.content,
    //   true
    // );

    // nodeのインポート //不要
    // this.element = importedNode.firstElementChild as HTMLElement;
    // this.element.id = `${this.type}-projects`;

    // リスナー関数
    this.configure();

    // 不要
    // this.attach();
    this.renderContent();
  }

  @autobind
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault();
      const listEl = this.element.querySelector("ul")!;
      listEl.classList.add("droppable");
    }
  }

  @autobind
  dropHandler(event: DragEvent) {
    const prjId = event.dataTransfer!.getData("text/plain");
    projectState.moveProject(
      prjId,
      this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }

  @autobind
  dragLeaveHandler(_event: DragEvent) {
    const listEl = this.element.querySelector("ul")!;
    listEl.classList.remove("droppable");
  }

  configure() {
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("drop", this.dropHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);

    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((prj) => {
        if (this.type === "active") {
          return prj.status === ProjectStatus.Active;
        }
        return prj.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects; // プロジェクトのリストを上書き
      this.renderProjects();
    });
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;

    this.element.querySelector("h2")!.textContent =
      this.type === "active" ? "実行中プロジェクト" : "完了プロジェクト";
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = "";
    for (const prjItem of this.assignedProjects) {
      new ProjectItem(listEl.id, prjItem);
      // const listItem = document.createElement("li");
      // listItem.textContent = prjItem.title;
      // listEl.appendChild(listItem);
    }
  }

  // 不要
  // private attach() {
  //   this.hostElement.insertAdjacentElement("beforeend", this.element);
  // }
}
