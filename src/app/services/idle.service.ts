import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, debounceTime, switchMap, timer, Observable, from } from 'rxjs';
import { Database, ref as reference, set, onValue, push, off } from '@angular/fire/database';

@Injectable({
  providedIn: 'root',
})
export class IdleService {
  // public auth: any;
  // public firestore: any;
  constructor(private rdb: Database, public router: Router) {
    const mouseMove$ = fromEvent(document, 'mousemove');
    this.idleTimer$ = mouseMove$.pipe(
      debounceTime(500),
      switchMap(() => timer(500))
    );
    this.mouseMoveAfterIdle$ = this.idleTimer$.pipe(
      switchMap(() => mouseMove$),
      debounceTime(100)
    );
    this.noMouseMoveIdle$ = mouseMove$.pipe(
      debounceTime(300000),
      switchMap(() => timer(500))
    );
    const keyPress$ = fromEvent(document, 'keydown');
    this.idleTimer$ = keyPress$.pipe(
      debounceTime(500),
      switchMap(() => timer(500))
    );
    this.keyPressAfterIdle$ = this.idleTimer$.pipe(
      switchMap(() => keyPress$),
      debounceTime(100)
    );
    this.noKeyPressIdle$ = keyPress$.pipe(
      debounceTime(300000),
      switchMap(() => timer(500))
    );
  }

  idleTimer$: Observable<any>;
  mouseMoveAfterIdle$: Observable<any>;
  noMouseMoveIdle$: Observable<any>;
  keyPressAfterIdle$: Observable<any>;
  noKeyPressIdle$: Observable<any>;
  userStatus$!: Observable<string>;
  currentUserStatus: any = 'active';
  private userStatusMap = new Map<string, Observable<any>>();

  isUserIdle(): Observable<any> {
    return this.idleTimer$;
  }
  onMouseMoveAfterIdle(): Observable<void> {
    return this.mouseMoveAfterIdle$;
  }
  noMouseMoveAfterIdle(): Observable<void> {
    return this.noMouseMoveIdle$;
  }
  onKeyPressAfterIdle(): Observable<void> {
    return this.keyPressAfterIdle$;
  }
  noKeyPressAfterIdle(): Observable<void> {
    return this.noKeyPressIdle$;
  }

  // setData(path: string, data: any) {
  //   const dbRef = reference(this.rdb, path);
  //   return from(set(dbRef, data));
  // }

  pushData(path: string, data: any) {
    const dbRef = reference(this.rdb, path);
    return from(push(dbRef, data));
  }

  // getUserStatus(uid: string): Observable<any> {
  //   const statusRef = reference(this.rdb, `users/${uid}/activeStatus`);
  //   return new Observable((observer) => {
  //     onValue(statusRef, (snapshot) => {
  //       observer.next(snapshot.val());
  //       this.currentUserStatus = snapshot.val();
  //     });
  //   });
  // }
  // setUserStatus(uid: string, status: string) {
  //   this.updateActiveStatus(uid, status);
  // }

  // public getOtherUserStatus(uid: string): Observable<any> {
  //   const statusRef = reference(this.rdb, `users/${uid}/activeStatus`);
  //   return new Observable((observer) => {
  //     onValue(statusRef, (snapshot) => {
  //       observer.next(snapshot.val());
  //       return snapshot.val();
  //     });
  //   });
  // }

  // updateActiveStatus(key: string, value: any): void {
  //   let status = {
  //     uid: key,
  //     activeStatus: value,
  //   };
  //   this.setData(`users/${key}`, status);
  //   this.currentUserStatus = value;
  // }

  setData(path: string, data: any): Promise<void> {
    const dbRef = reference(this.rdb, path);
    return set(dbRef, data);
  }

  public getUserStatus(uid: string): Observable<any> {
    return new Observable((observer) => {
      const statusRef = reference(this.rdb, `users/${uid}/activeStatus`);
      const callback = (snapshot: any) => {
        observer.next(snapshot.val());
        this.currentUserStatus = snapshot.val();
      };
      onValue(statusRef, callback);

      // Unsubscribe logic to prevent memory leaks
      return () => off(statusRef, 'value', callback);
    });
  }

  public setUserStatus(uid: string, status: string): void {
    this.updateActiveStatus(uid, status);
  }

  public getOtherUserStatus(uid: string): Observable<any> {
    if (!this.userStatusMap.has(uid)) {
      const status$ = new Observable((observer) => {
        const statusRef = reference(this.rdb, `users/${uid}/activeStatus`);
        const callback = (snapshot: any) => {
          observer.next(snapshot.val());
        };
        onValue(statusRef, callback);

        // Unsubscribe logic to prevent memory leaks
        return () => off(statusRef, 'value', callback);
      });

      this.userStatusMap.set(uid, status$);
    }
    return this.userStatusMap.get(uid)!;
  }

  updateActiveStatus(uid: string, status: string): void {
    const userStatus = { uid, activeStatus: status };
    this.setData(`users/${uid}`, userStatus).then(() => {
      this.currentUserStatus = status;
    });
  }
}
