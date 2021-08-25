import Component from './base-components.js';
import { Project } from '../models/project.js';
import { Draggable } from '../models/drag-drop.js'
import { autobind } from '../decorators/autobind.js'

// project Item class
export class ProjectItem
extends Component<HTMLUListElement, HTMLLIElement>
implements Draggable
{
private project: Project;

// getterメソッド: なにかデータを取得した時のなにかの処理を加えることができる
get manday() {
  if (this.project.manday < 20) {
    return this.project.manday.toString() + "人日";
  } else if (this.project.manday % 20 === 0) {
    return (this.project.manday / 20).toString() + "人月";
  } else {
    return (
      Math.floor(this.project.manday / 20).toString() +
      "人月, " +
      (this.project.manday % 20) +
      "人日"
    );
  }
}

constructor(hostId: string, project: Project) {
  super("single-project", hostId, true, project.id);
  this.project = project;

  this.renderContent();

  this.configure();
}

@autobind
dragStartHandler(event: DragEvent) {
  event.dataTransfer!.setData("text/plain", this.project.id); //datatransfer: drag&dropイベントに特別に存在するプロパティ
  event.dataTransfer!.effectAllowed = "move"; //ブラウザでカーソルがどのように表示されるか管理するためのもの。ブラウザにAからBに移動している、ということを伝える
}

@autobind
dragEndHandler(_event: DragEvent) {
  console.log("drag終了");
}

configure() {
  this.element.addEventListener("dragstart", this.dragStartHandler);
  this.element.addEventListener("dragend", this.dragEndHandler);
}

renderContent() {
  this.element.querySelector("h2")!.textContent = this.project.title;
  this.element.querySelector("h3")!.textContent = this.manday; // getterは関数のように扱われる
  this.element.querySelector("p")!.textContent = this.project.description;
}
}