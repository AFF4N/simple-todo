import * as moment from 'moment';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TodoService } from 'src/app/services/todo.service';
import { v4 as uuidv4 } from 'uuid';
import { Task } from 'src/app/models/task.model';
@Component({
  selector: 'app-add-todo',
  templateUrl: './add-todo.component.html',
  styleUrls: ['./add-todo.component.scss'],
})

export class AddTodoComponent implements OnInit, OnDestroy {
  selectedEmoji: any;
  todoForm: any;
  darkMode: any;
  previousIndex = 0;
  time: boolean = false;
  date: boolean = false;
  selectedChip: any;
  dateToday: any;
  dateTomorrow: any;
  dateWeekend: any;
  clockInterval: any;
  minDate: Date;
  taskType: any;
  editMode: boolean;
  headerLabel: string = '';
  headerDesc: string = '';
  btnLabel: string = '';

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public todoData: Task,
    private bottomSheet: MatBottomSheet,
    private todoService: TodoService,
    private snackBar: MatSnackBar
  ) {
    console.log(todoData);
    if(todoData !== null) {
      this.editMode = true;
    } else {
      this.editMode = false;
    }
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentDate = new Date().getDate();
    this.minDate = new Date(currentYear, currentMonth, currentDate);
  }

  ngOnInit() {
    this.todoForm = new FormGroup({
      name: new FormControl('', Validators.required),
      note: new FormControl(''),
      emoji: new FormControl('✨'),
      date: new FormControl(new Date()),
      time: new FormControl(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })),
      scheduleSelect: new FormControl('Today'),
    })
    if(this.editMode == false) {
      this.headerLabel = 'What tasks we got today? 🤔';
      this.headerDesc = 'Add a dash of productivity to your day';
      this.btnLabel = 'Add Task';
    } else {
      this.headerLabel = 'Edit Your Task 🖊️';
      this.headerDesc = 'Make it even better! Update the details of your task.';
      this.btnLabel = 'Save Changes';
      this.todoForm.get('name').patchValue(this.todoData.name);
      this.todoForm.get('note').patchValue(this.todoData.note);
      this.selectedEmoji = this.todoData.emoji;
      this.todoForm.get('date').patchValue(new Date(this.todoData.dateCreated));
      this.todoForm.get('time').patchValue(new Date(this.todoData.dateCreated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      this.todoForm.get('scheduleSelect').patchValue('Date and Time');
      this.selectedChip = 'Date and Time'
      this.date = true;
      this.time = true;
      this.clearClockInterval();
    }
    this.calculateDate();
  }

  toggleElement() {
    // this.emojiPopup = !this.emojiPopup;
    const theme:any = localStorage.getItem('DarkMode');
    this.darkMode = JSON.parse(theme);
  }

  select($event: { emoji: any }) {
    this.selectedEmoji = $event.emoji;
    this.pasteHtmlAtCaret('<span style="\display: none"\>hi</span>');
  }
  pasteHtmlAtCaret(html: string) {
    var sel, range;
    if (window.getSelection) {
      // IE9 and non-IE
      sel = window.getSelection();
      if (sel?.getRangeAt && sel?.rangeCount) {
        range = sel.getRangeAt(0);
        range.deleteContents();

        // Range.createContextualFragment() would be useful here but is
        // non-standard and not supported in all browsers (IE9, for one)
        var el = document.createElement('div');
        el.innerHTML = html;
        var frag = document.createDocumentFragment(),
          node,
          lastNode;
        while ((node = el.firstChild)) {
          lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);

        // Preserve the selection
        if (lastNode) {
          range = range.cloneRange();
          range.setStartAfter(lastNode);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }
  }

  onChangeSchedule(event: any) {
    this.selectedChip = event.source._keyManager._activeItemIndex;
    if(this.selectedChip != undefined){
      this.previousIndex = this.selectedChip;
      if(this.selectedChip == 0){
        this.todoForm.get('scheduleSelect').patchValue('Today')
      }
      if(this.selectedChip == 1){
        this.todoForm.get('scheduleSelect').patchValue('Tomorrow')
      }
      if(this.selectedChip == 2){
        this.todoForm.get('scheduleSelect').patchValue('Weekend')
      }
      if(this.selectedChip == 3){
        this.todoForm.get('scheduleSelect').patchValue('Date and Time')
        this.clockInterval = setInterval(() => {
          this.updateTime();
        }, 1000);
        this.date = true;
        this.time = true;
      } else {
        this.date = false;
        this.time = false;
        this.clearClockInterval();
      }
    } else {
      setTimeout(() => {
        this.todoForm.get('scheduleSelect').patchValue(this.previousIndex);
        this.date = false;
        this.time = false;
      }, 0)
    }
    this.selectedChip = this.todoForm.value.scheduleSelect;
    this.calculateDate()
  }

  updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    // const seconds = now.getSeconds().toString().padStart(2, '0');
    this.todoForm.get('time').patchValue(hours + ':' + minutes) ;
    // console.log(hours + ':' + minutes);
  }

  onSubmit() {
    let emoji;
    if(!this.selectedEmoji){
      emoji = {
        "name": "Spiral Calendar",
        "unified": "1F5D3-FE0F",
        "keywords": [
            "spiral_calendar",
            "date",
            "schedule",
            "planning"
        ],
        "sheet": [
            32,
            5
        ],
        "shortName": "spiral_calendar_pad",
        "shortNames": [
            "spiral_calendar_pad"
        ],
        "id": "spiral_calendar_pad",
        "native": "🗓️",
        "skinVariations": [],
        "emoticons": [],
        "hidden": [],
        "text": "",
        "set": "apple",
        "colons": ":spiral_calendar_pad:"
      };
    } else {
      emoji = this.selectedEmoji;
    }
    if(!this.editMode){
      const todo = {
        id: uuidv4(),
        name: this.todoForm.value.name,
        note: this.todoForm.value.note,
        emoji: emoji,
        checked: false,
        archived: false,
        dateCreated: this.calculateDate(),
        type: this.taskType
        // dateCreated: 'Sun Aug 25 2023'
      }
      if(this.validateTask(todo)){
        this.todoService.addTask(todo);
      }
    } else {
      const todo = {
        id: this.todoData.id,
        name: this.todoForm.value.name,
        note: this.todoForm.value.note,
        emoji: emoji,
        checked: this.todoData.checked,
        archived: this.todoData.archived,
        dateCreated: this.calculateDate(),
        type: this.taskType
        // dateCreated: 'Sun Aug 25 2023'
      }
      if(this.validateTask(todo)){
        this.todoService.updateTask(todo);
      }
    }
    this.bottomSheet.dismiss();
  }

  calculateDate() {
    let date = moment();

    var today = date;
    this.dateToday = today.format('D');

    var tomorrow = date.clone().add(1, 'days')
    this.dateTomorrow = tomorrow.format('D');

    // Find the next Saturday
    var saturday = date.clone().day('Saturday');
    // If the current day is already Saturday, move to the next Saturday
    if (date.day() >= 6) {
      saturday.add(1, 'weeks');
    }
    this.dateWeekend = saturday.format('D');

    if(this.selectedChip == 'Today'){
      date = today;
    }
    if(this.selectedChip == 'Tomorrow'){
      date = tomorrow;
    }
    if(this.selectedChip == 'Weekend'){
      date = saturday;
    }
    if(this.selectedChip == 'Date and Time'){
      date = moment(this.todoForm.value.date);
      this.stitchTime(date);
    }

    this.getTaskType(date);
    return date.toDate().toString();
  }

  getTaskType(dateCreated: moment.Moment){
    const dayStart = moment().startOf('day');
    const dayEnd = moment().endOf('day');
    if(dateCreated.isBefore(dayEnd) || dateCreated.isAfter(dayStart)) {
      this.taskType = 'today';
    }
    if(dateCreated.isBefore(dayStart)) {
      this.taskType = 'archived';
    }
    if(dateCreated.isAfter(dayEnd)) {
      this.taskType = 'future';
    }
  }

  stitchTime(date: any) {
    let selectedTime = this.todoForm.value.time
    const [hours, minutes] = selectedTime.split(':');
    date.set({
      hour: parseInt(hours, 10),
      minute: parseInt(minutes, 10)
    });
    // console.log(date.toDate())
    return date;
  }

  validateTask(todo: any) {
    if(todo.name == '') {
      this.snackBar.open('Add a Task!', 'OK', {duration: 2000, verticalPosition: 'top'});
      return false;
    }
    return true;
  }

  clearClockInterval() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  ngOnDestroy() {
    this.clearClockInterval();
  }
}
