import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class TodoService {

  allTasks: Task[] = [];
  completedTasks: Task[] = [];
  incompleteTasks: Task[] = [];
  archivedTasks: Task[] = []

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
    date.setHours(0, 0, 0, 0); // Set time to start of the day
    if (tasksData) {
      this.allTasks = [...JSON.parse(tasksData)];
      this.completedTasks = this.allTasks.filter((task) => task.checked);
      this.incompleteTasks = this.allTasks.filter((task) => !task.checked);
      this.archivedTasks = this.allTasks.filter((task) => new Date(task.dateCreated) <= date);
      this.allTasksSubject.next(this.allTasks);
      this.completedTasksSubject.next(this.completedTasks);
      this.incompleteTasksSubject.next(this.incompleteTasks);
      this.archivedTasksSubject.next(this.archivedTasks);
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
    this.completedTasks = this.allTasks.filter(task => task.checked);
    this.incompleteTasks = this.allTasks.filter(task => !task.checked);
    this.archivedTasks = this.allTasks.filter((task) => task.dateCreated < new Date());
    this.completedTasksSubject.next(this.completedTasks);
    this.incompleteTasksSubject.next(this.incompleteTasks);
    this.archivedTasksSubject.next(this.archivedTasks);
    this.allTasksSubject.next(this.allTasks);
  }

}

