import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Tag } from '../models/tag.model';

@Injectable({
  providedIn: 'root'
})

export class TagService {

  private tagsCollection = this.db.collection('tags');

  constructor(private db: AngularFirestore) {}

  // Fetch all tags
  getTags(): Observable<Tag[]> {
    return this.tagsCollection.valueChanges({ idField: 'id' }) as Observable<any[]>;
  }

  // Fetch a single tag by ID
  getTagById(id: string): Observable<Tag> {
    return this.tagsCollection.doc(id).valueChanges() as Observable<Tag>;
  }

  create(tag: Tag): any {
    return this.tagsCollection.add({ ...tag });
  }

  update(id: string, data: any): Promise<void> {
    return this.tagsCollection.doc(id).set(data);
  }

  delete(id: string): Promise<void> {
    return this.tagsCollection.doc(id).delete();
  }
}
