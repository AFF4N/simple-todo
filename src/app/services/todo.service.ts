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

  allTasksSubject = new BehaviorSubject<Task[]>(this.allTasks);
  completedTasksSubject = new BehaviorSubject<Task[]>(this.completedTasks);
  incompleteTasksSubject = new BehaviorSubject<Task[]>(this.incompleteTasks);

  constructor() {
    this.loadTasksFromLocalStorage();
   }

  loadTasksFromLocalStorage() {
    const tasksData = localStorage.getItem('tasks');
    if (tasksData) {
      this.allTasks = [...JSON.parse(tasksData)];
      this.completedTasks = this.allTasks.filter((task) => task.checked);
      this.incompleteTasks = this.allTasks.filter((task) => !task.checked);
      this.allTasksSubject.next(this.allTasks);
      this.completedTasksSubject.next(this.completedTasks);
      this.incompleteTasksSubject.next(this.incompleteTasks);
    } else {
      localStorage.setItem('tasks', JSON.stringify([{name: 'Click on + to add your first task', category: 'Fantisitic start', emoji: '😎', checked: false}]));
      this.loadTasksFromLocalStorage();
    }
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
    this.completedTasksSubject.next(this.completedTasks);
    this.incompleteTasksSubject.next(this.incompleteTasks);
    this.allTasksSubject.next(this.allTasks);
  }

}

