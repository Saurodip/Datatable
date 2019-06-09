import { Component, OnInit, AfterViewInit, AfterViewChecked, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { DataTableService } from './datatable.service';
import { DataTableHeader, DataTableHeaderStyle, DataTableRowStyle } from '../datatable.model';

@Component({
    selector: 'app-datatable',
    templateUrl: './datatable.component.html',
    styleUrls: ['./datatable.component.scss']
})
export class DataTableComponent implements OnInit, AfterViewInit, AfterViewChecked {
    private dataCollection: object[];
    public dataToDisplay: object[];
    private searchTextFields: object;
    private isCompletelyRendered: boolean;
    private scrollbarWidth: number;
    public frozenHeader: DataTableHeader[];
    public scrollableHeader: DataTableHeader[];
    public scrollableAreaWidth: string;
    public responsiveColumnWidth: string;
    public rowContainerHeight: string;
    private rowSelectionClassName: string;

    @Input() public checkboxSelection: boolean;
    @Input() public columnFilter: boolean;
    @Input() public columnResponsive: boolean;
    @Input() set data(list: object[]) {
        this.dataCollection = [...list];
        if (list && list.length > 0) {
            this.dataCollection = [...this.dataTableService.onApplyPipe(this.dataCollection, this.header)];
            this.dataToDisplay = [...this.dataCollection];
        }
    }
    @Input() public filterTextLimit: number;
    @Input() public globalFilter: boolean;
    @Input() public header: DataTableHeader[];
    @Input() public headerStyle: DataTableHeaderStyle;
    @Input() public height: string;
    @Input() public rowStyle: DataTableRowStyle;

    @ViewChild('dataTable') private dataTable: ElementRef;

    constructor(private dataTableService: DataTableService) {
        this.dataCollection = [];
        this.dataToDisplay = [];
        this.searchTextFields = {};
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
        setTimeout(() => {
            this.setHeightOfDataTableRowContainer();
            this.calculateDataTableHeaderWidth();
            if (this.columnFilter && (this.header && this.header.length > 0)) {
                this.header.forEach((header: DataTableHeader) => {
                    this.searchTextFields[header.propertyName] = '';
                });
            }
        }, 0);
    }

    ngAfterViewChecked() {
        let dataTableBody: HTMLElement = this.getHTMLElementRefernce('scrollable-area-datatable-body');
        if ((dataTableBody && dataTableBody['children'].length > 0) && !this.isCompletelyRendered) {
            this.isCompletelyRendered = true;
            this.setDataTableStyling(dataTableBody);
            this.activateScrollingEvent(dataTableBody);
        }
    }

    private getHTMLElementRefernce = (element: string, index?: number): HTMLElement => {
        switch (element) {
            case 'datatable-frozen-area': return document.querySelector('.datatable-frozen-area');
            case 'datatable-scrollable-area': return document.querySelector('.datatable-scrollable-area');
            case 'datatable-scrollable-header-wrapper': return document.querySelector('.datatable-scrollable-area .datatable-header-wrapper');
            case 'datatable-header-container': return document.querySelector('.datatable-header-container');
            case 'datatable-scrollable-filter-wrapper': return document.querySelector('.datatable-scrollable-area .datatable-filter-wrapper');
            case 'datatable-filter-container': return document.querySelector('.datatable-filter-container');
            case 'datatable-select-all-checkbox': return document.querySelector('#datatable-select-all-checkbox');
            case 'action-container': return document.querySelector('.action-container');
            case 'frozen-area-datatable-body': return document.querySelector('.datatable-frozen-area .datatable-body');
            case 'scrollable-area-datatable-body': return document.querySelector('.datatable-scrollable-area .datatable-body');
            case 'datatable-row': return document.querySelector('.datatable-row');
            default: break;
        }
    }

    private setHeightOfDataTableRowContainer = (): void => {
        let dataTableHeaderContainer: HTMLElement = this.getHTMLElementRefernce('datatable-header-container');
        let dataTableFilterContainer: HTMLElement = this.getHTMLElementRefernce('datatable-filter-container');
        if (dataTableHeaderContainer && dataTableFilterContainer) {
            this.rowContainerHeight = parseFloat(this.height) - (dataTableHeaderContainer['offsetHeight'] + dataTableFilterContainer['offsetHeight']) + 'px';
        }
    }

    private calculateDataTableHeaderWidth = (): void => {
        let dataTable: HTMLElement = this.dataTable && this.dataTable.nativeElement;
        let actionContainer: HTMLElement = this.getHTMLElementRefernce('action-container');
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
        let dataTableHeaderContainer: HTMLElement = this.getHTMLElementRefernce('datatable-header-container');
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
        let dataTableScrollableHeaderWrapper: HTMLElement = this.getHTMLElementRefernce('datatable-scrollable-header-wrapper');
        let dataTableScrollableFilterWrapper: HTMLElement = this.getHTMLElementRefernce('datatable-scrollable-filter-wrapper');
        let frozenAreaDataTableBody: HTMLElement = this.getHTMLElementRefernce('frozen-area-datatable-body');
        dataTableBody.addEventListener('scroll', (event: MouseEvent) => {
            let scrollLeftPosition: number = 0;
            let scrollTopPosition: number = 0;
            let listOfHorizontalScrollbars: HTMLElement[] = [];
            let listOfVerticalScrollbars: HTMLElement[] = [];
            if (event && event.currentTarget) {
                scrollLeftPosition = event.currentTarget['scrollLeft'];
                scrollTopPosition = event.currentTarget['scrollTop'];
            }
            listOfHorizontalScrollbars = [dataTableScrollableHeaderWrapper, dataTableScrollableFilterWrapper];
            listOfHorizontalScrollbars.forEach((element: HTMLElement) => element.scrollLeft = scrollLeftPosition);
            listOfVerticalScrollbars = [frozenAreaDataTableBody];
            listOfVerticalScrollbars.forEach((element: HTMLElement) => element.scrollTop = scrollTopPosition);
        });
    }

    public onSelectDataTableSelectAll = (event: MouseEvent): void => {
        if (event && event.currentTarget) {
            if (this.dataCollection && this.dataCollection.length > 0) {
                this.dataCollection.forEach((row: object, index: number) => {
                    let dataTableRow: NodeList = document.querySelectorAll('.datatable-row-' + (index + 1));
                    if (dataTableRow && dataTableRow.length > 0) {
                        for (let i: number = 0; i < dataTableRow.length; i++) {
                            if (event.currentTarget['checked']) {
                                let isSelectedRowClassPresent: boolean = dataTableRow[i]['className'] && dataTableRow[i]['className'].indexOf(this.rowSelectionClassName) !== -1 ? true : false;
                                if (!isSelectedRowClassPresent) {
                                    dataTableRow[i]['className'] = this.rowSelectionClassName + ' ' + dataTableRow[i]['className'];
                                }
                                if (this.rowStyle && this.rowStyle.selectionColor) {
                                    dataTableRow[i]['style'].backgroundColor = this.rowStyle.selectionColor;
                                }
                            } else {
                                dataTableRow[i]['className'] = dataTableRow[i]['className'] && dataTableRow[i]['className'].replace(this.rowSelectionClassName, '').trim();
                                dataTableRow[i]['style'].backgroundColor = '';
                            }
                        }
                    }
                    if (this.checkboxSelection) {
                        let checkboxElement: HTMLElement = document.querySelector('#datatable-checkbox-' + (index + 1));
                        if (checkboxElement) {
                            checkboxElement['checked'] = event.currentTarget['checked'];
                        }
                    }
                });
            }
        }
    }

    public onSelectDataTableRow = (event: MouseEvent): void => {
        let isSelectedRowClassPresent: boolean = false;
        let selectedRowIndex: number = event.currentTarget['id'].replace(/^\D+/g, '');
        if (event && event.currentTarget && event.currentTarget['className']) {
            isSelectedRowClassPresent = event.currentTarget['className'].indexOf(this.rowSelectionClassName) !== -1 ? true : false;
            let dataTableRow: NodeList = document.querySelectorAll('.datatable-row-' + selectedRowIndex);
            if (dataTableRow && dataTableRow.length > 0) {
                for (let i = 0; i < dataTableRow.length; i++) {
                    if (!isSelectedRowClassPresent) {
                        dataTableRow[i]['className'] = this.rowSelectionClassName + ' ' + dataTableRow[i]['className'];
                        if (this.rowStyle && this.rowStyle.selectionColor) {
                            dataTableRow[i]['style'].backgroundColor = this.rowStyle.selectionColor;
                        }
                    } else {
                        dataTableRow[i]['className'] = dataTableRow[i]['className'].replace(this.rowSelectionClassName, '').trim();
                        dataTableRow[i]['style'].backgroundColor = '';
                    }
                }
            }
        }
        if (this.checkboxSelection) {
            let checkboxElement: HTMLElement = document.querySelector('#datatable-checkbox-' + selectedRowIndex);
            if (checkboxElement) {
                checkboxElement['checked'] = !isSelectedRowClassPresent;
            }
        }
        this.determineSelectAllCheckboxState();
    }

    private determineSelectAllCheckboxState = (): void => {
        let selectAllCheckbox: HTMLElement = this.getHTMLElementRefernce('datatable-select-all-checkbox');
        let noOfSelectedDataTableCheckbox: number = 0;
        let totalNoOfDataTableRows: number = this.dataCollection && this.dataCollection.length || 0;
        for (let i = 1; i <= totalNoOfDataTableRows; i++) {
            let dataTableRow: HTMLElement = document.querySelector('.datatable-row-' + i);
            if (dataTableRow) {
                let isSelectedRowClassPresent: boolean = dataTableRow['className'].indexOf(this.rowSelectionClassName) !== -1 ? true : false;
                if (isSelectedRowClassPresent) {
                    noOfSelectedDataTableCheckbox++;
                }
            }
        }
        if (selectAllCheckbox) {
            selectAllCheckbox['indeterminate'] = false;
            if (noOfSelectedDataTableCheckbox === totalNoOfDataTableRows) {
                selectAllCheckbox['checked'] = true;
            } else if (noOfSelectedDataTableCheckbox > 0 && noOfSelectedDataTableCheckbox < totalNoOfDataTableRows) {
                selectAllCheckbox['indeterminate'] = true;
            } else if (noOfSelectedDataTableCheckbox === 0) {
                selectAllCheckbox['checked'] = false;
            }
        }
    }

    public onApplySearch = (event: KeyboardEvent | MouseEvent, filterType: string, propertyName?: string) => {
        let timeOut = setTimeout(() => {
            if (event && event.target) {
                let serachedText: string = event.target['value'] && event.target['value'].toLowerCase().trim();
                let filteredData: object[] = [];
                if ((this.dataCollection && this.dataCollection.length > 0) && (this.header && this.header.length > 0)) {
                    if (filterType === 'global-filter') {
                        let isSearchTextMatched: boolean = false;
                        filteredData = this.dataCollection.filter((rowData: object) => {
                            this.header.some((column: DataTableHeader) => {
                                let value = rowData[column.propertyName] && rowData[column.propertyName].toString().toLowerCase().trim();
                                if (value && value.indexOf(serachedText) !== -1) {
                                    isSearchTextMatched = true;
                                    return true;
                                }
                            });
                            if (isSearchTextMatched) {
                                isSearchTextMatched = false;
                                return rowData;
                            }
                        });
                    } else if (filterType === 'column-filter') {
                        this.searchTextFields[propertyName] = serachedText;
                        filteredData = this.dataCollection.filter((rowData: object) => {
                            let noOfAppliedSearchColumns: number = 0;
                            let noOfMatchedColumns: number = 0;
                            for (let key in this.searchTextFields) {
                                if (this.searchTextFields.hasOwnProperty(key)) {
                                    let value = rowData[key] && rowData[key].toString().toLowerCase().trim();
                                    if (this.searchTextFields[key]) {
                                        noOfAppliedSearchColumns++;
                                        if (value && value.indexOf(this.searchTextFields[key]) !== -1) {
                                            noOfMatchedColumns++;
                                        }
                                    }
                                }
                            }
                            if (noOfAppliedSearchColumns === noOfMatchedColumns) {
                                return rowData;
                            }
                        });
                    }
                    this.dataToDisplay = filteredData;
                }
            }
            clearTimeout(timeOut);
        }, 1000);
    }
}
