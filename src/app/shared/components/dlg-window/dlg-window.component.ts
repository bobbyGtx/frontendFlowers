import {Component, ElementRef, inject, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {DlgWindowService} from '../../services/dlg-window.service';
import {DialogDataType} from '../../../../assets/types/dialog-data.type';

@Component({
  selector: 'dlg-window',
  templateUrl: './dlg-window.component.html',
  styleUrl: './dlg-window.component.scss'
})

export class DlgWindowComponent implements OnInit, OnDestroy {
  @ViewChild('popup') popup!: TemplateRef<ElementRef>;
  private router:Router=inject(Router);
  private dialog: MatDialog = inject(MatDialog);
  private dlgWindowService: DlgWindowService=inject(DlgWindowService);

  protected title:string='title';
  protected htmlContent:string='';
  protected redirectUrl:string[]|null=null;
  private dialogRef: MatDialogRef<any> | null = null;

  private subscriptions$: Subscription = new Subscription();

  ngOnInit() {

    this.subscriptions$.add(
      this.dlgWindowService.dlgOpenState$.subscribe((data:DialogDataType) => {
        this.title = data.title;
        this.htmlContent = data.htmlContent;
        this.redirectUrl=data.redirectUrl;
        this.dialogRef = this.dialog.open(this.popup, {
          height: 'unset',
          maxWidth: 'unset'
        });
        const closeDlgSubscription$:Subscription = this.dialogRef.afterClosed().subscribe(() => {
          if (this.redirectUrl !== null) this.router.navigate(this.redirectUrl);

          closeDlgSubscription$.unsubscribe();
        });

      })
    );
  }

  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }
}
