import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';
import { BehaviorSubject } from 'rxjs';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  allTasks: Task[] = [];
  completedTasks: Task[] = [];
  incompleteTasks: Task[] = [];
  futureTasks: Task[] = [];
  archivedTasks: Task[] = [];
  themeSwitch: string = '';

  themeSwitchSubject = new BehaviorSubject<any>(this.themeSwitch);
  allTasksSubject = new BehaviorSubject<Task[]>(this.allTasks);
  completedTasksSubject = new BehaviorSubject<Task[]>(this.completedTasks);
  incompleteTasksSubject = new BehaviorSubject<Task[]>(this.incompleteTasks);
  futureTasksSubject = new BehaviorSubject<Task[]>(this.futureTasks);
  archivedTasksSubject = new BehaviorSubject<Task[]>(this.archivedTasks);

  constructor() {
    this.loadTasksFromLocalStorage();
  }

  loadTasksFromLocalStorage() {
    const tasksData = localStorage.getItem('tasks');
    const dayStart = moment().startOf('day');
    const dayEnd = moment().endOf('day');
    if (tasksData) {
      this.allTasks = [...JSON.parse(tasksData)];
      this.allTasks = this.allTasks.map((task) => {
        const taskDate = moment(task.dateCreated);
        if(taskDate.isBefore(dayEnd) || taskDate.isAfter(dayStart)) {
          task.type = 'today';
          task.archived = false;
        }
        if(taskDate.isBefore(dayStart)) {
          task.type = 'archived';
          task.archived = true;
        }
        if(taskDate.isAfter(dayEnd)) {
          task.type = 'future';
          task.archived = false;
        }
        return task;
      });
      this.updateStatusArrays();
    }
  }

  saveTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(this.allTasks));
  }

  deleteAllTasksfromLocalStorage() {
    localStorage.removeItem('tasks');
    location.reload();
  }

  addTask(task: Task) {
    this.allTasks.push(task);
    this.updateStatusArrays();
    this.saveTasksToLocalStorage();
  }

  updateTask(task: Task) {
    const index = this.allTasks.findIndex(todo => todo.id === task.id);
    if (index !== -1) {
      this.allTasks[index] = { ...this.allTasks[index], ...task };
    } else {
      console.error(`Todo with ID ${task.id} not found.`);
    }
    this.updateStatusArrays();
    this.saveTasksToLocalStorage();
  }

  toggleTaskStatus(task: Task) {
    task.checked = !task.checked;
    this.updateStatusArrays();
    this.saveTasksToLocalStorage();
  }

  updateStatusArrays() {
    this.completedTasks = this.allTasks
    .filter( (task) => task.checked && !task.archived)
    .sort((a,b) =>  Number(new Date(a.dateCreated)) - Number(new Date(b.dateCreated)));
    this.incompleteTasks = this.allTasks
    .filter( (task) => !task.checked && !task.archived && task.type == 'today')
    .sort((a,b) =>  Number(new Date(a.dateCreated)) - Number(new Date(b.dateCreated)));
    this.futureTasks = this.allTasks
    .filter( (task) => !task.checked && !task.archived && task.type == 'future')
    .sort((a,b) =>  Number(new Date(a.dateCreated)) - Number(new Date(b.dateCreated)));
    this.archivedTasks = this.allTasks
    .filter( (task) => task.archived == true)
    .sort((a,b) =>  Number(new Date(a.dateCreated)) - Number(new Date(b.dateCreated)));

    this.completedTasksSubject.next(this.completedTasks);
    this.incompleteTasksSubject.next(this.incompleteTasks);
    this.archivedTasksSubject.next(this.archivedTasks);
    this.futureTasksSubject.next(this.futureTasks);
    this.allTasksSubject.next(this.allTasks);
  }

  deleteArchives(task: any){
    // console.log(date);
    let date = task.date;
    let archives2dlt = this.archivedTasks.filter((task) => date == task.dateCreated);
    // console.log(archives2dlt);
    let archivesdltfromAll = this.allTasks.filter((task) => !archives2dlt.some(archive => archive.dateCreated === task.dateCreated));
    // console.log(archivesdltfromAll);
    localStorage.setItem('tasks', JSON.stringify(archivesdltfromAll));
    this.loadTasksFromLocalStorage();
  }

  deleteTasks(task: Task) {
    // console.log('Deleted!' ,task);
    const incompleteTasks = this.incompleteTasks.filter(tasks => tasks != task);
    const completedTasks = this.completedTasks.filter(tasks => tasks != task);
    const allTasks = this.allTasks.filter(tasks => tasks != task);
    localStorage.setItem('tasks', JSON.stringify(allTasks));
    const tasksData = localStorage.getItem('tasks');
    if (tasksData) {
        this.allTasks = [...JSON.parse(tasksData)];
        this.completedTasks = this.allTasks.filter(
          (task) => task.checked && !task.archived
        );
        this.incompleteTasks = this.allTasks.filter(
          (task) => !task.checked && !task.archived
        );
      }
    this.completedTasksSubject.next(completedTasks);
    this.incompleteTasksSubject.next(incompleteTasks);
    this.allTasksSubject.next(allTasks);
    // console.log('Deleted incompleteTasks!' ,incompleteTasks);
    // console.log('Deleted completedTasks!' ,completedTasks);
    // console.log('Deleted allTasks!' ,allTasks);
  }

  restoreTask(task: Task) {
    this.allTasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(this.allTasks));
    this.loadTasksFromLocalStorage();
  }

  toggleDarkMode(darkMode: boolean) {
    localStorage.setItem('DarkMode', JSON.stringify(darkMode));
    document.body.classList.toggle('dark-mode', darkMode);
    if(darkMode == true){
      this.themeSwitchSubject.next('dark');
      document.querySelector("meta[name='theme-color']")?.setAttribute("content", "#141419");
    } else {
      this.themeSwitchSubject.next('light');
      document.querySelector("meta[name='theme-color']")?.setAttribute("content", "#fff");
    }
  }

  getThemeInfo() {
    return this.themeSwitchSubject.asObservable();
  }
}
