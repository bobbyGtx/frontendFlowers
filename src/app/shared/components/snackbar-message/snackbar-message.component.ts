import {Component, Inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA, MatSnackBarRef} from '@angular/material/snack-bar';

@Component({
  selector: 'app-snackbar-message',
  template: `
    <div class="snackbar-container">
      <div class="snackbar-header">
        <div class="snackbar-title">{{ data.message }}</div>
        <button mat-button class="snackbar-close-btn" (click)="close()">OK</button>
      </div>
      <ul *ngIf="data.errors?.length">
        <li *ngFor="let err of data.errors">{{ err }}</li>
      </ul>
    </div>
  `,
  styleUrl: './snackbar-message.component.scss'
})
export class SnackbarMessageComponent {
  constructor(
    public snackBarRef: MatSnackBarRef<SnackbarMessageComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: { message: string, errors?: string[] }
  ) {}
  close(): void {
    this.snackBarRef.dismiss();
  }
}
