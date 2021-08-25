import { Project, ProjectStatus } from '../models/project.js';

// listenersのailias別名
type Listener<T> = (item: T[]) => void;
  
class State<T> {
  protected listeners: Listener<T>[] = []; // protected //継承先のクラスからはアクセス可　外部からはアクセス不可

  // なにか変化が起きた時全てのlisters関数を呼び出す。
  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

// project State Management
export class ProjectState extends State<Project> {
  private project: Project[] = [
    // {
    //   title: "test01",
    //   id: "0",
    //   description: "デフォルトの説明文です",
    //   manday: 1,
    //   status: 0,
    // },
  ];
  private static instance: ProjectState; // インスタンスを保持するためのプロパティ


  // singleton: 必ずひとつのインスタンスしか存在しない とすることができる
  private constructor() {
      super();
    }
  
    // 常に新しいオブジェクトを使用できることを保証する
    static getInstance() {
      if (this.instance) {
        return this.instance;
      }
      this.instance = new ProjectState();
      return this.instance;
    }
  
    addProject(title: string, description: string, manday: number) {
      const newProject = new Project(
        Math.random().toString(),
        title,
        description,
        manday,
        ProjectStatus.Active
      );
  
      this.project.push(newProject);
      this.updateLisners();
    }
  
    moveProject(projectId: string, newStatus: ProjectStatus) {
      const project = this.project.find((prj) => prj.id === projectId);
      if (project && project.status !== newStatus) {
        project.status = newStatus;
        this.updateLisners();
      }
    }
  
    private updateLisners() {
      for (const listenerFn of this.listeners) {
        listenerFn(this.project.slice());
      }
    }
  }
  
  // 状態管理インスタンス (グローバルかつ常にひとつだけであることを保証)
  export const projectState = ProjectState.getInstance();