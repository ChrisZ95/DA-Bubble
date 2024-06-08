import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IdleService {
  constructor() // private rdb: Database // public router: Router, // private myFirebaseApp: FirebaseApp,
  {}
  //Adrian wird noch in einen anderen Service verschoben
  // const mouseMove$ = fromEvent(document, 'mousemove');
  // this.idleTimer$ = mouseMove$.pipe(
  //   debounceTime(500),
  //   switchMap(() => timer(500))
  // );
  // this.mouseMoveAfterIdle$ = this.idleTimer$.pipe(
  //   switchMap(() => mouseMove$),
  //   debounceTime(100)
  // );
  // this.noMouseMoveIdle$ = mouseMove$.pipe(
  //   debounceTime(300000),
  //   switchMap(() => timer(500))
  // );
  // const keyPress$ = fromEvent(document, 'keydown');
  // this.idleTimer$ = keyPress$.pipe(
  //   debounceTime(500),
  //   switchMap(() => timer(500))
  // );
  // this.keyPressAfterIdle$ = this.idleTimer$.pipe(
  //   switchMap(() => keyPress$),
  //   debounceTime(100)
  // );
  // this.noKeyPressIdle$ = keyPress$.pipe(
  //   debounceTime(30000),
  //   switchMap(() => timer(500))
  // );

  // idleTimer$: Observable<any>;
  // mouseMoveAfterIdle$: Observable<any>;
  // noMouseMoveIdle$: Observable<any>;
  // keyPressAfterIdle$: Observable<any>;
  // noKeyPressIdle$: Observable<any>;
  // isUserIdle(): Observable<any> {
  //   return this.idleTimer$;
  // }
  // onMouseMoveAfterIdle(): Observable<void> {
  //   return this.mouseMoveAfterIdle$;
  // }
  // noMouseMoveAfterIdle(): Observable<void> {
  //   return this.noMouseMoveIdle$;
  // }
  // onKeyPressAfterIdle(): Observable<void> {
  //   return this.keyPressAfterIdle$;
  // }
  // noKeyPressAfterIdle(): Observable<void> {
  //   return this.noKeyPressIdle$;
  // }
}
