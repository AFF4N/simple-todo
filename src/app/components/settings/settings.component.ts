import { Component, OnInit } from '@angular/core';
import { TodoService } from 'src/app/services/todo.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  darkMode: any;

  constructor(private todoService: TodoService, private dialog: MatDialog) {
    let theme = '';
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      this.todoService.getThemeInfo().subscribe(res=> {theme = res})
      if( theme === 'dark'){
        this.darkMode = true;
      } else {
        this.darkMode = false;
      }
    });

    this.todoService.getThemeInfo().subscribe(res=> {theme = res})
    if( theme === 'dark'){
      this.darkMode = true;
    } else {
      this.darkMode = false;
    }
  }

  ngOnInit() {}

  onChange(event: any) {
    let toggle = event.target.checked;
    this.todoService.toggleDarkMode(toggle);
  }

  onDelete(){
    const confirmDialog = this.dialog.open(ConfirmationDialogComponent,{
      width: '420px',
      autoFocus: false,
      restoreFocus: false
    })
    confirmDialog.afterClosed().subscribe(result => {
      if(result === true) {
        this.todoService.deleteAllTasksfromLocalStorage();
      }
    });
  }

}
