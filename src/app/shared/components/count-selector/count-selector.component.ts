import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {ShowSnackService} from '../../../core/show-snack.service';
import {debounceTime, Subject,} from 'rxjs';

@Component({
  selector: 'count-selector',
  templateUrl: './count-selector.component.html',
  styleUrl: './count-selector.component.scss'
})
export class CountSelectorComponent implements OnInit {
  showSnackService: ShowSnackService=inject(ShowSnackService);
  @Input() maxCount:number= 0;
  @Input() disabled:boolean = true;
  @Input() count:number = 1;
  @Output() onCountChange:EventEmitter<number> = new EventEmitter<number>();
  filter:Subject<number> = new Subject<number>();

  ngOnInit() {
    if (this.disabled) {
      this.count = 0;
      this.maxCount=0;
    }
    this.filter
      .pipe(
        debounceTime(300),
      )
      .subscribe(cartCount => {
        this.onCountChange.emit(cartCount);
      });
  }

  onChangeCount(event:Event){
    if (this.disabled) {
      this.count = 0;
      return
    }
    let newValue:number=Number((event.target as HTMLInputElement).value);
    if (newValue > this.maxCount){
      this.count = this.maxCount;
      this.showSnackService.error(`Доступно ${this.maxCount} единиц товара!`);
    }
    if (!newValue || newValue < 1) this.count = 1;
    this.filter.next(this.count);
  }

  decreaseCount(){
    if (!this.disabled && this.count>1) {
      this.count--;
      this.filter.next(this.count);
    }
  }

  increaseCount(){
    if (!this.disabled && this.count < this.maxCount) {
      this.count++;
      this.filter.next(this.count);
    }
  }
}
