import { Component, OnInit } from '@angular/core';
import { GroupedTasks, Task } from 'src/app/models/task.model';
import { TodoService } from 'src/app/services/todo.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-archived',
  templateUrl: './archived.component.html',
  styleUrls: ['./archived.component.scss']
})

export class ArchivedComponent implements OnInit {

  archivedTasks: Task[] = [];
  groupedTasks: GroupedTasks = {};
  isEmpty: boolean = false;
  // groupedTasks: { [key: string]: any[] } = {};

  constructor(private todoService: TodoService, private dialog: MatDialog, private bottomSheet: MatBottomSheet) { }

  ngOnInit() {
    this.groupTasks();
    this.isEmpty = Object.keys(this.groupedTasks).length === 0;
  }

  groupTasks(){
    this.todoService.archivedTasksSubject.subscribe(archived => this.archivedTasks = archived);
    this.archivedTasks.forEach(task => {
      const date = task.dateCreated; // Convert Date to string
      if (!this.groupedTasks[date]) {
        this.groupedTasks[date] = [];
      }
      this.groupedTasks[date].push(task);
    });

    // console.log(this.groupedTasks);
  }

  deleteArchives(data: any){
    const confirmDialog = this.dialog.open(ConfirmationDialogComponent,{
      width: '420px',
      autoFocus: false,
      restoreFocus: false
    })
    confirmDialog.afterClosed().subscribe(result => {
      if(result === true) {
        this.todoService.deleteArchives(data);
        this.bottomSheet.dismiss();
      }
    });
  }

  getGroupedTaskDates(): string[] {
    return Object.keys(this.groupedTasks);
  }

}
