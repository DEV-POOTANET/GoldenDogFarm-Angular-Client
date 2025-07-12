import { Component , Input } from '@angular/core';

@Component({
  selector: 'app-my-modal',
  imports: [],
  templateUrl: './my-modal.component.html',
  styleUrl: './my-modal.component.css'
})
export class MyModalComponent {
  @Input() modalId: string = '';
  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() modalSize: string = '';
}
