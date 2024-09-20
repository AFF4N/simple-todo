import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';
import { BehaviorSubject, catchError, Observable, Subject, throwError } from 'rxjs';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Firestore, collection, addDoc, doc, deleteDoc, updateDoc, collectionData, query, where } from '@angular/fire/firestore';
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

  // private dbPath = '/todos';
  // todosRef: AngularFirestoreCollection<Task>;
  private todosCollection = this.db.collection('todos');
  // todos: Observable<Task[]>;

  constructor(private db: AngularFirestore) {
    // this.loadTasksFromLocalStorage();
    // this.todosRef = db.collection(this.dbPath);
    // this.todosCollection = db.doc('todos');
    // this.todos = this.todosCollection.valueChanges();
  }

  // Fetch all todos
  getTodos(): Observable<Task[]> {
    return this.todosCollection.valueChanges({ idField: 'id' }).pipe(
      catchError((error) => {
        console.error('Error fetching todos:', error);
        return throwError(() => new Error('Failed to fetch todos.')); // Handle error
      })
    ) as Observable<Task[]>;
  }

  // Fetch a single todo by ID
  getTodoById(id: string): Observable<Task> {
    return this.todosCollection.doc(id).valueChanges() as Observable<Task>;
  }

  async create(todo: Task): Promise<void> {
    const id = this.db.createId();
    try {
      await this.todosCollection.doc(id).set({ ...todo, id });
    } catch (error) {
      console.error('Error adding todo:', error);
      throw new Error('Failed to add todo'); // Throw error to propagate it up
    }
  }

  async update(id: string, data: any): Promise<void> {
    try {
      await this.todosCollection.doc(id).update(data);
    } catch (error) {
      console.error('Error updating todo:', error);
      throw new Error('Failed to update todo');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.todosCollection.doc(id).delete();
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw new Error('Failed to delete todo');
    }
  }

  // Fetch tasks associated with a specific tag (by tag ID)
  getTasksByTag(tag: { id: string, name: string }): Observable<any[]> {
    return this.db.collection<any>('todos', ref =>
      ref.where('tags', 'array-contains', tag)
    ).valueChanges({ idField: 'id' });
  }

  sendClickEvent() {
    this.subject.next();
  }
  getClickEvent() {
    return this.subject.asObservable();
  }

  renderAppData(tasks: Task[]) {
    this.allTasks = this.appendTaskTypes(tasks);
    // completed tasks
    this.completedTasks = this.allTasks
    .filter( (task) => task.checked && !task.archived)
    .sort((a,b) =>  Number(new Date(a.dateCreated)) - Number(new Date(b.dateCreated)));
    // incompleted tasks
    this.incompleteTasks = this.allTasks
    .filter( (task) => !task.checked && !task.archived && task.type == 'today')
    .sort((a,b) =>  Number(new Date(a.dateCreated)) - Number(new Date(b.dateCreated)));
    // future tasks
    this.futureTasks = this.allTasks
    .filter( (task) => !task.checked && !task.archived && task.type == 'future')
    .sort((a,b) =>  Number(new Date(a.dateCreated)) - Number(new Date(b.dateCreated)));
    // archived tasks
    this.archivedTasks = this.allTasks
    .filter( (task) => task.archived == true)
    .sort((a,b) =>  Number(new Date(a.dateCreated)) - Number(new Date(b.dateCreated)));

    // forwarding to the subscriptions
    this.completedTasksSubject.next(this.completedTasks);
    this.incompleteTasksSubject.next(this.incompleteTasks);
    this.futureTasksSubject.next(this.futureTasks);
    this.archivedTasksSubject.next(this.archivedTasks);
    this.allTasksSubject.next(this.allTasks);

    this.saveTasksToLocalStorage();
  }

  // loadTasksFromLocalStorage(queriedTasks?) {
  //   const localData = localStorage.getItem('tasks');
  //   if (localData) {
  //     this.rootData = [...JSON.parse(localData)];
  //     if(queriedTasks && queriedTasks.length !== 0){
  //       this.filtersActive = true;
  //       this.allTasks = queriedTasks; // tasks with selected tag
  //     } else {
  //       this.filtersActive = false;
  //       this.allTasks = structuredClone(this.rootData);
  //     }
  //     this.allTasks = this.appendTaskTypes(this.allTasks)
  //     this.updateStatusArrays();
  //   }
  // }

  appendTaskTypes(tasks: any) {
    const dayStart = moment().startOf('day');
    const dayEnd = moment().endOf('day');
    return tasks.map((task) => {
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
  }

  // updateStatusArrays() {
  //   console.log('rootData', this.rootData);
  //   console.log('alltasks', this.allTasks);
  //   console.log(' ---------- ');

  //   if(this.filtersActive){
  //     this.rootData = this.mergeArrays(this.allTasks, this.rootData);
  //   } else {
  //     this.rootData = this.allTasks;
  //   }

  //   this.completedTasks = this.allTasks
  //   .filter( (task) => task.checked && !task.archived)
  //   .sort((a,b) =>  Number(new Date(a.dateCreated)) - Number(new Date(b.dateCreated)));
  //   this.incompleteTasks = this.allTasks
  //   .filter( (task) => !task.checked && !task.archived && task.type == 'today')
  //   .sort((a,b) =>  Number(new Date(a.dateCreated)) - Number(new Date(b.dateCreated)));
  //   this.futureTasks = this.allTasks
  //   .filter( (task) => !task.checked && !task.archived && task.type == 'future')
  //   .sort((a,b) =>  Number(new Date(a.dateCreated)) - Number(new Date(b.dateCreated)));

  //   this.archivedTasks = this.rootData
  //   .filter( (task) => task.archived == true)
  //   .sort((a,b) =>  Number(new Date(a.dateCreated)) - Number(new Date(b.dateCreated)));

  //   this.completedTasksSubject.next(this.completedTasks);
  //   this.incompleteTasksSubject.next(this.incompleteTasks);
  //   this.futureTasksSubject.next(this.futureTasks);
  //   this.archivedTasksSubject.next(this.archivedTasks);
  //   this.allTasksSubject.next(this.allTasks);
  // }

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
    console.log("data saved to LocalStorage:", this.allTasks);
    localStorage.setItem('tasks', JSON.stringify(this.allTasks));
  }

  deleteAllTasksfromLocalStorage() {
    localStorage.removeItem('tasks');
    location.reload();
  }

  // addTask(task: Task) {
  //   this.allTasks.push(task);
  //   this.updateStatusArrays();
  //   this.saveTasksToLocalStorage();
  // }

  // updateTask(task: Task) {
  //   const index = this.allTasks.findIndex(todo => todo.id === task.id);
  //   if (index !== -1) {
  //     this.allTasks[index] = { ...this.allTasks[index], ...task };
  //   } else {
  //     console.error(`Todo with ID ${task.id} not found.`);
  //   }
  //   this.updateStatusArrays();
  //   this.saveTasksToLocalStorage();
  // }

  toggleTaskStatus(task: Task) {
    task.checked = !task.checked;
    this.update(task.id, task);
    // this.updateStatusArrays();
    // this.saveTasksToLocalStorage();
  }

  deleteArchives(archivedGroup: any){
    // console.log(date);
    let date = new Date(archivedGroup.date).toDateString();
    let archives2dlt = this.archivedTasks.filter((task) => date == new Date(task.dateCreated).toDateString());
    // console.log(archives2dlt);
    let archivesdltfromAll = this.rootData.filter((task) => !archives2dlt.some(archive => archive.dateCreated === task.dateCreated));
    // console.log(archivesdltfromAll);
    localStorage.setItem('tasks', JSON.stringify(archivesdltfromAll));
    // this.loadTasksFromLocalStorage();
  }

  // deleteTasks(task: Task) {
  //   this.allTasks = this.allTasks.filter(todo => todo.id !== task.id);
  //   this.updateStatusArrays();
  //   this.rootData = this.rootData.filter(todo => todo.id !== task.id);
  //   this.saveTasksToLocalStorage();
  // }

  restoreTask(task: Task) { // undo deleted task
    this.rootData.push(task);
    this.saveTasksToLocalStorage();
    // this.loadTasksFromLocalStorage();
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
