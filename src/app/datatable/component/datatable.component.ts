import { Component, OnInit, AfterViewInit, AfterViewChecked, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { DataTableHeader, DataTableHeaderStyle, DataTableRowStyle } from '../datatable.model';

@Component({
    selector: 'app-datatable',
    templateUrl: './datatable.component.html',
    styleUrls: ['./datatable.component.scss']
})
export class DataTableComponent implements OnInit, AfterViewInit, AfterViewChecked {
    public frozenHeader: Array<DataTableHeader>;
    public scrollableHeader: Array<DataTableHeader>;
    public scrollableAreaWidth: string;
    private scrollbarWidth: number;
    public responsiveColumnWidth: string;
    public rowContainerHeight: string;
    private rowSelectionClassName: string;

    @Input() public checkboxSelection: string;
    @Input() public columnFilter: boolean;
    @Input() public columnResponsive: boolean;
    @Input() public data: Array<object>;
    @Input() public filterTextLimit: number;
    @Input() public globalFilter: boolean;
    @Input() public header: Array<DataTableHeader>;
    @Input() public headerStyle: DataTableHeaderStyle;
    @Input() public height: string;
    @Input() public rowStyle: DataTableRowStyle;

    @ViewChild('dataTable') private dataTable: ElementRef;

    constructor() {
        this.frozenHeader = [];
        this.scrollableHeader = [];
        this.scrollableAreaWidth = '';
        this.scrollbarWidth = 17;
        this.responsiveColumnWidth = '';
        this.rowContainerHeight = '';
        this.rowSelectionClassName = 'selected-row';
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.setHeightOfDataTableRowContainer();
        this.calculateDataTableHeaderWidth();
        this.activateHorizontalScrollEvent();
    }

    ngAfterViewChecked() {
        if (this.dataTable && this.dataTable.nativeElement) {
            if (this.dataTable.nativeElement.children && this.dataTable.nativeElement.children.length > 0) {
                let dataTableBody: object = document.getElementsByClassName('datatable-body')[0];
                // this.setDataTableStyling(dataTableHeaderContainer, dataTableBody);
            }
        }
    }

    private getHTMLElementInstance = (element: string): object => {
        switch (element) {
            case 'datatable-frozen-area': return document.querySelector('.datatable-frozen-area');
            case 'datatable-scrollable-area': return document.querySelector('.datatable-scrollable-area');
            case 'datatable-header-wrapper': return document.querySelector('.datatable-header-wrapper');
            case 'datatable-header-container': return document.querySelector('.datatable-header-container');
            case 'datatable-filter-wrapper': return document.querySelector('.datatable-filter-wrapper');
            case 'datatable-filter-container': return document.querySelector('.datatable-filter-container');
            case 'action-container': return document.querySelector('.action-container');
            case 'datatable-body': return document.querySelector('.datatable-body');
            case 'datatable-row': return document.querySelector('.datatable-row');
            default: break;
        }
    }

    private setHeightOfDataTableRowContainer = (): void => {
        let dataTableHeaderContainer: object = this.getHTMLElementInstance('datatable-header-container');
        let dataTableFilterContainer: object = this.getHTMLElementInstance('datatable-filter-container');
        if (dataTableHeaderContainer && dataTableFilterContainer) {
            this.rowContainerHeight = parseFloat(this.height) - (dataTableHeaderContainer['offsetHeight'] + dataTableFilterContainer['offsetHeight']) + 'px';
        }
    }

    private calculateDataTableHeaderWidth = (): void => {
        if (this.header && this.header.length > 0) {
            let dataTable: object = this.dataTable && this.dataTable.nativeElement;
            let actionContainer: object = this.getHTMLElementInstance('action-container');
            if (dataTable && actionContainer) {
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
    }

    private setDataTableStyling = (dataTableHeader: object, dataTableBody: object): void => {
        if (dataTableHeader && this.headerStyle) {
            for (let property in this.headerStyle) {
                if (this.headerStyle.hasOwnProperty(property)) {
                    dataTableHeader['style'][property] = this.headerStyle[property];
                }
            }
        }
        if ((dataTableBody && dataTableBody['children'].length > 0) && this.rowStyle) {
            for (let property in this.rowStyle) {
                if (this.rowStyle.hasOwnProperty(property)) {
                    for (let index = 0; index < dataTableBody['children'].length; index++) {
                        dataTableBody['children'][index]['style'][property] = this.rowStyle[property];
                    }
                }
            }
        }
    }

    private activateHorizontalScrollEvent = (): void => {
        let sourceElement: any = document.querySelector('.datatable-scrollable-area > .datatable-body');
        if (sourceElement) {
            sourceElement.addEventListener('scroll', function (event: MouseEvent) {
                let scrollLeftPosition: number = 0;
                let scrollTopPosition: number = 0;
                let horizontalScrollbars: Array<any> = [];
                let verticalScrollbar: HTMLElement;
                if (event && event.currentTarget) {
                    scrollLeftPosition = event.currentTarget['scrollLeft'];
                    scrollTopPosition = event.currentTarget['scrollTop'];
                }
                horizontalScrollbars.push(document.querySelector('.datatable-scrollable-area > .datatable-header-wrapper'));
                horizontalScrollbars.push(document.querySelector('.datatable-scrollable-area > .datatable-filter-wrapper'));
                horizontalScrollbars.forEach((element) => element.scrollLeft = scrollLeftPosition);
                verticalScrollbar = document.querySelector('.datatable-frozen-area > .datatable-body');
                verticalScrollbar.scrollTop = scrollTopPosition;
            });
        }
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
