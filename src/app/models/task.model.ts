export class Task {
  id: string = '';
  tags: any[] = [];
  type: string = '';
  name: string = '';
  note: string = '';
  checked: boolean = false;
  emoji: any;
  archived: boolean = false;
  dateCreated: string = '';
}

export class GroupedTasks {
  [date: string]: Task[];
}

export class AlertModel {
  type?: string = '';
  label: string = '';
  message: string = '';
  note?: string = '';
  btnLabelYes: string = '';
  btnLabelNo: string = '';
}
