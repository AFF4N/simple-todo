import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { from, Observable, switchMap, take } from 'rxjs';
import { Tag } from '../models/tag.model';
import { collection, deleteDoc, doc, Firestore, getDocs, query, updateDoc, where } from '@angular/fire/firestore';

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

  async create(tag: Tag): Promise<void> {
    const id = this.db.createId();
    try {
      await this.tagsCollection.doc(id).set({ ...tag, id });
    } catch (error) {
      console.error('Error adding todo:', error);
      throw new Error('Failed to add todo'); // Throw error to propagate it up
    }
  }

  update(id: string, data: any): Promise<void> {
    return this.tagsCollection.doc(id).set(data);
  }

  // delete(id: string): Promise<void> {
  //   return this.tagsCollection.doc(id).delete();
  // }

  async delete(tagId: string) {
    // Step 1: Delete the tag from the 'tags' collection
    return this.tagsCollection.doc(tagId).delete()
      .then(() => {
        // Step 2: Get all tasks and filter the tags array
        return this.db.collection('todos')
          .get()
          .toPromise()
          .then(snapshot => {
            const batch = this.db.firestore.batch();

            snapshot.forEach((doc: any) => {
              const taskRef = this.db.collection('todos').doc(doc.id).ref;
              const currentTags = doc.data().tags || [];

              // Filter out the tag with the matching tagId
              const updatedTags = currentTags.filter((tag: any) => tag.id !== tagId);

              // If tags were updated, batch the update
              if (currentTags.length !== updatedTags.length) {
                batch.update(taskRef, { tags: updatedTags });
              }
            });

            // Step 3: Commit the batch update to Firestore
            return batch.commit();
          });
      });
  }

}
