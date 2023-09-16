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
  isPWAstate: boolean = false;

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
    this.getPWADisplayMode();
  }

  ngOnInit() {}

  onChange(event: any) {
    let toggle = event.target.checked;
    this.todoService.toggleDarkMode(toggle);
  }

  getPWADisplayMode() {
    const PWAmode = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    if(PWAmode){
      this.isPWAstate = true;
    }
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (evt) => {
      // let displayMode = 'browser';
      if (evt.matches) {
        // displayMode = 'standalone';
        this.isPWAstate = true;
      }
      // Log display mode change to analytics
      // console.log('DISPLAY_MODE_CHANGED', displayMode);
    });
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

  onRefresh() {
    location.reload();
  }

}
