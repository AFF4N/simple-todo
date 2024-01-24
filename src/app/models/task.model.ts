export class Task {
  id: string = '';
  name: string = '';
  note: string = '';
  checked: boolean = false;
  // status: string = '';
  emoji: any;
  archived: boolean = false;
  // dateCreated: Date = new Date();
  dateCreated: string = '';
}

export class GroupedTasks {
  [date: string]: Task[]; // Change `any[]` to the type of your task objects
}
