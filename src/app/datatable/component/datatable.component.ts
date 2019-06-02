import { Component, OnInit, AfterViewInit, AfterViewChecked, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { DataTableHeader, DataTableHeaderStyle, DataTableRowStyle } from '../datatable.model';

@Component({
    selector: 'app-datatable',
    templateUrl: './datatable.component.html',
    styleUrls: ['./datatable.component.scss']
})
export class DataTableComponent implements OnInit, AfterViewInit, AfterViewChecked {
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
        this.rowContainerHeight = '';
        this.rowSelectionClassName = 'selected-row';
    }

    ngOnInit() {
        this.rowContainerHeight = '';
        this.setDataTableRowContainerHeight();
        this.activateHorizontalScrollEvent();
    }

    ngAfterViewInit() {
    }

    ngAfterViewChecked() {
        if (this.dataTable && this.dataTable.nativeElement) {
            if (this.dataTable.nativeElement.children && this.dataTable.nativeElement.children.length > 0) {
                let dataTableHeader: HTMLCollection = this.dataTable.nativeElement.children[0] && this.dataTable.nativeElement.children[0].children[0];
                let dataTableBody: HTMLCollection = this.dataTable.nativeElement.children[1];
                this.setDataTableStyling(dataTableHeader, dataTableBody);
            }
        }
    }

    private setDataTableRowContainerHeight = (): void => {
        let headerElement: any = document.getElementsByClassName('datatable-header-container')[0];
        let filterContainerElement: any = document.getElementsByClassName('datatable-filter-container')[0];
        let headerElementHeight: number = headerElement && headerElement.clientHeight;
        let filterContainerElementHeight: number = filterContainerElement && filterContainerElement.clientHeight;
        this.rowContainerHeight = parseFloat(this.height) - (headerElementHeight + filterContainerElementHeight) + 'px';
    }

    private setDataTableStyling = (dataTableHeader: HTMLCollection, dataTableBody: HTMLCollection): void => {
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
        let sourceElement: any = document.getElementsByClassName('datatable-body')[0];
        sourceElement.addEventListener('scroll', function (event: MouseEvent) {
            let scrollLeftPosition: number = event && event.currentTarget && event.currentTarget['scrollLeft'];
            let targetElements: Array<any> = [];
            targetElements.push(document.getElementsByClassName('datatable-header-wrapper')[0]);
            targetElements.push(document.getElementsByClassName('datatable-filter-wrapper')[0]);
            targetElements.forEach((element) => element.scrollLeft = scrollLeftPosition);
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
