import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { TodoService } from 'src/app/services/todo.service';
@Component({
  selector: 'app-add-todo',
  templateUrl: './add-todo.component.html',
  styleUrls: ['./add-todo.component.css'],
})
export class AddTodoComponent implements OnInit {
  selectedEmoji: any;
  emojiPopup = false;
  todoForm: any;
  allTasks: any = [];

  constructor(private fb: FormBuilder, private addNewSheet: MatBottomSheet, private elementRef: ElementRef, private todoService: TodoService) {}

  ngOnInit() {
    this.todoForm = this.fb.group({
      name: [''],
      category: [''],
      emoji: [''],
      checked: []
    });
    const tasksData = localStorage.getItem('tasks');
    if (tasksData) {
      this.allTasks = [JSON.parse(tasksData)];
    }
  }

  // @HostListener('document:click', ['$event'])
  // onClick(event: Event) {
  //   if (!this.elementRef.nativeElement.contains(event.target)) {
  //     this.emojiPopup = false;
  //   }
  // }

  toggleElement() {
    this.emojiPopup = !this.emojiPopup;
  }

  select($event: { emoji: any }) {
    console.log($event);
    this.selectedEmoji = $event.emoji;
    this.pasteHtmlAtCaret('<span>hi</span>');
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
      this.todoForm.patchValue(
          {emoji: this.selectedEmoji.native, checked: false}
        );
      // const todo = {
      //   name: this.todoForm.value.name,
      //   category: this.todoForm.value.category,
      //   emoji: this.selectedEmoji.native,
      //   checked: false,
      // }
      // console.log(todo);
      // this.allTasks.push(this.todoForm.value)
      // localStorage.setItem('tasks', JSON.stringify(this.todoForm.value));
      this.todoService.addTask(this.todoForm.value);
      this.addNewSheet.dismiss();
    }
    // window.location.reload();
  }
}
