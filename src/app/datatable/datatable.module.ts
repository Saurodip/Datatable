import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe, LowerCasePipe, UpperCasePipe } from '@angular/common';
import { DataTableComponent } from './component/datatable.component';
import { HoverDirective } from './directive/hover.directive';
import { DataTableElementReferenceService } from './services/datatable.element-reference.service';
import { DataTablePaginationService } from './services/datatable.pagination.service';
import { DataTablePipeService } from './services/datatable.pipe';
import { DataTableSearchService } from './services/datatable.search.service';
import { DataTableSelectionService } from './services/datatable.selection.service';
import { DataTableSortService } from './services/datatable.sort.service';
import { DataTableUIService } from './services/datatable.ui.service';

@NgModule({
    declarations: [
        DataTableComponent,
        HoverDirective
    ],
    exports: [
        DataTableComponent,
        HoverDirective
    ],
    imports: [
        BrowserModule
    ],
    providers: [
        CurrencyPipe,
        DataTableElementReferenceService,
        DataTablePaginationService,
        DataTablePipeService,
        DataTableSearchService,
        DataTableSelectionService,
        DataTableSortService,
        DataTableUIService,
        DatePipe,
        DecimalPipe,
        LowerCasePipe,
        UpperCasePipe
    ]
})

export class DataTableModule { }
