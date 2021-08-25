export default class Component {
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
//# sourceMappingURL=base-components.js.map