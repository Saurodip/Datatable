import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe, LowerCasePipe, UpperCasePipe } from '@angular/common';
import { DataTableComponent } from './component/datatable.component';
import { DataTablePopupComponent } from './component/popup/datatable-popup.component';
import { DataTableTooltipComponent } from './component/tooltip/datatable-tooltip.component';
import { DataTableHoverDirective } from './directive/hover.directive';
import { DataTableActionsToolbarService } from './services/datatable.actions-toolbar.service';
import { DataTableElementReferenceService } from './services/datatable.element-reference.service';
import { DataTableExportService } from './services/datatable.export.service';
import { DataTablePaginationService } from './services/datatable.pagination.service';
import { DataTablePipeService } from './services/datatable.pipe';
import { DataTableFilterService } from './services/datatable.filter.service';
import { DataTableSelectionService } from './services/datatable.selection.service';
import { DataTableSortService } from './services/datatable.sort.service';
import { DataTableUIService } from './services/datatable.ui.service';
import { DataTableVirtualScrollingService } from './services/datatable.virtual-scrolling.service';

@NgModule({
    declarations: [
        DataTableComponent,
        DataTablePopupComponent,
        DataTableTooltipComponent,
        DataTableHoverDirective
    ],
    exports: [
        DataTableComponent,
        DataTablePopupComponent,
        DataTableTooltipComponent,
        DataTableHoverDirective
    ],
    imports: [
        BrowserModule
    ],
    providers: [
        CurrencyPipe,
        DataTableActionsToolbarService,
        DataTableElementReferenceService,
        DataTableExportService,
        DataTablePaginationService,
        DataTablePipeService,
        DataTableFilterService,
        DataTableSelectionService,
        DataTableSortService,
        DataTableUIService,
        DataTableVirtualScrollingService,
        DatePipe,
        DecimalPipe,
        LowerCasePipe,
        UpperCasePipe
    ]
})

export class DataTableModule { }
