import * as moment from 'moment';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TodoService } from 'src/app/services/todo.service';
import { v4 as uuidv4 } from 'uuid';
import { Task } from 'src/app/models/task.model';
import { NotificationService } from 'src/app/shared/notification/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
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
  tagInput: boolean = false;
  tags = [];
  selectedTags = [];
  selectedChip: any;
  dateToday: any;
  dateTomorrow: any;
  dateWeekend: any;
  clockInterval: any;
  minDate: Date;
  taskType: any;
  objTask: Task;
  editMode: boolean;
  restoreMode: boolean;
  headerLabel: string = '';
  headerDesc: string = '';
  btnLabel: string = '';

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private bottomSheet: MatBottomSheet,
    private todoService: TodoService,
    private snackBar: MatSnackBar,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {
    // console.log(data);
    if(data !== null) {
      this.objTask = data.task;
      this.editMode = data.editMode;
      this.restoreMode = data.restoreMode;
    } else {
      this.editMode = false;
      this.restoreMode = false;
    }
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentDate = new Date().getDate();
    this.minDate = new Date(currentYear, currentMonth, currentDate);
  }

  ngOnInit() {
    this.todoForm = new FormGroup({
      name: new FormControl('', Validators.required),
      tags: new FormControl([]),
      note: new FormControl(''),
      emoji: new FormControl('✨'),
      date: new FormControl(new Date()),
      time: new FormControl(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })),
      scheduleSelect: new FormControl('Today'),
    })
    const theme = localStorage.getItem('DarkMode');
    this.darkMode = JSON.parse(theme);
    const tags = JSON.parse(localStorage.getItem('tags') as string);
    if (tags != null){
      this.tags = structuredClone(tags) // deep copy of tags from localStorage
    }
    if(this.restoreMode) {
      this.headerLabel = 'Restore task from archives 📂';
      this.headerDesc = 'Give life back to a task from the past!';
      this.btnLabel = 'Restore Task';
      this.objTask.archived = false;
      this.selectedTags = structuredClone(this.objTask.tags);
      this.getSelectedTags();
      this.patchFormData();
    } else if (this.editMode) {
      this.headerLabel = 'Edit your task 🖊️';
      this.headerDesc = 'Make it even better! Update the details of your task.';
      this.btnLabel = 'Save Changes';
      this.selectedTags = structuredClone(this.objTask.tags);
      this.getSelectedTags();
      this.patchFormData();
    } else {
      this.headerLabel = 'What tasks we got today? 🤔';
      this.headerDesc = 'Add a dash of productivity to your day';
      this.btnLabel = 'Add Task';
      this.selectedTags = []
    }
    this.calculateDate();
  }

  getSelectedTags() {
    if(this.selectedTags == undefined){
      this.selectedTags = [];
    }
    if(this.selectedTags.length !== 0){
      this.tags.forEach(localTag => {
        localTag.isSelected = this.selectedTags.some(selectedTag => selectedTag.name === localTag.name);
      });
    }
  }

  patchFormData() {
    this.todoForm.get('name').patchValue(this.objTask.name);
    this.todoForm.get('note').patchValue(this.objTask.note);
    this.selectedEmoji = this.objTask.emoji;
    this.todoForm.get('date').patchValue(new Date(this.objTask.dateCreated));
    this.todoForm.get('time').patchValue(new Date(this.objTask.dateCreated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    this.todoForm.get('scheduleSelect').patchValue('Date and Time');
    this.selectedChip = 'Date and Time'
    this.date = true;
    this.time = true;
    this.clearClockInterval();
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

  toggleTagInput(input) {
    input.value = '';
    this.tagInput = true;
    setTimeout(() => {
      const el = document.getElementById('chip-input');
      el.focus();
      el.addEventListener("blur", () => {
        setTimeout(() => {
          this.tagInput = false;
        }, 100);
      });
    }, 0);
  }

  onSelectTag(tag) {
    const index = this.selectedTags.findIndex(p => p.name === tag.name);
    if (index === -1) {
      this.selectedTags.push(tag);
      if(this.todoForm.value.name == ''){
        this.todoForm.get('name').patchValue(tag.name);
      }
    } else {
      this.selectedTags.splice(index, 1);
    }
    if(this.selectedTags.length === 0 && tag.name == this.todoForm.value.name){
      this.todoForm.get('name').patchValue('');
    }
    // console.log('local tags array:', this.tags);
    // console.log('selected tags:', this.selectedTags);
    // console.log('this.objTask:', this.objTask);
  }

  removeTag(tag: any) {
    const confirmDialog = this.dialog.open(ConfirmationDialogComponent,{
      width: '420px',
      autoFocus: false,
      restoreFocus: false,
      data: {
        type: 'ALERT',
        label: `Delete Tag`,
        message: `Are you sure you want to delete '${tag.name}' tag? This operation cannot be undone.`,
        note: `NOTE: The tag will be removed from all associated tasks.`,
        btnLabelYes: `Yes, Delete`,
        btnLabelNo: `No, Keep it`
      }
    })
    confirmDialog.afterClosed().subscribe(result => {
      if(result === true) {
        this.notification.showLoader(true);
        const selectedIndex = this.selectedTags.findIndex(item => item.name === tag.name);
        const localIndex = this.tags.findIndex(item => item.name === tag.name);
        if (selectedIndex >= 0) {
          this.selectedTags.splice(selectedIndex, 1);
        }
        if (localIndex >= 0) {
          this.tags.splice(localIndex, 1);
          const tags = this.tags.map(tag => ({ name: tag.name }));
          localStorage.setItem('tags', JSON.stringify(tags));

          // update tasks lists with deleted tag
          const tasks = JSON.parse(localStorage.getItem('tasks'))
          tasks.forEach(task => {
            if(task.tags){
              const index = task.tags.findIndex(item => item.name === tag.name);
              if (index >= 0) {
                task.tags.splice(index, 1);
              }
            }
          })
          // console.log(tasks);
          localStorage.setItem('tasks', JSON.stringify(tasks));
          this.todoService.loadTasksFromLocalStorage();
          this.todoService.updateStatusArrays();
          this.notification.showLoader(false);
        }
        // console.log('local tags array:', this.tags);
        // console.log('selected tags:', this.selectedTags);
      }
    });

  }

  addTag(event: any): void {
    this.tagInput = true;
    const value = (event.value || '').trim();
    if (this.validateTag(value)) {
      const tag = {
        name: value,
        // isSelected: false
      };
      this.tags.push(tag);
      this.tagInput = false;
      event.chipInput?.clear();
      localStorage.setItem('tags', JSON.stringify(this.tags));
    }
    // console.log('local tags array:', this.tags);
    // console.log('selected tags:', this.selectedTags);
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
          if(!this.editMode && !this.restoreMode){
            this.updateTime();
          }
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
    if(!this.editMode && !this.restoreMode){ // New Task
      const todo = {
        id: uuidv4(),
        name: this.todoForm.value.name,
        tags: this.selectedTags,
        note: this.todoForm.value.note,
        emoji: emoji,
        checked: false,
        archived: false,
        dateCreated: this.calculateDate(),
        // dateCreated: 'Sun Aug 25 2023 23:59:00 GMT+0500 (Pakistan Standard Time)', // testing archived dates
        type: this.taskType
      }
      if(this.validateTask(todo)){
        this.todoService.addTask(todo);
        this.bottomSheet.dismiss();
      }
    } else { // Edit or Restore Mode
      const todo = {
        id: this.objTask.id,
        tags: this.selectedTags,
        name: this.todoForm.value.name,
        note: this.todoForm.value.note,
        emoji: emoji,
        checked: this.objTask.checked,
        archived: this.objTask.archived,
        dateCreated: this.calculateDate(),
        type: this.taskType
      }
      if(this.validateTask(todo)){
        this.todoService.updateTask(todo);
        this.bottomSheet.dismiss();
      }
    }
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

  validateTask(todo: Task) {
    if(todo.name == '') {
      this.snackBar.open("Task name can't be blank. Give it some love! 🚀", 'OK', {duration: 2000, verticalPosition: 'top'});
      return false;
    }
    if(new Date(todo.dateCreated).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)){
      this.snackBar.open("Tasks cannot be scheduled in the past! ⌚", 'OK', {duration: 2000, verticalPosition: 'top'});
      return false;
    }
    return true;
  }

  validateTag(value: string) {
    if(value === '') {
      this.snackBar.open("Tag name can't be blank", 'OK', {duration: 2000, verticalPosition: 'top'});
      return false;
    }
    if(this.tags.some(el => el.name === value)){
      this.snackBar.open("Tag already exists!", 'OK', { duration: 2000, verticalPosition: 'top' });
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
