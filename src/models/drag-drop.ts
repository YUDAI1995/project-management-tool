  // Drag & Drop
  export interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
  }

  export interface DragTarget {
    dragOverHandler(event: DragEvent): void; //ドラッグ&ドロップをしているときにその場所が有効なドロップ対象かを判断する
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
  }