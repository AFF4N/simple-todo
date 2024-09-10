import { AfterViewChecked, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Task } from 'src/app/models/task.model';
import { AddTodoComponent } from '../add-todo/add-todo.component';
import { ArchivedComponent } from '../archived/archived.component';
import { SettingsComponent } from '../settings/settings.component';
import { AboutComponent } from '../about/about.component';
import { TodoService } from 'src/app/services/todo.service';
import { CdkDragDrop, CdkDragEnd, CdkDragEnter, CdkDragMove, CdkDragStart, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { taskAnimations, deleteBtnAnimation, slideTopBottom } from 'src/assets/animations';
import * as moment from 'moment';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  animations: [taskAnimations, deleteBtnAnimation, slideTopBottom],
})
export class TodoListComponent implements OnInit, AfterViewChecked {
  todaysDate = new Date();
  isChecked: boolean = false;
  deleteBtn: boolean = false;
  disableAnimations: boolean = false;
  isDarkMode: boolean = false
  private readonly localStorageKey = 'DarkMode';

  deletedTask: Task | null = null;
  allTasks: Task[] = [];
  completedTasks: any[] = [];
  incompleteTasks: any[] = [];
  futureTasks: any[] = [];
  // thisWeeksTasks: Task[] = [];
  // thisMonthsTasks: Task[] = [];
  // bitMoreTimeTasks: Task[] = [];
  darkMode: any;
  selectedEmoji: any;
  collapseCompletedTsks: boolean = true;
  collapseFutureTsks: boolean = true;
  isOverDelete = false;
  filterTags: any = [];
  selectedTagIndex = -1;
  showPrevButton = false;
  showNextButton = false;

  @ViewChild('carousel') carousel: any;
  totalFutureTaskCount: number;

  constructor(private bottomSheet: MatBottomSheet, private todoService: TodoService, private snackBar: MatSnackBar) {
    this.getDeviceTheme();
    this.checkActivePWAState();
  }

  ngOnInit() {
    this.todoService.allTasksSubject
    .pipe(distinctUntilChanged((prev, curr) => {
      return JSON.stringify(prev) === JSON.stringify(curr);
    }))
    .subscribe(tasks => this.allTasks = tasks);
    this.todoService.completedTasksSubject
    .pipe(distinctUntilChanged((prev, curr) => {
      return JSON.stringify(prev) === JSON.stringify(curr);
    }))
    .subscribe((completeTasks: any[]) => this.completedTasks = completeTasks);
    this.todoService.incompleteTasksSubject
    .pipe(distinctUntilChanged((prev, curr) => {
      return JSON.stringify(prev) === JSON.stringify(curr);
    }))
    .subscribe((incompleteTasks: any[]) => this.incompleteTasks = incompleteTasks);
    this.todoService.futureTasksSubject
    .pipe(distinctUntilChanged((prev, curr) =>  {
      return JSON.stringify(prev) === JSON.stringify(curr);
    }))
    .subscribe((futureTasks: any[]) => {
      this.futureTasks = futureTasks;
      this.sortFutureTasks();
    });

    let date = new Date();
    date.setHours(0, 0, 0, 0);
    this.incompleteTasks = this.incompleteTasks.filter((
      task) => new Date(task.dateCreated) >= new Date(date));
    this.completedTasks = this.completedTasks.filter((
      task) => new Date(task.dateCreated) >= new Date(date));

    if(this.isDarkMode == true){
      this.todoService.toggleDarkMode(true);
    }
    this.collapseFutureTsks = JSON.parse(localStorage.getItem('collapseFutureTsks') as string);
    this.collapseCompletedTsks = JSON.parse(localStorage.getItem('collapseCompletedTsks') as string);
    this.getlocalTags();
    this.getSelectedTag();

    this.todoService.getClickEvent().subscribe(()=>{
      this.getlocalTags();
    });
  }

