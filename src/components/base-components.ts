// Component Class
export default abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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