import { Component, OnInit } from '@angular/core';
import { GroupedTasks, Task } from 'src/app/models/task.model';
import { TodoService } from 'src/app/services/todo.service';

@Component({
  selector: 'app-archived',
  templateUrl: './archived.component.html',
  styleUrls: ['./archived.component.scss']
})

export class ArchivedComponent implements OnInit {

  archivedTasks: Task[] = [];
  groupedTasks: GroupedTasks = {};
  isEmpty: boolean = false;
  // groupedTasks: { [key: string]: any[] } = {};

  constructor(private todoService: TodoService) { }

  ngOnInit() {
    this.todoService.archivedTasksSubject.subscribe(archived => this.archivedTasks = archived);
    this.archivedTasks.forEach(task => {
      const date = task.dateCreated; // Convert Date to string
      if (!this.groupedTasks[date]) {
        this.groupedTasks[date] = [];
      }
      this.groupedTasks[date].push(task);
    });

    // console.log(this.groupedTasks);
    this.isEmpty = Object.keys(this.groupedTasks).length === 0;
  }

  getGroupedTaskDates(): string[] {
    return Object.keys(this.groupedTasks);
  }

}
