var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import Component from './base-components.js';
import { autobind } from '../decorators/autobind.js';
export class ProjectItem extends Component {
    constructor(hostId, project) {
        super("single-project", hostId, true, project.id);
        this.project = project;
        this.renderContent();
        this.configure();
    }
    get manday() {
        if (this.project.manday < 20) {
            return this.project.manday.toString() + "人日";
        }
        else if (this.project.manday % 20 === 0) {
            return (this.project.manday / 20).toString() + "人月";
        }
        else {
            return (Math.floor(this.project.manday / 20).toString() +
                "人月, " +
                (this.project.manday % 20) +
                "人日");
        }
    }
    dragStartHandler(event) {
        event.dataTransfer.setData("text/plain", this.project.id);
        event.dataTransfer.effectAllowed = "move";
    }
    dragEndHandler(_event) {
        console.log("drag終了");
    }
    configure() {
        this.element.addEventListener("dragstart", this.dragStartHandler);
        this.element.addEventListener("dragend", this.dragEndHandler);
    }
    renderContent() {
        this.element.querySelector("h2").textContent = this.project.title;
        this.element.querySelector("h3").textContent = this.manday;
        this.element.querySelector("p").textContent = this.project.description;
    }
}
__decorate([
    autobind
], ProjectItem.prototype, "dragStartHandler", null);
__decorate([
    autobind
], ProjectItem.prototype, "dragEndHandler", null);
//# sourceMappingURL=project-item.js.map