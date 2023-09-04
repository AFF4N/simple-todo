import { Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Task } from 'src/app/models/task.model';
import { AddTodoComponent } from '../add-todo/add-todo.component';
import { ArchivedComponent } from '../archived/archived.component';
import { SettingsComponent } from '../settings/settings.component';
import { AboutComponent } from '../about/about.component';
import { TodoService } from 'src/app/services/todo.service';
import { trigger, transition, style, animate } from '@angular/animations';

export const taskAnimations = [
  trigger('slideInOut', [
    transition(':enter', [
      style({ transform: 'translateX(-100%)', opacity: 0 }),
      animate('300ms ease-in', style({ transform: 'translateX(0)', opacity: 1 })),
    ]),
    transition(':leave', [
      style({ transform: 'translateX(0)', opacity: 1 }),
      animate('300ms ease-out', style({ transform: 'translateX(100%)', opacity: 0 })),
    ]),
  ]),
];
@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  animations: [taskAnimations],
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

    let date = new Date();
    date.setHours(0, 0, 0, 0);
    this.incompleteTasks = this.incompleteTasks.filter((
      task) => new Date(task.dateCreated) >= new Date(date));
    this.completedTasks = this.completedTasks.filter((
      task) => new Date(task.dateCreated) >= new Date(date));

    let darkMode = localStorage.getItem("DarkMode");
    if( darkMode === 'true'){
      this.todoService.toggleDarkMode(true);
    }
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
