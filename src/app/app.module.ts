import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TodoListComponent } from './components/todo-list/todo-list.component';
import { MaterialModule } from 'src/material.module';
import { AddTodoComponent } from './components/add-todo/add-todo.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { ArchivedComponent } from './components/archived/archived.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AboutComponent } from './components/about/about.component';

@NgModule({
  declarations: [
    AppComponent,
    TodoListComponent,
    AddTodoComponent,
    ArchivedComponent,
    SettingsComponent,
    AboutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    PickerComponent,
    EmojiModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
