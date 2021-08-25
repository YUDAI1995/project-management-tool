import Component from './base-components.js';
import * as Validation from '../util/validation.js';
import { autobind } from '../decorators/autobind.js';
import { projectState } from '../state/project-state.js';

// project input class
export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
    const titleValidable: Validation.Validatable = {
      value: enteredTitle,
      required: true,
    };

    const descriptionValidable: Validation.Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    };

    const mandayValidable: Validation.Validatable = {
      value: +enteredManday,
      required: true,
      min: 1,
      max: 1000,
    };

    if (
      !Validation.validate(titleValidable) ||
      !Validation.validate(descriptionValidable) ||
      !Validation.validate(mandayValidable)
    ) {
      alert("入力値が正しくありません");
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