import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent implements OnInit {

  todaysDate = new Date();
  completedTasks = [
    {
      name:'Completed task 1',
      category: '💰 Finance',
      checked: true
    },
    {
      name:'Completed task 2',
      category: '💰 Finance',
      checked: true
    },
    {
      name:'Completed task 3',
      category: '💰 Finance',
      checked: true
    },
  ];
  incompleteTasks = [
    {
      name:'Incomplete task 1',
      category: '💰 Finance',
      checked: false
    },
    {
      name:'Incomplete task 2',
      category: '💰 Finance',
      checked: false
    },
    {
      name:'Incomplete task 3',
      category: '💰 Finance',
      checked: false
    },
    {
      name:'Incomplete task 4',
      category: '💰 Finance',
      checked: false
    },
  ];

  constructor() { }

  ngOnInit() {
    console.log(this.incompleteTasks);
    console.log(this.completedTasks);
  }

  onComplete(item: any, index: any){
    console.log(item);
    console.log(index);

    console.log(this.incompleteTasks);
    console.log(this.completedTasks);

    item.checked = !item.checked;
    setTimeout(() => {
      this.incompleteTasks.splice(item);
      console.log(this.incompleteTasks);
      this.completedTasks.push(item)
      console.log(this.completedTasks);
    }, 1500);

  }

}
