import {Component, inject} from '@angular/core';
import {LoaderService} from '../../services/loader.service';

@Component({
  selector: 'loader',
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent {
  protected loaderService: LoaderService=inject(LoaderService);
}
