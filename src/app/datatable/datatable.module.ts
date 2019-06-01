import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DataTableComponent } from './component/datatable.component';
import { SelectionDirective } from './directive/selection.directive';

@NgModule({
    declarations: [DataTableComponent, SelectionDirective],
    exports: [DataTableComponent, SelectionDirective],
    imports: [BrowserModule],
})

export class DataTableModule { }
