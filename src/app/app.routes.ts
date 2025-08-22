import {Routes} from '@angular/router';
import {SignInComponent} from './sign-in/sign-in.component';
import {UsersComponent} from './users/users.component';
import {DogColorsComponent} from './dog-colors/dog-colors.component';
import {DogPositionsComponent} from './dog-positions/dog-positions.component';
import {ClinicComponent} from './clinic/clinic.component';
import {VetComponent} from './vet/vet.component';
import {TreatmentListComponent} from './treatment-list/treatment-list.component';
import {CustomersComponent} from './customers/customers.component';
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
  },
  {
    path: 'dogpositions',
    component: DogPositionsComponent,
  },
  {
    path: 'clinic',
    component: ClinicComponent,
  },
  {
    path: 'vet',
    component: VetComponent,
  },
  {
    path: 'treatmen-tlist',
    component: TreatmentListComponent,
  }
  ,
  {
    path: 'customers',
    component: CustomersComponent,
  }
];
