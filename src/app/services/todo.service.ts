import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';
import { BehaviorSubject, Subject } from 'rxjs';
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
  rootData: Task[] = [];
  filtersActive = false;

  themeSwitchSubject = new BehaviorSubject<any>(this.themeSwitch);
  allTasksSubject = new BehaviorSubject<Task[]>(this.allTasks);
  completedTasksSubject = new BehaviorSubject<Task[]>(this.completedTasks);
  incompleteTasksSubject = new BehaviorSubject<Task[]>(this.incompleteTasks);
  futureTasksSubject = new BehaviorSubject<Task[]>(this.futureTasks);
  archivedTasksSubject = new BehaviorSubject<Task[]>(this.archivedTasks);
  subject = new Subject<void>();

  constructor() {
    this.loadTasksFromLocalStorage();
  }

  sendClickEvent() {
    this.subject.next();
  }
  getClickEvent() {
    return this.subject.asObservable();
  }

  loadTasksFromLocalStorage(queriedTasks?) {
    const tasksData = localStorage.getItem('tasks');
    const dayStart = moment().startOf('day');
    const dayEnd = moment().endOf('day');
    if (tasksData) {
      this.rootData = [...JSON.parse(tasksData)];
      if(queriedTasks && queriedTasks.length !== 0){
        this.filtersActive = true;
        this.allTasks = queriedTasks; // tasks with selected tag
      } else {
        this.filtersActive = false;
        this.allTasks = structuredClone(this.rootData);
      }
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

  updateStatusArrays() {
    console.log('rootData', this.rootData);
    console.log('alltasks', this.allTasks);
    console.log(' ---------- ');

    if(this.filtersActive){
      this.rootData = this.mergeArrays(this.allTasks, this.rootData);
    } else {
      this.rootData = this.allTasks;
    }

    this.completedTasks = this.allTasks
    .filter( (task) => task.checked && !task.archived)
    .sort((a,b) =>  Number(new Date(a.dateCreated)) - Number(new Date(b.dateCreated)));
    this.incompleteTasks = this.allTasks
    .filter( (task) => !task.checked && !task.archived && task.type == 'today')
    .sort((a,b) =>  Number(new Date(a.dateCreated)) - Number(new Date(b.dateCreated)));
    this.futureTasks = this.allTasks
    .filter( (task) => !task.checked && !task.archived && task.type == 'future')
    .sort((a,b) =>  Number(new Date(a.dateCreated)) - Number(new Date(b.dateCreated)));

    this.archivedTasks = this.rootData
    .filter( (task) => task.archived == true)
    .sort((a,b) =>  Number(new Date(a.dateCreated)) - Number(new Date(b.dateCreated)));

    this.completedTasksSubject.next(this.completedTasks);
    this.incompleteTasksSubject.next(this.incompleteTasks);
    this.futureTasksSubject.next(this.futureTasks);
    this.archivedTasksSubject.next(this.archivedTasks);
    this.allTasksSubject.next(this.allTasks);
  }

  mergeArrays(updateArray, originalArray) {
    // Create a map from originalArray based on some identifier
    let map = new Map(originalArray.map(obj => [obj.id, obj]));

    // Create a new array to store the merged objects
    let mergedArray = [...originalArray];

    // Iterate over updateArray and update corresponding objects in mergedArray
    for (let obj of updateArray) {
        if (map.has(obj.id)) {
            // Update properties of obj in mergedArray
            let targetObj = mergedArray.find(item => item.id === obj.id);
            Object.assign(targetObj, obj);
        } else {
            // Add obj from updateArray to mergedArray
            mergedArray.push(obj);
        }
    }

    return mergedArray;
  }

  saveTasksToLocalStorage() {
    console.log("data saved to LocalStorage:", this.rootData);
    localStorage.setItem('tasks', JSON.stringify(this.rootData));
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

  deleteArchives(archivedGroup: any){
    // console.log(date);
    let date = new Date(archivedGroup.date).toDateString();
    let archives2dlt = this.archivedTasks.filter((task) => date == new Date(task.dateCreated).toDateString());
    // console.log(archives2dlt);
    let archivesdltfromAll = this.rootData.filter((task) => !archives2dlt.some(archive => archive.dateCreated === task.dateCreated));
    // console.log(archivesdltfromAll);
    localStorage.setItem('tasks', JSON.stringify(archivesdltfromAll));
    this.loadTasksFromLocalStorage();
  }

  deleteTasks(task: Task) {
    this.allTasks = this.allTasks.filter(todo => todo.id !== task.id);
    this.updateStatusArrays();
    this.rootData = this.rootData.filter(todo => todo.id !== task.id);
    this.saveTasksToLocalStorage();
  }

  restoreTask(task: Task) { // undo deleted task
    this.rootData.push(task);
    this.saveTasksToLocalStorage();
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
