// Drag & Drop
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void; //ドラッグ&ドロップをしているときにその場所が有効なドロップ対象かを判断する
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

// project Type
enum ProjectStatus {
  Active,
  Finished,
}
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public manday: number,
    public status: ProjectStatus
  ) {}
}

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
class ProjectState extends State<Project> {
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
const projectState = ProjectState.getInstance();

// Valldation
interface Validatable {
  value: string | number;
  required?: boolean;
  //required: boolean | undefined; //undefinedとしても基本的には同じ : 任意のプロパティとすることができる

  maxLength?: number;
  minLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable) {
  let isValid = true;

  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    //console.log(validatableInput.value + ': 未入力の項目があります');
  }

  if (
    validatableInput.minLength != null && // null はnull とundefinedを含む 0はチェックの対象になる
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid &&
      validatableInput.value.trim().length >= validatableInput.minLength;
    //isValid ? console.log(validatableInput.value + ': 文字が短すぎます') : false
  }

  if (
    validatableInput.maxLength &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid &&
      validatableInput.value.trim().length <= validatableInput.maxLength;
    //isValid ? console.log((validatableInput.value + ':文字数が長すぎます')) : false
  }

  if (validatableInput.min && typeof validatableInput.value === "number") {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }

  if (validatableInput.max && typeof validatableInput.value === "number") {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }
  return isValid;
}

// autobind decorator
function autobind(
  _target: any,
  _methodName: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };

  return adjDescriptor;
}

// Component Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templeteElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementd: string,
    insertAtStart: boolean,
    newElemntId?: string
  ) {
    this.templeteElement = document.getElementById(
      templateId
    )! as HTMLTemplateElement;

    this.hostElement = document.getElementById(hostElementd)! as T;

    const importedNode = document.importNode(
      this.templeteElement.content,
      true
    ); // nodeのインポート
    this.element = importedNode.firstElementChild as U;

    if (newElemntId) {
      this.element.id = newElemntId;
    }

    this.attach(insertAtStart);
  }

  abstract configure(): void;
  abstract renderContent(): void;

  private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtBeginning ? "afterbegin" : "beforeend",
      this.element
    );
  }
}

// project Item class
class ProjectItem
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

// projectList Class
class ProjectList
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

// project input class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  // templeteElement: HTMLTemplateElement;
  // hostElement: HTMLDivElement; // このプロジェクト（フォーム）を表示させたい場所
  // addElement: HTMLFormElement;

  // DOM要素
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  mandayInputElement: HTMLInputElement;

  // constructorは要素への参照の取得
  constructor() {
    super("project-input", "app", true, "user-input");
    // this.templeteElement = document.getElementById(
    //   "project-input"
    // )! as HTMLTemplateElement;
    // this.hostElement = document.getElementById("app")! as HTMLDivElement;

    // フォームの表示処理
    // const importedNode = document.importNode(
    //   this.templeteElement.content,
    //   true
    // );
    // nodeのインポート
    // this.addElement = importedNode.firstElementChild as HTMLFormElement;
    // this.addElement.id = "user-input";

    // DOM入力要素の取得
    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.mandayInputElement = this.element.querySelector(
      "#manday"
    ) as HTMLInputElement;

    this.configure();
    // this.attach();
  }

  // イベントリスナーの設定
  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  renderContent() {}

  // 3つの入力値のバリデーション
  private gatherUserInput(): [string, string, number] | void {
    // tuple: 特定の個数の配列 を返す。
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredManday = this.mandayInputElement.value;

    //再利用可能なスケーラブルなバリデーションの作成
    const titleValidable: Validatable = {
      value: enteredTitle,
      required: true,
    };

    const descriptionValidable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    };

    const mandayValidable: Validatable = {
      value: +enteredManday,
      required: true,
      min: 1,
      max: 1000,
    };

    if (
      !validate(titleValidable) ||
      !validate(descriptionValidable) ||
      !validate(mandayValidable)
    ) {
      console.log("入力値が正しくありません");
      return;
    } else {
      return [enteredTitle, enteredDescription, parseFloat(enteredManday)];
    }
  }

  // configure()に対するレシーバ関数
  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();

    const userInput = this.gatherUserInput();
    //console.log(userInput);

    // tupleかどうかをチェックする (戻り値が配列かどうかをチェックすることができればよい)
    if (Array.isArray(userInput)) {
      const [title, desc, manday] = userInput;
      projectState.addProject(title, desc, manday);
      this.clearInput();
    }
  }

  private clearInput() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.mandayInputElement.value = "";
  }

  // 要素の追加
  // private attach() {
  //   //console.log(this.addElement);
  //   this.hostElement.insertAdjacentElement("afterbegin", this.element);
  // }
}

const prjInput = new ProjectInput();
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");
