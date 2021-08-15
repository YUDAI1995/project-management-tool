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
type Listener = (item: Project[]) => void;

// project State Management
class ProjectState {
  private listeners: Listener[] = [];
  private project: Project[] = [];
  private static instance: ProjectState; // インスタンスを保持するためのプロパティ

  // singleton: 必ずひとつのインスタンスしか存在しない とすることができる
  private constructor() {}

  // 常に新しいオブジェクトを使用できることを保証する
  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  // なにか変化が起きた時全てのlisters関数を呼び出す。
  addListener(listenerFn: Listener) {
    this.listeners.push(listenerFn);
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

// projectList Class
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
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

  configure() {
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
      const listItem = document.createElement("li");
      listItem.textContent = prjItem.title;

      listEl.appendChild(listItem);
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

  renderContent() {
    
  }

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
