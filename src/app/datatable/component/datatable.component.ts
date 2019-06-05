import { Component, OnInit, AfterViewInit, AfterViewChecked, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { DataTableHeader, DataTableHeaderStyle, DataTableRowStyle } from '../datatable.model';

@Component({
    selector: 'app-datatable',
    templateUrl: './datatable.component.html',
    styleUrls: ['./datatable.component.scss']
})
export class DataTableComponent implements OnInit, AfterViewInit, AfterViewChecked {
    private isCompletelyRendered: boolean;
    private scrollbarWidth: number;
    public frozenHeader: DataTableHeader[];
    public scrollableHeader: DataTableHeader[];
    public scrollableAreaWidth: string;
    public responsiveColumnWidth: string;
    public rowContainerHeight: string;
    private rowSelectionClassName: string;

    @Input() public checkboxSelection: string;
    @Input() public columnFilter: boolean;
    @Input() public columnResponsive: boolean;
    @Input() public data: object[];
    @Input() public filterTextLimit: number;
    @Input() public globalFilter: boolean;
    @Input() public header: DataTableHeader[];
    @Input() public headerStyle: DataTableHeaderStyle;
    @Input() public height: string;
    @Input() public rowStyle: DataTableRowStyle;

    @ViewChild('dataTable') private dataTable: ElementRef;

    constructor() {
        this.isCompletelyRendered = false;
        this.scrollbarWidth = 17;
        this.frozenHeader = [];
        this.scrollableHeader = [];
        this.scrollableAreaWidth = '';
        this.responsiveColumnWidth = '';
        this.rowContainerHeight = '';
        this.rowSelectionClassName = 'selected-row';
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.setHeightOfDataTableRowContainer();
        this.calculateDataTableHeaderWidth();
    }

    ngAfterViewChecked() {
        let dataTableBody: HTMLElement = this.getHTMLElementInstance('scrollable-area-datatable-body');
        if ((dataTableBody && dataTableBody['children'].length > 0) && !this.isCompletelyRendered) {
            this.isCompletelyRendered = true;
            this.setDataTableStyling(dataTableBody);
            this.activateScrollingEvent(dataTableBody);
        }
    }

    private getHTMLElementInstance = (element: string): HTMLElement => {
        switch (element) {
            case 'datatable-frozen-area': return document.querySelector('.datatable-frozen-area');
            case 'datatable-scrollable-area': return document.querySelector('.datatable-scrollable-area');
            case 'datatable-scrollable-header-wrapper': return document.querySelector('.datatable-scrollable-area .datatable-header-wrapper');
            case 'datatable-header-container': return document.querySelector('.datatable-header-container');
            case 'datatable-scrollable-filter-wrapper': return document.querySelector('.datatable-scrollable-area .datatable-filter-wrapper');
            case 'datatable-filter-container': return document.querySelector('.datatable-filter-container');
            case 'action-container': return document.querySelector('.action-container');
            case 'frozen-area-datatable-body': return document.querySelector('.datatable-frozen-area .datatable-body');
            case 'scrollable-area-datatable-body': return document.querySelector('.datatable-scrollable-area .datatable-body');
            case 'datatable-row': return document.querySelector('.datatable-row');
            default: break;
        }
    }

    private setHeightOfDataTableRowContainer = (): void => {
        let dataTableHeaderContainer: HTMLElement = this.getHTMLElementInstance('datatable-header-container');
        let dataTableFilterContainer: HTMLElement = this.getHTMLElementInstance('datatable-filter-container');
        if (dataTableHeaderContainer && dataTableFilterContainer) {
            this.rowContainerHeight = parseFloat(this.height) - (dataTableHeaderContainer['offsetHeight'] + dataTableFilterContainer['offsetHeight']) + 'px';
        }
    }

    private calculateDataTableHeaderWidth = (): void => {
        let dataTable: HTMLElement = this.dataTable && this.dataTable.nativeElement;
        let actionContainer: HTMLElement = this.getHTMLElementInstance('action-container');
        if (dataTable && actionContainer && (this.header && this.header.length > 0)) {
            let totalDataTableHeaderWidth: number = 0;
            this.header.forEach((header: DataTableHeader, index: number) => {
                totalDataTableHeaderWidth += parseFloat(header.columnWidth);
                if (index === this.header.length - 1) {
                    if (totalDataTableHeaderWidth <= dataTable['offsetWidth']) {
                        this.columnResponsive = true;
                    }
                }
            });
            this.frozenHeader = this.header.filter((dataTableHeader: DataTableHeader) => dataTableHeader.isFrozen === true);
            this.scrollableHeader = this.header.filter((dataTableHeader: DataTableHeader) => !dataTableHeader.isFrozen);
            if (this.columnResponsive) {
                this.responsiveColumnWidth = Math.floor((dataTable['offsetWidth'] - (actionContainer['offsetWidth'] + this.scrollbarWidth)) / this.header.length) + 'px';
            } else {
                let frozenHeaderArea: number = actionContainer['offsetWidth'];
                this.frozenHeader.forEach((header: DataTableHeader, index: number) => {
                    frozenHeaderArea += parseFloat(header.columnWidth);
                });
                this.scrollableAreaWidth = (dataTable['offsetWidth'] - frozenHeaderArea) + 'px';
            }
        }
    }

    private setDataTableStyling = (dataTableBody: HTMLElement): void => {
        let dataTableHeaderContainer: HTMLElement = this.getHTMLElementInstance('datatable-header-container');
        if (dataTableHeaderContainer && this.headerStyle) {
            for (let property in this.headerStyle) {
                if (this.headerStyle.hasOwnProperty(property)) {
                    dataTableHeaderContainer['style'][property] = this.headerStyle[property];
                }
            }
        }
        if (this.rowStyle) {
            for (let property in this.rowStyle) {
                if (this.rowStyle.hasOwnProperty(property)) {
                    for (let index = 0; index < dataTableBody['children'].length; index++) {
                        dataTableBody['children'][index]['style'][property] = this.rowStyle[property];
                    }
                }
            }
        }
    }

    private activateScrollingEvent = (dataTableBody: HTMLElement): void => {
        let dataTableScrollableHeaderWrapper: HTMLElement = this.getHTMLElementInstance('datatable-scrollable-header-wrapper');
        let dataTableScrollableFilterWrapper: HTMLElement = this.getHTMLElementInstance('datatable-scrollable-filter-wrapper');
        let frozenAreaDataTableBody: HTMLElement = this.getHTMLElementInstance('frozen-area-datatable-body');
        dataTableBody.addEventListener('scroll', (event: MouseEvent) => {
            let scrollLeftPosition: number = 0;
            let scrollTopPosition: number = 0;
            let horizontalScrollbars: HTMLElement[] = [];
            let verticalScrollbars: HTMLElement[] = [];
            if (event && event.currentTarget) {
                scrollLeftPosition = event.currentTarget['scrollLeft'];
                scrollTopPosition = event.currentTarget['scrollTop'];
            }
            horizontalScrollbars = [dataTableScrollableHeaderWrapper, dataTableScrollableFilterWrapper];
            verticalScrollbars = [frozenAreaDataTableBody];
            horizontalScrollbars.forEach((element: HTMLElement) => element.scrollLeft = scrollLeftPosition);
            verticalScrollbars.forEach((element: HTMLElement) => element.scrollTop = scrollTopPosition);
        });
    }

    public onSelectDataTableSelectAll = (event: MouseEvent): void => {
        if (event && event.currentTarget) {
            if (this.data && this.data.length > 0) {
                for (let i = 1; i <= this.data.length; i++) {
                    let dataTableRow: any = document.getElementById('datatable-row-' + i);
                    if (dataTableRow) {
                        if (event.currentTarget['checked']) {
                            let isSelectedRowClassPresent: boolean = dataTableRow.className.indexOf(this.rowSelectionClassName) !== -1 ? true : false;
                            if (!isSelectedRowClassPresent) {
                                dataTableRow.className = this.rowSelectionClassName + ' ' + dataTableRow.className;
                            }
                            if (this.rowStyle && this.rowStyle.selectionColor) {
                                dataTableRow.style.backgroundColor = this.rowStyle.selectionColor;
                            }
                        } else {
                            dataTableRow.className = dataTableRow.className && dataTableRow.className.replace(this.rowSelectionClassName, '').trim();
                            dataTableRow.style.backgroundColor = '';
                        }
                    }
                    if (this.checkboxSelection) {
                        let checkboxElement: any = document.getElementById('datatable-checkbox-' + i);
                        if (checkboxElement) {
                            checkboxElement.checked = event.currentTarget['checked'];
                        }
                    }
                }
            }
        }
    }

    public onSelectDataTableRow = (event: MouseEvent): void => {
        let isSelectedRowClassPresent: boolean = false;
        if (event && event.currentTarget && event.currentTarget['className']) {
            isSelectedRowClassPresent = event.currentTarget['className'].indexOf(this.rowSelectionClassName) !== -1 ? true : false;
            if (!isSelectedRowClassPresent) {
                event.currentTarget['className'] = this.rowSelectionClassName + ' ' + event.currentTarget['className'];
                if (this.rowStyle && this.rowStyle.selectionColor) {
                    event.currentTarget['style'].backgroundColor = this.rowStyle.selectionColor;
                }
            } else {
                event.currentTarget['className'] = event.currentTarget['className'].replace(this.rowSelectionClassName, '').trim();
                event.currentTarget['style'].backgroundColor = '';
            }
        }
        if (this.checkboxSelection) {
            let rowIndex: number = event.currentTarget['id'] && event.currentTarget['id'].replace(/^\D+/g, '');
            if (rowIndex) {
                let checkboxElement: any = document.getElementById('datatable-checkbox-' + rowIndex);
                if (checkboxElement) {
                    checkboxElement.checked = !isSelectedRowClassPresent;
                }
            }
        }
        this.determineSelectAllCheckboxState();
    }

    private determineSelectAllCheckboxState = (): void => {
        let selectAllCheckbox: any = document.getElementById('datatable-select-all-checkbox');
        let noOfSelectedDataTableCheckbox: number = 0;
        let totalNoOfDataTableRows: number = this.data && this.data.length || 0;
        for (let i = 1; i <= totalNoOfDataTableRows; i++) {
            let dataTableRow: any = document.getElementById('datatable-row-' + i);
            if (dataTableRow) {
                let isSelectedRowClassPresent: boolean = dataTableRow['className'].indexOf(this.rowSelectionClassName) !== -1 ? true : false;
                if (isSelectedRowClassPresent) {
                    noOfSelectedDataTableCheckbox++;
                }
            }
        }
        if (selectAllCheckbox) {
            selectAllCheckbox.indeterminate = false;
            if (noOfSelectedDataTableCheckbox === totalNoOfDataTableRows) {
                selectAllCheckbox.checked = true;
            } else if (noOfSelectedDataTableCheckbox > 0 && noOfSelectedDataTableCheckbox < totalNoOfDataTableRows) {
                selectAllCheckbox.indeterminate = true;
            } else if (noOfSelectedDataTableCheckbox === 0) {
                selectAllCheckbox.checked = false;
            }
        }
    }
}
