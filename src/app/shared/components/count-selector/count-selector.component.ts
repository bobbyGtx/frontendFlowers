import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {ShowSnackService} from '../../../core/show-snack.service';
import {debounceTime, filter, Subject,} from 'rxjs';

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
        filter((cartCount:number) => cartCount !== -1)
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
    if (!(event.target as HTMLInputElement).value) this.filter.next(-1);
    let newValue:number=Number((event.target as HTMLInputElement).value);
    if (!newValue || newValue < 1) return;
    if (newValue > this.maxCount){
      this.count = this.maxCount;
      this.showSnackService.error(`Доступно ${this.maxCount} единиц товара!`);
    }
    this.filter.next(this.count);
  }
  onBlur(event:Event){
    if (!(event.target as HTMLInputElement).value) this.filter.next(1);
  }

  decreaseCount(){
    if (!this.disabled && this.count>1) {
      this.count--;
      if (this.count > this.maxCount) this.count = this.maxCount;
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
