import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  allTasks: Task[] = [];
  completedTasks: Task[] = [];
  incompleteTasks: Task[] = [];
  archivedTasks: Task[] = [];

  allTasksSubject = new BehaviorSubject<Task[]>(this.allTasks);
  completedTasksSubject = new BehaviorSubject<Task[]>(this.completedTasks);
  incompleteTasksSubject = new BehaviorSubject<Task[]>(this.incompleteTasks);
  archivedTasksSubject = new BehaviorSubject<Task[]>(this.archivedTasks);

  constructor() {
    this.loadTasksFromLocalStorage();
  }

  loadTasksFromLocalStorage() {
    const tasksData = localStorage.getItem('tasks');
    let date = new Date();
    date.setHours(0, 0, 0, 0);
    if (tasksData) {
      this.allTasks = [...JSON.parse(tasksData)];
      this.completedTasks = this.allTasks.filter(
        (task) => task.checked && !task.archived
      );
      this.incompleteTasks = this.allTasks.filter(
        (task) => !task.checked && !task.archived
      );
      this.archivedTasks = this.allTasks.filter((task) => {
        if (new Date(task.dateCreated) < new Date(date)) {
          task.archived = true;
        }
      });
      this.archivedTasks = this.allTasks.filter(
        (task) => task.archived == true
      );
      // console.log(this.archivedTasks);
      this.completedTasksSubject.next(this.completedTasks);
      this.incompleteTasksSubject.next(this.incompleteTasks);
      this.archivedTasksSubject.next(this.archivedTasks);
      this.allTasksSubject.next(this.allTasks);
    }
    // else {
    //   localStorage.setItem('tasks', JSON.stringify([
    //     {name: 'Click on + to add your first task', category: 'Fantastic start', emoji: '😎', checked: false}
    //   ]));
    //   this.loadTasksFromLocalStorage();
    // }
  }

  saveTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(this.allTasks));
  }

  deleteAllTasksfromLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(''));
    location.reload();
  }

  addTask(task: Task) {
    this.allTasks.push(task);
    this.updateStatusArrays();
    this.saveTasksToLocalStorage();
  }

  toggleTaskStatus(task: Task) {
    task.checked = !task.checked;
    this.updateStatusArrays();
    this.saveTasksToLocalStorage();
  }

  updateStatusArrays() {
    let date = new Date();
    date.setHours(0, 0, 0, 0);
    this.completedTasks = this.allTasks.filter(
      (task) => task.checked && !task.archived
    );
    this.incompleteTasks = this.allTasks.filter(
      (task) => !task.checked && !task.archived
    );
    this.archivedTasks = this.allTasks.filter((task) => task.archived == true);
    // this.archivedTasks = this.allTasks.filter((
    //   task) => new Date(task.dateCreated) < new Date(date) && task.archived);
    // console.log(this.archivedTasks);
    this.completedTasksSubject.next(this.completedTasks);
    this.incompleteTasksSubject.next(this.incompleteTasks);
    this.archivedTasksSubject.next(this.archivedTasks);
    this.allTasksSubject.next(this.allTasks);
  }

  deleteArchives(date: any){
    // console.log(date);
    let archives2dlt = this.archivedTasks.filter((task) => date == task.dateCreated);
    // console.log(archives2dlt);
    let archivesdltfromAll = this.allTasks.filter((task) => !archives2dlt.some(archive => archive.dateCreated === task.dateCreated));
    // console.log(archivesdltfromAll);
    localStorage.setItem('tasks', JSON.stringify(archivesdltfromAll));
    this.loadTasksFromLocalStorage();
  }

  deleteTasks(task: Task) {
    console.log('Deleted!' ,task);
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

  toggleDarkMode(darkMode: boolean) {
    localStorage.setItem('DarkMode', JSON.stringify(darkMode));
    document.body.classList.toggle('dark-mode', darkMode);
  }
}
