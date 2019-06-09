import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe, LowerCasePipe, UpperCasePipe } from '@angular/common';
import { DataTableComponent } from './component/datatable.component';
import { HoverDirective } from './directive/hover.directive';
import { DataTableService } from './component/datatable.service';

@NgModule({
    declarations: [DataTableComponent, HoverDirective],
    exports: [DataTableComponent, HoverDirective],
    imports: [BrowserModule],
    providers: [CurrencyPipe, DataTableService, DatePipe, DecimalPipe, LowerCasePipe, UpperCasePipe]
})

export class DataTableModule { }
