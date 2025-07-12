import { Routes } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';
import { UsersComponent} from './users/users.component';
import {DogColorsComponent} from './dog-colors/dog-colors.component';

export const routes: Routes = [
    {
        path: '',
        component: SignInComponent,
    },
    {
      path: 'users',
      component: UsersComponent,
    },
    {
      path: 'dogcolors',
      component: DogColorsComponent,
    }
];