  sortFutureTasks() {
    const futureTasks: { label: string, count: 0, tasks: Task[] }[] = [
      { label: 'Tomorrow', count: 0, tasks: [] },
      { label: 'This Week', count: 0, tasks: [] },
      { label: 'This Month', count: 0, tasks: [] },
      { label: 'Quite a bit more time', count: 0, tasks: [] },
    ];

    this.futureTasks.forEach((task: Task) => {
      let date = moment();
      var tomorrow = date.clone().add(1, 'days');

      if (moment(task.dateCreated).isSame(tomorrow, 'day')) {
        futureTasks[0].tasks.push(task); // Index 0 corresponds to 'Tomorrow'
        futureTasks[0].count++;
      } else if (moment(task.dateCreated).isBefore(date.clone().isoWeekday(7))) {
        futureTasks[1].tasks.push(task); // Index 1 corresponds to 'This Week'
        futureTasks[1].count++;
      } else if (moment(task.dateCreated).isBefore(date.clone().endOf('month'))) {
        futureTasks[2].tasks.push(task); // Index 2 corresponds to 'This Month'
        futureTasks[2].count++;
      } else {
        futureTasks[3].tasks.push(task); // Index 3 corresponds to 'Quite a bit more time'
        futureTasks[3].count++;
      }
    });

    this.futureTasks = futureTasks.filter(category => category.tasks.length > 0);
    this.totalFutureTaskCount = futureTasks.reduce((acc, category) => acc + category.count, 0);
    console.log("future tasks", futureTasks);
  }

  toggleTaskStatus(task: Task) {
    this.todoService.toggleTaskStatus(task);
  }

  AddNewTask(){
    const bottomSheetRef = this.bottomSheet.open(AddTodoComponent);
    bottomSheetRef.afterDismissed().subscribe((refresh) => {
      if(refresh){
        // this.scrollToStart();
        // this.selectedTagIndex = -1;
        let selectedTag = this.filterTags[this.selectedTagIndex];
        if(this.selectedTagIndex == -1){
          selectedTag = {name: 'All'}
        }
        const tasksList = this.findTasksWithTag(JSON.parse(localStorage.getItem('tasks')), selectedTag);
        this.todoService.loadTasksFromLocalStorage(tasksList);
        this.getlocalTags(1);
      }
    });
  }

  editTask(task: any) {
    // console.log(task)
    const bottomSheetRef = this.bottomSheet.open(AddTodoComponent, { data: {editMode: true, task} });
    bottomSheetRef.afterDismissed().subscribe((refresh) => {
      if(refresh){
        // this.scrollToStart();
        // this.selectedTagIndex = -1;
        this.allTasks = JSON.parse(localStorage.getItem('tasks'));
        this.getSelectedTag();
        this.getlocalTags();
      }
    });
  }

  openArchives() {
    this.bottomSheet.open(ArchivedComponent);
  }

  openSettings() {
    this.bottomSheet.open(SettingsComponent);
  }

  openAbout() {
    this.bottomSheet.open(AboutComponent);
  }

  toggleElement(i: any) {
    const theme:any = localStorage.getItem('DarkMode');
    this.darkMode = JSON.parse(theme);
  }

