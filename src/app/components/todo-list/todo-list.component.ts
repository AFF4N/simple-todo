import { Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Task } from 'src/app/models/task.model';
import { AddTodoComponent } from '../add-todo/add-todo.component';
import { ArchivedComponent } from '../archived/archived.component';
import { SettingsComponent } from '../settings/settings.component';
import { AboutComponent } from '../about/about.component';
import { TodoService } from 'src/app/services/todo.service';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
})
export class TodoListComponent implements OnInit {
  todaysDate = new Date();
  isChecked: boolean = false;

  allTasks: Task[] = [];
  completedTasks: Task[] = [];
  incompleteTasks: Task[] = [];

  constructor(private bottomSheet: MatBottomSheet, private todoService: TodoService) {}

  ngOnInit() {
    this.todoService.allTasksSubject.subscribe(tasks => this.allTasks = tasks);
    this.todoService.completedTasksSubject.subscribe(completeTasks => this.completedTasks = completeTasks);
    this.todoService.incompleteTasksSubject.subscribe(incompleteTasks => this.incompleteTasks = incompleteTasks);
    console.log(this.allTasks)
  }

  toggleTaskStatus(task: Task) {
    this.todoService.toggleTaskStatus(task);
  }

  AddNewTask(){
    this.bottomSheet.open(AddTodoComponent);
  }

  openArchives() {
    this.bottomSheet.open(ArchivedComponent);
  }

  openSettings() {
    this.bottomSheet.open(SettingsComponent);
  }

  openAbout() {
    this.bottomSheet.open(AboutComponent);
  }
}
