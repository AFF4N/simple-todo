import { Component, OnInit } from '@angular/core';
import { Task } from 'src/app/models/task.model';
import { TodoService } from 'src/app/services/todo.service';

@Component({
  selector: 'app-archived',
  templateUrl: './archived.component.html',
  styleUrls: ['./archived.component.css']
})
export class ArchivedComponent implements OnInit {

  archivedTasks: Task[] = [];

  constructor(private todoService: TodoService) { }

  ngOnInit() {
    this.todoService.archivedTasksSubject.subscribe(archived => this.archivedTasks = archived);
    // console.log(this.archivedTasks)
  }

}
