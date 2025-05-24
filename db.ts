import { openDB } from 'idb';

export const db = openDB('CourseDB', 1, {
  upgrade(db) {
    db.createObjectStore('files', { keyPath: 'id', autoIncrement: true });
    db.createObjectStore('courses', { keyPath: 'id', autoIncrement: true });
    db.createObjectStore('progress', { keyPath: 'chapterId' });
  },
});