  select($event: { emoji: any }, task: Task) {
    task.emoji = $event.emoji;
    this.disableAnimations = true;
    this.todoService.updateTask(task);
    setTimeout(() => {
      this.disableAnimations = false;
    }, 100);
    this.snackBar.open('Emoji has been updated 😄', 'OK', {
      duration: 2000,
      verticalPosition: 'top'
    });
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

  onDragStarted(event: CdkDragStart) {
    // console.log('Dragging started:', event);
    this.deleteBtn = true;
    document.getElementById('layout').classList.add('dragging');
  }

  onDragMoved(event: CdkDragMove) {
    // Get the current drag position
    const dragPosition = event.pointerPosition;

    // Get the bounding box of the cdkDrag element
    const boundingBox = event.source.element.nativeElement.getBoundingClientRect();

    // Calculate the mouse position relative to the bounding box
    const mouseX = dragPosition.x - boundingBox.left - 14000;
    const mouseY = dragPosition.y - boundingBox.top;

    // Log or use the mouseX and mouseY values as needed
    // console.log('Mouse X:', mouseX, 'Mouse Y:', mouseY);

    const dropPointElement = document.elementFromPoint(mouseX, mouseY);
    if (dropPointElement) {
      const dropReceiver = dropPointElement.closest('.drop-receiver');
      if (dropReceiver) {
        const dropEvent = new CustomEvent('_hover');
        dropReceiver.dispatchEvent(dropEvent);
        document.getElementById('delete-btn').classList.add('hovered');
      } else {
        document.getElementById('delete-btn').classList.remove('hovered');
      }
    }
  }

  onDragEnded(event: CdkDragEnd, task: any) {
    // console.log('Dragging ended:', event);
    // console.log('task:', task);
    this.deleteBtn = false
    this.isOverDelete = false;
    this.disableAnimations = true;
    document.getElementById('layout').classList.remove('dragging');
    const dropPointElement = document.elementFromPoint(event.dropPoint.x, event.dropPoint.y);
    if (dropPointElement) {
      const dropReceiver = dropPointElement.closest('.drop-receiver');
      if (dropReceiver) {
        const dropEvent = new CustomEvent('_drop', {detail: task});
        dropReceiver.dispatchEvent(dropEvent);
      }
    }
    setTimeout(() => {
      this.disableAnimations = false;
    }, 100);
  }

  onHoverDelete(event: any) {
    this.isOverDelete = true;
    // console.log('hovering on delete!');
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
    // // console.log('event.container:', event.container)
    // this.incompleteTasks.forEach(task => task.checked = false);
    // // console.log('Incomplete Tasks:', this.incompleteTasks);
    // this.completedTasks.forEach(task => task.checked = true);
    // // console.log('Completed Tasks:', this.completedTasks);
    // this.todoService.saveTasksToLocalStorage();
    // this.todoService.updateStatusArrays();
  }

  undoDelete() {
    if (this.deletedTask) {
      this.disableAnimations = true;
      this.todoService.restoreTask(this.deletedTask);
      this.deletedTask = null;
      setTimeout(() => {
        this.disableAnimations = false;
      }, 100);
      this.snackBar.open('The task was restored 🔄️', 'OK', {
        duration: 2000,
        verticalPosition: 'top'
      });
    }
  }

  onDelete(event: any) {
    if(event){
      this.disableAnimations = true;
      let task = event.detail
      this.deletedTask = task;
      // this.scrollToStart();
      // this.selectedTagIndex = -1;
      // this.todoService.loadTasksFromLocalStorage();
      this.todoService.deleteTasks(task);
      this.allTasks = JSON.parse(localStorage.getItem('tasks'));
      this.getlocalTags();
      this.getSelectedTag();
      setTimeout(() => {
        this.disableAnimations = false;
      }, 100);

      let snackBarRef = this.snackBar.open('The task was deleted 🗑️', 'UNDO', {
        duration: 2000,
        verticalPosition: 'top'
      });
      snackBarRef.onAction().subscribe(() => {
        this.undoDelete();
        this.getlocalTags();
        this.getSelectedTag();
      });

    }
  }

  getDeviceTheme(){
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Retrieve the theme preference from local storage
    const storedPreference = localStorage.getItem(this.localStorageKey);

    // Set the initial theme based on device preference or stored preference
    this.isDarkMode = storedPreference ? JSON.parse(storedPreference) : prefersDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Update the theme when the device's color scheme changes
      this.isDarkMode = e.matches;
      this.todoService.toggleDarkMode(this.isDarkMode);
    });
  }

  checkActivePWAState = () => {
    window.addEventListener("visibilitychange", () => {
      // console.log("Visibility changed");
      if (document.visibilityState === "visible") {
        // console.log("App resumed");
        const currentDate = new Date().setHours(0,0,0,0);
        const appDate = this.todaysDate.setHours(0,0,0,0);
        if (appDate < currentDate) {
          // console.log("Header date is behind current date. Reloading app...");
          window.location.reload();
        }
      }
    });
  }

  getSelectedTag(){
    const tagIndex = JSON.parse(localStorage.getItem('selectedTag') as string);
    if(tagIndex !== null){
      this.selectedTagIndex = tagIndex;
      var selectedTag = this.filterTags[tagIndex];
      if(selectedTag == undefined){
        this.selectedTagIndex = -1;
        selectedTag = {name: 'All'}
        localStorage.setItem('selectedTag', this.selectedTagIndex.toString())
      }
      const tasksList = this.findTasksWithTag(this.allTasks, selectedTag);
      this.todoService.loadTasksFromLocalStorage(tasksList); // send the queried tasks
      setTimeout(() => {
        let el = document.getElementById(selectedTag.name)
        el.scrollIntoView({behavior: "smooth",block: "start",inline: "center"});
      }, 10);
    } else {
      this.selectedTagIndex = -1;
    }
    console.log(this.selectedTagIndex);
  }

  getlocalTags(flag?) {
    let tasks = [];
    let tagCounts = {};
    if(flag) {
      tasks = JSON.parse(localStorage.getItem('tasks'));
    } else {
      tasks = this.allTasks;
    }
    // const taskLists = JSON.parse(localStorage.getItem('tasks'));
    tasks.forEach(task => {
      task.tags.forEach(tag => {
        if (!task.archived) {
          tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
        }
      });
    });

    let tags = [];
    for (let tagName in tagCounts) {
      tags.push({ name: tagName, count: tagCounts[tagName] });
    }

    this.filterTags = tags.sort(
      function (a, b) {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
    console.log('filterTags',this.filterTags);
  }

  onSelectTags(index){
    if(this.selectedTagIndex === index) return;
    this.selectedTagIndex = index;
    localStorage.setItem('selectedTag', this.selectedTagIndex.toString());
    this.todoService.loadTasksFromLocalStorage();
    let tasksList = [];
    let selectedTag = this.filterTags[index];
    if(index == -1) {
      selectedTag = {name: 'All'}
    } else {
      tasksList = this.findTasksWithTag(this.allTasks, selectedTag);
      this.todoService.loadTasksFromLocalStorage(tasksList); // send the queried tasks
    }
  }

  findTasksWithTag(tasks, targetTag) {
    return tasks.filter(task => task.tags.some(tag => tag.name === targetTag.name));
  }

  scrollToStart() {
    this.carousel?.nativeElement.scrollTo({ left: 0, behavior: 'smooth' });
  }

  scrollRight() {
    this.carousel?.nativeElement.scrollTo({ left: (this.carousel?.nativeElement.scrollLeft + 150), behavior: 'smooth' });
  }

  scrollLeft() {
    this.carousel?.nativeElement.scrollTo({ left: (this.carousel?.nativeElement.scrollLeft - 150), behavior: 'smooth' });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkButtonVisibility();
  }

  checkButtonVisibility() {
    const containerWidth = this.carousel?.nativeElement.clientWidth;
    const totalWidth = this.carousel?.nativeElement.scrollWidth;
    const scrollLeft = this.carousel?.nativeElement.scrollLeft;

    this.showPrevButton = totalWidth > containerWidth;
    this.showNextButton = totalWidth > containerWidth;
  }

  collapseFtreTsks() {
    this.collapseFutureTsks = !this.collapseFutureTsks;
    localStorage.setItem( 'collapseFutureTsks', this.collapseFutureTsks.toString());
  }

  collapseCmpltdTsks() {
    this.collapseCompletedTsks = !this.collapseCompletedTsks;
    localStorage.setItem( 'collapseCompletedTsks', this.collapseCompletedTsks.toString());
  }

  trackByFn(index: number, item: any): string {
    return item.id;
  }

  ngAfterViewChecked(){
    this.checkButtonVisibility();
  }
}
