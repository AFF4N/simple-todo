import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TodoService } from 'src/app/services/todo.service';
@Component({
  selector: 'app-add-todo',
  templateUrl: './add-todo.component.html',
  styleUrls: ['./add-todo.component.scss'],
})
export class AddTodoComponent implements OnInit {
  selectedEmoji: any;
  emojiPopup = false;
  todoForm: any;
  allTasks: any = [];
  darkMode: any;

  constructor(private fb: FormBuilder, private addNewSheet: MatBottomSheet, private todoService: TodoService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.todoForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      category: new FormControl(null, Validators.required),
      emoji: new FormControl('✨'),
      checked: new FormControl()
    })
    // this.todoForm = this.fb.group({
    //   name: [''],
    //   category: [''],
    //   emoji: [''],
    //   checked: []
    // });
    const tasksData = localStorage.getItem('tasks');
    if (tasksData) {
      this.allTasks = [JSON.parse(tasksData)];
    }
  }

  toggleElement() {
    this.emojiPopup = !this.emojiPopup;
    const theme:any = localStorage.getItem('DarkMode');
    this.darkMode = JSON.parse(theme);
  }

  select($event: { emoji: any }) {
    // console.log($event);
    this.selectedEmoji = $event.emoji;
    this.pasteHtmlAtCaret('<span style="\display: none"\>hi</span>');
    this.emojiPopup = false;
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

  onSubmit() {
    if(this.selectedEmoji){
      const todo = {
        name: this.todoForm.value.name,
        category: this.todoForm.value.category,
        emoji: this.selectedEmoji.native,
        checked: false,
        archived: false,
        dateCreated: new Date().toDateString()
        // dateCreated: 'Sun Aug 25 2023'
      }
      // console.log(todo);
      if(this.validateTask(todo)){
        this.todoService.addTask(todo);
        this.addNewSheet.dismiss();
      }
    } else {
      let snackBarRef = this.snackBar.open('Select an emoji for a dash of personal flair! 😋', 'OK', {
        duration: 2000,
        verticalPosition: 'top'
      });
    }
  }

  validateTask(todo: any) {
    if(todo.name ==  null) {
      this.snackBar.open('Add a task!', 'OK', {duration: 2000, verticalPosition: 'top'});
      return false;
    }
    if(todo.category == null) {
      this.snackBar.open('Add a category!', 'OK', {duration: 2000, verticalPosition: 'top'});
      return false;
    }
    return true;
  }
}
