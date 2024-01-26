export class Task {
  id: string = '';
  type: string = '';
  name: string = '';
  note: string = '';
  checked: boolean = false;
  emoji: any;
  archived: boolean = false;
  dateCreated: string = '';
}

export class GroupedTasks {
  [date: string]: Task[]; // Change `any[]` to the type of your task objects
}
