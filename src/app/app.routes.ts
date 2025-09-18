import {Routes} from '@angular/router';
import {SignInComponent} from './sign-in/sign-in.component';
import {UsersComponent} from './users/users.component';
import {DogColorsComponent} from './dog-colors/dog-colors.component';
import {DogPositionsComponent} from './dog-positions/dog-positions.component';
import {ClinicComponent} from './clinic/clinic.component';
import {VetComponent} from './vet/vet.component';
import {TreatmentListComponent} from './treatment-list/treatment-list.component';
import {CustomersComponent} from './customers/customers.component';
import {VaccineListComponent} from './vaccine-list/vaccine-list.component';
import {HealthCheckListComponent} from './health-check-list/health-check-list.component';
import {AddDogsComponent} from './dogs/add-dogs/add-dogs.component';
import {ViewDogsComponent} from './dogs/view-dogs/view-dogs.component';
import {ManagePositionComponent} from './dogs/manage-position/manage-position.component';
import {EditDogComponent} from './dogs/edit-dog/edit-dog.component';
import {ViewDogdtlComponent} from './dogs/view-dogdtl/view-dogdtl.component';
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
    path: 'treatment-list',
    component: TreatmentListComponent,
  },
  {
    path: 'vaccine-list',
    component: VaccineListComponent,
  },
  {
    path: 'health-check-list',
    component: HealthCheckListComponent,
  },
  {
    path: 'customers',
    component: CustomersComponent,
  },
  {
    path: 'add-dogs',
    component: AddDogsComponent,
  },
  {
    path: 'view-dogs',
    component: ViewDogsComponent,
  },
  {
    path: 'manage-position/:id',
    component: ManagePositionComponent,
  },
  {
    path: 'edit-dog/:id',
    component: EditDogComponent,
  },
  {
    path: 'view-dogdtl/:id',
    component: ViewDogdtlComponent,
  }
];
