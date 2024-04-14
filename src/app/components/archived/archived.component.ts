import { Component, OnDestroy, OnInit } from '@angular/core';
import { GroupedTasks, Task } from 'src/app/models/task.model';
import { TodoService } from 'src/app/services/todo.service';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Subscription } from 'rxjs';
import { AddTodoComponent } from '../add-todo/add-todo.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-archived',
  templateUrl: './archived.component.html',
  styleUrls: ['./archived.component.scss']
})

export class ArchivedComponent implements OnInit, OnDestroy {

  archivedTasks: Task[] = [];
  groupedTasks: GroupedTasks = {};
  isEmpty: boolean = false;
  subscription: Subscription;

  constructor(private todoService: TodoService, private dialog: MatDialog, private bottomSheet: MatBottomSheet, private datePipe: DatePipe) { }

  ngOnInit() {
    this.groupTasks();
    this.isEmpty = Object.keys(this.groupedTasks).length === 0;
  }

  groupTasks(){
    this.subscription = this.todoService.archivedTasksSubject.subscribe(archived => this.archivedTasks = archived);
    this.archivedTasks.forEach(task => {
      const date = new Date(task.dateCreated); // Convert Date to string
      date.setHours(0, 0, 0, 0);
      if (!this.groupedTasks[date.toDateString()]) {
        this.groupedTasks[date.toDateString()] = [];
      }
      this.groupedTasks[date.toDateString()].push(task);
    });

    // console.log(this.groupedTasks);
  }

  deleteArchives(data: any){
    const formattedDate = this.datePipe.transform(data.date, 'fullDate');
    const confirmDialog = this.dialog.open(ConfirmationDialogComponent,{
      width: '420px',
      autoFocus: false,
      restoreFocus: false,
      data: {
        type: 'ALERT',
        label: `Delete Archives`,
        message: `Are you sure you want to delete all archived tasks from ${formattedDate}? This operation cannot be undone.`,
        btnLabelYes: `Yes, Delete them`,
        btnLabelNo: `No, Keep them`,
      }
    })
    confirmDialog.afterClosed().subscribe(result => {
      if(result === true) {
        this.todoService.deleteArchives(data);
        this.bottomSheet.dismiss();
      }
    });
  }

  getGroupedTaskDates(): any[] {
    // Convert groupedTasks to an array of objects
    const groupedTasksArray = Object.keys(this.groupedTasks).map((date) => ({
      date,
      tasks: this.groupedTasks[date],
    }));

    // Sort groupedTasksArray in descending order based on the date
    groupedTasksArray.sort((a, b) => {
      const dateA:any = new Date(a.date);
      const dateB:any = new Date(b.date);
      return dateB - dateA;
    });
    // console.log(groupedTasksArray)
    return groupedTasksArray;

    // return Object.keys(this.groupedTasks);
  }

  restoreTask(task: any) {
    const bottomSheetRef = this.bottomSheet.open(AddTodoComponent, { data: {restoreMode: true, task} });
    bottomSheetRef.afterDismissed().subscribe((refresh) => {
      if(refresh){
        this.todoService.sendClickEvent();
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
