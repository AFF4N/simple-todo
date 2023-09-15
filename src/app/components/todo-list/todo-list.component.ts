import { Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Task } from 'src/app/models/task.model';
import { AddTodoComponent } from '../add-todo/add-todo.component';
import { ArchivedComponent } from '../archived/archived.component';
import { SettingsComponent } from '../settings/settings.component';
import { AboutComponent } from '../about/about.component';
import { TodoService } from 'src/app/services/todo.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { CdkDragDrop, CdkDragEnd, CdkDragStart, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatSnackBar } from '@angular/material/snack-bar';

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

export const deleteBtnAnimation = [
  trigger('slideFromBottom', [
    transition(':enter', [
      style({ transform: 'translateY(200%)' }),
      animate('0.3s ease-out', style({ transform: 'translateY(-20%)' })),
    ]),
    transition(':leave', [
      style({ transform: 'translateY(-20%)' }),
      animate('0.3s ease-in', style({ transform: 'translateY(200%)' })),
    ]),
  ]),
]
@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  animations: [taskAnimations, deleteBtnAnimation],
})
export class TodoListComponent implements OnInit {
  todaysDate = new Date();
  isChecked: boolean = false;
  deleteBtn: boolean = false;
  disableAnimations: boolean = false;
  isDarkMode: boolean = false
  private readonly localStorageKey = 'DarkMode';

  deletedTask: Task | null = null;
  allTasks: Task[] = [];
  completedTasks: Task[] = [];
  incompleteTasks: Task[] = [];

  constructor(private bottomSheet: MatBottomSheet, private todoService: TodoService, private snackBar: MatSnackBar) {
    this.getDeviceTheme();
  }

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

    if(this.isDarkMode == true){
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

  onDragStarted(event: CdkDragStart) {
    // console.log('Dragging started:', event);
    this.deleteBtn = true;
  }

  onDragEnded(event: CdkDragEnd, task: any) {
    // console.log('Dragging ended:', event);
    // console.log('task:', task);
    this.deleteBtn = false
    this.disableAnimations = true;
    const dropPointElement = document.elementFromPoint(event.dropPoint.x, event.dropPoint.y);
    if (dropPointElement) {
      const dropReceiver = dropPointElement.closest('.drop-receiver');
      if (dropReceiver) {
        const dropEvent = new CustomEvent('_drop', {detail: task});
        dropReceiver.dispatchEvent(dropEvent);
      }
    }
    setTimeout(() => {
      this.disableAnimations = false;
    }, 100);
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
    // console.log('event.container:', event.container)
    this.incompleteTasks.forEach(task => task.checked = false);
    // console.log('Incomplete Tasks:', this.incompleteTasks);
    this.completedTasks.forEach(task => task.checked = true);
    // console.log('Completed Tasks:', this.completedTasks);
    this.todoService.updateStatusArrays();
    this.todoService.saveTasksToLocalStorage();
  }

  undoDelete() {
    if (this.deletedTask) {
      this.disableAnimations = true;
      this.todoService.restoreTask(this.deletedTask);
      this.deletedTask = null;
      setTimeout(() => {
        this.disableAnimations = false;
      }, 100);
      this.snackBar.open('The task was restored ♻️', 'OK', {
        duration: 2000,
        verticalPosition: 'top'
      });
    }
  }

  onDelete(event: any) {
    if(event){
      this.disableAnimations = true;
      let task = event.detail
      this.deletedTask = task;

      this.todoService.deleteTasks(task);
      setTimeout(() => {
        this.disableAnimations = false;
      }, 100);

      let snackBarRef = this.snackBar.open('The task was deleted 🗑️', 'Undo', {
        duration: 2000,
        verticalPosition: 'top'
      });
      snackBarRef.onAction().subscribe(() => {
        this.undoDelete();
      });

    }
  }

  getDeviceTheme(){
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Retrieve the theme preference from local storage
    const storedPreference = localStorage.getItem(this.localStorageKey);

    // Set the initial theme based on device preference or stored preference
    this.isDarkMode = storedPreference ? JSON.parse(storedPreference) : prefersDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Update the theme when the device's color scheme changes
      this.isDarkMode = e.matches;
      this.todoService.toggleDarkMode(this.isDarkMode);
    });
  }
}
