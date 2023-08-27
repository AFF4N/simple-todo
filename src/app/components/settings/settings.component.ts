import { Component, OnInit } from '@angular/core';
import { TodoService } from 'src/app/services/todo.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  toggleTheme: any;

  constructor(private todoService: TodoService) { }

  ngOnInit() {
  }

  onChange(event: any) {
    console.log(event)
  }

  onDelete(){
    alert('are you sure you want to delete all tasks? This operation cannot be undone.')
    this.todoService.deleteAllTasksfromLocalStorage();
  }

}
