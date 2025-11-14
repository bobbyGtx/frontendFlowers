import {Component, Inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA, MatSnackBarRef} from '@angular/material/snack-bar';

@Component({
  selector: 'app-snackbar-message',
  template: `
    <div class="snackbar-container">
      <div class="snackbar-header">
        <div class="snackbar-title" [class.info]="data.dlgType==='snackbar-info'" [class.success]="data.dlgType==='snackbar-success'">{{ data.message }}</div>
        <button mat-button class="snackbar-close-btn" (click)="close()">OK</button>
      </div>
      <ul *ngIf="data.messages?.length">
        <li *ngFor="let msg of data.messages">{{ msg }}</li>
      </ul>
    </div>
  `,
  styleUrl: './snackbar-message.component.scss'
})
export class SnackbarMessageComponent {
  constructor(
    public snackBarRef: MatSnackBarRef<SnackbarMessageComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: { message: string, dlgType:string, messages?: string[] }
  ) {}
  close(): void {
    this.snackBarRef.dismiss();
  }
}
