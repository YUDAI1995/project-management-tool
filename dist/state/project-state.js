import { Project, ProjectStatus } from '../models/project.js';
class State {
    constructor() {
        this.listeners = [];
    }
    addListener(listenerFn) {
        this.listeners.push(listenerFn);
    }
}
export class ProjectState extends State {
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
        this.updateLisners();
    }
    moveProject(projectId, newStatus) {
        const project = this.project.find((prj) => prj.id === projectId);
        if (project && project.status !== newStatus) {
            project.status = newStatus;
            this.updateLisners();
        }
    }
    updateLisners() {
        for (const listenerFn of this.listeners) {
            listenerFn(this.project.slice());
        }
    }
}
export const projectState = ProjectState.getInstance();
//# sourceMappingURL=project-state.js.map