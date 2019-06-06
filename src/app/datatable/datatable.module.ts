import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DataTableComponent } from './component/datatable.component';
import { HoverDirective } from './directive/hover.directive';

@NgModule({
    declarations: [DataTableComponent, HoverDirective],
    exports: [DataTableComponent, HoverDirective],
    imports: [BrowserModule],
})

export class DataTableModule { }
