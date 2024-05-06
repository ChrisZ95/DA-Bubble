import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const isAuthenticated = localStorage.getItem('logedIn');

  if (!isAuthenticated) {
    router.navigate(['']);
    return false;
  }
  return true;
};
