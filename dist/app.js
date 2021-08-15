"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
    ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
})(ProjectStatus || (ProjectStatus = {}));
class Project {
    constructor(id, title, description, manday, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.manday = manday;
        this.status = status;
    }
}
class State {
    constructor() {
        this.listeners = [];
    }
    addListener(listenerFn) {
        this.listeners.push(listenerFn);
    }
}
class ProjectState extends State {
    constructor() {
        super();
        this.project = [];
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    addProject(title, description, manday) {
        const newProject = new Project(Math.random().toString(), title, description, manday, ProjectStatus.Active);
        this.project.push(newProject);
        for (const listenerFn of this.listeners) {
            listenerFn(this.project.slice());
        }
    }
}
const projectState = ProjectState.getInstance();
function validate(validatableInput) {
    let isValid = true;
    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    if (validatableInput.minLength != null &&
        typeof validatableInput.value === "string") {
        isValid =
            isValid &&
                validatableInput.value.trim().length >= validatableInput.minLength;
    }
    if (validatableInput.maxLength &&
        typeof validatableInput.value === "string") {
        isValid =
            isValid &&
                validatableInput.value.trim().length <= validatableInput.maxLength;
    }
    if (validatableInput.min && typeof validatableInput.value === "number") {
        isValid = isValid && validatableInput.value >= validatableInput.min;
    }
    if (validatableInput.max && typeof validatableInput.value === "number") {
        isValid = isValid && validatableInput.value <= validatableInput.max;
    }
    return isValid;
}
function autobind(_target, _methodName, descriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        },
    };
    return adjDescriptor;
}
class Component {
    constructor(templateId, hostElementd, insertAtStart, newElemntId) {
        this.templeteElement = document.getElementById(templateId);
        this.hostElement = document.getElementById(hostElementd);
        const importedNode = document.importNode(this.templeteElement.content, true);
        this.element = importedNode.firstElementChild;
        if (newElemntId) {
            this.element.id = newElemntId;
        }
        this.attach(insertAtStart);
    }
    attach(insertAtBeginning) {
        this.hostElement.insertAdjacentElement(insertAtBeginning ? "afterbegin" : "beforeend", this.element);
    }
}
class ProjectItem extends Component {
    constructor(hostId, project) {
        super("single-project", hostId, true, project.id);
        this.project = project;
        this.renderContent();
    }
    configure() { }
    renderContent() {
        this.element.querySelector("h2").textContent = this.project.title;
        this.element.querySelector("h3").textContent =
            this.project.manday.toString();
        this.element.querySelector("p").textContent = this.project.description;
    }
}
class ProjectList extends Component {
    constructor(type) {
        super("project-list", "app", false, `${type}-projects`);
        this.type = type;
        this.assignedProjects = [];
        this.configure();
        this.renderContent();
    }
    configure() {
        projectState.addListener((projects) => {
            const relevantProjects = projects.filter((prj) => {
                if (this.type === "active") {
                    return prj.status === ProjectStatus.Active;
                }
                return prj.status === ProjectStatus.Finished;
            });
            this.assignedProjects = relevantProjects;
            this.renderProjects();
        });
    }
    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector("ul").id = listId;
        this.element.querySelector("h2").textContent =
            this.type === "active" ? "実行中プロジェクト" : "完了プロジェクト";
    }
    renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`);
        listEl.innerHTML = "";
        for (const prjItem of this.assignedProjects) {
            new ProjectItem(listEl.id, prjItem);
        }
    }
}
class ProjectInput extends Component {
    constructor() {
        super("project-input", "app", true, "user-input");
        this.titleInputElement = this.element.querySelector("#title");
        this.descriptionInputElement = this.element.querySelector("#description");
        this.mandayInputElement = this.element.querySelector("#manday");
        this.configure();
    }
    configure() {
        this.element.addEventListener("submit", this.submitHandler);
    }
    renderContent() { }
    gatherUserInput() {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredManday = this.mandayInputElement.value;
        const titleValidable = {
            value: enteredTitle,
            required: true,
        };
        const descriptionValidable = {
            value: enteredDescription,
            required: true,
            minLength: 5,
        };
        const mandayValidable = {
            value: +enteredManday,
            required: true,
            min: 1,
            max: 1000,
        };
        if (!validate(titleValidable) ||
            !validate(descriptionValidable) ||
            !validate(mandayValidable)) {
            console.log("入力値が正しくありません");
            return;
        }
        else {
            return [enteredTitle, enteredDescription, parseFloat(enteredManday)];
        }
    }
    submitHandler(event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, desc, manday] = userInput;
            projectState.addProject(title, desc, manday);
            this.clearInput();
        }
    }
    clearInput() {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.mandayInputElement.value = "";
    }
}
__decorate([
    autobind
], ProjectInput.prototype, "submitHandler", null);
const prjInput = new ProjectInput();
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");
//# sourceMappingURL=app.js.map