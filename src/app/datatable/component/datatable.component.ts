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
    public frozenHeaderWidth: number;
    public scrollableHeaderWidth: number;
    private actionContainerWidth: number;
    private scrollbarWidth: number;
    public responsiveColumnWidth: number;
    public rowContainerHeight: string;
    private rowSelectionClassName: string;

    @Input() public checkboxSelection: string;
    @Input() public columnFilter: boolean;
    @Input() public columnResponsive: boolean;
    @Input() public data: Array<object>;
    @Input() public filterTextLimit: number;
    @Input() public globalFilter: boolean;
    @Input() set header(dataTableHeaderInfo: Array<DataTableHeader>) {
        this.calculateDataTableHeaderWidth(dataTableHeaderInfo);
    }
    @Input() public headerStyle: DataTableHeaderStyle;
    @Input() public height: string;
    @Input() public rowStyle: DataTableRowStyle;

    @ViewChild('dataTable') private dataTable: ElementRef;

    constructor() {
        this.frozenHeader = [];
        this.scrollableHeader = [];
        this.frozenHeaderWidth = 0;
        this.scrollableHeaderWidth = 0;
        this.actionContainerWidth = 30;
        this.scrollbarWidth = 17;
        this.responsiveColumnWidth = 0;
        this.rowContainerHeight = '';
        this.rowSelectionClassName = 'selected-row';
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.activateHorizontalScrollEvent();
    }

    ngAfterViewChecked() {
        if (this.dataTable && this.dataTable.nativeElement) {
            if (this.dataTable.nativeElement.children && this.dataTable.nativeElement.children.length > 0) {
                let dataTableHeaderContainer: object = document.getElementsByClassName('datatable-header-container')[0];
                let dataTableFilterContainer: object = document.getElementsByClassName('datatable-filter-container')[0];
                let dataTableBody: object = document.getElementsByClassName('datatable-body')[0];
                this.setDataTableRowContainerHeight(dataTableHeaderContainer, dataTableFilterContainer);
                this.setDataTableStyling(dataTableHeaderContainer, dataTableBody);
            }
        }
    }

    private calculateDataTableHeaderWidth = (dataTableHeaderInfo: Array<DataTableHeader>): void => {
        if (dataTableHeaderInfo && dataTableHeaderInfo.length > 0) {
            if (this.dataTable && this.dataTable.nativeElement) {
                let dataTableWidth: number = this.dataTable && this.dataTable.nativeElement.clientWidth;
                this.responsiveColumnWidth = (dataTableWidth - this.actionContainerWidth) / dataTableHeaderInfo.length;
            }
            this.frozenHeader = dataTableHeaderInfo.filter((dataTableHeader: DataTableHeader) => dataTableHeader.isFrozen === true);
            this.scrollableHeader = dataTableHeaderInfo.filter((dataTableHeader: DataTableHeader) => !dataTableHeader.isFrozen);
            this.frozenHeader.forEach((header: DataTableHeader, index: number) => {
                this.frozenHeaderWidth += parseFloat(header.columnWidth);
            });
            this.frozenHeaderWidth += (this.actionContainerWidth + this.scrollbarWidth);
            this.scrollableHeader.forEach((header: DataTableHeader) => {
                this.scrollableHeaderWidth += parseFloat(header.columnWidth);
            });
        }
    }

    private setDataTableRowContainerHeight = (dataTableHeaderContainer: object, dataTableFilterContainer: object): void => {
        let headerContainerHeight: number = dataTableHeaderContainer && dataTableHeaderContainer['clientHeight'];
        let filterContainerHeight: number = dataTableFilterContainer && dataTableFilterContainer['clientHeight'];
        this.rowContainerHeight = parseFloat(this.height) - (headerContainerHeight + filterContainerHeight) + 'px';
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
