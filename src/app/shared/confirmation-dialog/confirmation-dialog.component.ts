import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertModel } from 'src/app/models/task.model';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: AlertModel, private dialogRef: MatDialogRef<ConfirmationDialogComponent>) {}

  ngOnInit() {
  }

  onClickNo() {
    this.dialogRef.close(false);
  }

  onClickYes() {
    this.dialogRef.close(true);
  }

}
