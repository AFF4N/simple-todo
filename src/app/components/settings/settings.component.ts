import { Component, OnInit } from '@angular/core';
import { TodoService } from 'src/app/services/todo.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  toggleTheme: any;

  constructor(private todoService: TodoService, private dialog: MatDialog) { }

  ngOnInit() {
  }

  onChange(event: any) {
    console.log(event.target.checked)
  }

  onDelete(){
    const confirmDialog = this.dialog.open(ConfirmationDialogComponent,{
      width: '420px',
      autoFocus: false
    })
    confirmDialog.afterClosed().subscribe(result => {
      if(result === true) {
        this.todoService.deleteAllTasksfromLocalStorage();
      }
    });
  }

}
