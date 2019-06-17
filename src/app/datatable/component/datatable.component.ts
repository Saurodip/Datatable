import { Component, OnInit, AfterViewInit, AfterViewChecked, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { DataTableElementReferenceService } from '../services/datatable.element-reference.service';
import { DataTablePaginationService } from '../services/datatable.pagination.service';
import { DataTablePipeService } from '../services/datatable.pipe';
import { DataTableSearchService } from '../services/datatable.search.service';
import { DataTableSelectionService } from '../services/datatable.selection.service';
import { DataTableSortService } from '../services/datatable.sort.service';
import { DataTableUIService } from '../services/datatable.ui.service';
import { DataTableHeader, DataTableHeaderStyle, DataTableRowStyle } from '../datatable.model';
import { DataTableColumnType, DataTableSortOrder } from '../datatable.enum';

@Component({
    selector: 'app-datatable',
    templateUrl: './datatable.component.html',
    styleUrls: ['./datatable.component.scss']
})
export class DataTableComponent implements OnInit, AfterViewInit, AfterViewChecked {
    @ViewChild('dataTable') private dataTable: ElementRef;

    @Input() public checkboxSelection: boolean;
    @Input() public columnFilter: boolean;
    @Input() public columnResponsive: boolean;
    @Input() set data(list: object[]) {
        this.dataCollection = [...list];
        if (list && list.length > 0) {
            this.dataCollection = [...this.dataTablePipeService.onApplyPipe(this.dataCollection, this.header)];
            this.dataToDisplay = [...this.dataCollection];
        }
    }
    @Input() public filterTextLimit: number;
    @Input() public globalFilter: boolean;
    @Input() public header: DataTableHeader[];
    @Input() public headerStyle: DataTableHeaderStyle;
    @Input() public height: string;
    @Input() public numberOfRowsPerPage: number;
    @Input() public pagination: boolean;
    @Input() public rowStyle: DataTableRowStyle;

    public randomIndex: number;
    private dataCollection: object[];
    public dataToDisplay: object[];
    private searchTextFields: object;
    private sortFields: object;
    private isCompletelyRendered: boolean;
    public frozenHeader: DataTableHeader[];
    public scrollableHeader: DataTableHeader[];
    public scrollableAreaWidth: string;
    public responsiveColumnWidth: string;
    public verticalScrollableRegion: string;
    private rowSelectionClassName: string;
    private paginationData: object[];
    public currentPaginationTabs: object;

    constructor(
        private dataTableElementReferenceService: DataTableElementReferenceService,
        private dataTablePaginationService: DataTablePaginationService,
        private dataTablePipeService: DataTablePipeService,
        private dataTableSearchService: DataTableSearchService,
        private dataTableSelectionService: DataTableSelectionService,
        private dataTableSortService: DataTableSortService,
        private dataTableUIService: DataTableUIService) {
        this.randomIndex = Math.floor(1000 + Math.random() * 9000);
        this.dataCollection = [];
        this.dataToDisplay = [];
        this.searchTextFields = {};
        this.sortFields = {};
        this.isCompletelyRendered = false;
        this.frozenHeader = [];
        this.scrollableHeader = [];
        this.scrollableAreaWidth = '';
        this.responsiveColumnWidth = '';
        this.verticalScrollableRegion = '';
        this.rowSelectionClassName = 'selected-row';
        this.paginationData = [];
        this.currentPaginationTabs = {};
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.verticalScrollableRegion = this.dataTableUIService.onSetHeightOfDataTableRowContainer(this.height);
            if (this.dataTable) {
                const headerInfo = this.dataTableUIService.onCalculateDataTableHeaderWidth(this.dataTable.nativeElement, this.header, this.columnResponsive);
                Object.assign(this, headerInfo);
            }
            if (this.header && this.header.length > 0) {
                this.frozenHeader = this.header.filter((header: DataTableHeader) => header.isFrozen);
                this.scrollableHeader = this.header.filter((header: DataTableHeader) => !header.isFrozen);
                this.header.forEach((header: DataTableHeader) => {
                    if (this.columnFilter) {
                        this.searchTextFields[header.propertyName] = '';
                    }
                    this.sortFields[header.propertyName] = DataTableSortOrder.None;
                });
            }
        }, 0);
    }

    ngAfterViewChecked() {
        let dataTableBody: HTMLElement = this.dataTableElementReferenceService.getHTMLElementRefernce('scrollable-area-datatable-body');
        if ((dataTableBody && dataTableBody['children'].length > 0) && !this.isCompletelyRendered) {
            this.isCompletelyRendered = true;
            this.dataTableUIService.onSetDataTableStyle(this.headerStyle, this.rowStyle, this.randomIndex);
            this.dataTableUIService.onActivateScrollingForHiddenScrollbars();
            if (this.pagination) {
                this.preparePaginationTabs();
            }
        }
    }

    public onSelectDataTableSelectAll = (event: MouseEvent): void => {
        this.dataTableSelectionService.onSelectDataTableSelectAll(event, this.dataCollection, this.checkboxSelection, this.rowStyle.selectionColor);
    }

    public onSelectDataTableRow = (event: MouseEvent): void => {
        this.dataTableSelectionService.onSelectDataTableRow(event, this.dataCollection, this.checkboxSelection, this.rowStyle.selectionColor);
    }

    public onApplySearch = (event: KeyboardEvent | MouseEvent, filterType: string, propertyName?: string): void => {
        let timeOut = setTimeout(() => {
            if (event && event.target) {
                let searchedText: string = event.target['value'] && event.target['value'].toLowerCase().trim();
                let filteredData: object[] = [];
                if ((this.dataCollection && this.dataCollection.length > 0) && (this.header && this.header.length > 0)) {
                    if (filterType === 'global-filter') {
                        if (searchedText) {
                            let isSearchTextMatched: boolean = false;
                            filteredData = this.dataCollection.filter((rowData: object) => {
                                this.header.some((column: DataTableHeader) => {
                                    let value = rowData[column.propertyName] && rowData[column.propertyName].toString().toLowerCase().trim();
                                    if (value && value.indexOf(searchedText) >= 0) {
                                        isSearchTextMatched = true;
                                        return true;
                                    }
                                });
                                if (isSearchTextMatched) {
                                    isSearchTextMatched = false;
                                    return rowData;
                                }
                            });
                            this.dataToDisplay = filteredData;
                        } else {
                            this.dataToDisplay = [...this.dataCollection];
                        }
                    } else if (filterType === 'column-filter') {
                        let isSearchTextPresent: boolean = false;
                        this.searchTextFields[propertyName] = searchedText;
                        if (this.searchTextFields) {
                            for (let key in this.searchTextFields) {
                                if (this.searchTextFields.hasOwnProperty(key)) {
                                    if (this.searchTextFields[key]) {
                                        isSearchTextPresent = true;
                                        break;
                                    }
                                }
                            }
                            if (isSearchTextPresent) {
                                filteredData = this.dataCollection.filter((rowData: object) => {
                                    let noOfAppliedSearchColumns: number = 0;
                                    let noOfMatchedColumns: number = 0;
                                    for (let key in this.searchTextFields) {
                                        if (this.searchTextFields.hasOwnProperty(key)) {
                                            let value = rowData[key] && rowData[key].toString().toLowerCase().trim();
                                            if (this.searchTextFields[key]) {
                                                noOfAppliedSearchColumns++;
                                                if (value && value.indexOf(this.searchTextFields[key]) >= 0) {
                                                    noOfMatchedColumns++;
                                                }
                                            }
                                        }
                                    }
                                    if (noOfAppliedSearchColumns === noOfMatchedColumns) {
                                        return rowData;
                                    }
                                });
                                this.dataToDisplay = filteredData;
                            } else {
                                this.dataToDisplay = [...this.dataCollection];
                            }
                        }
                    }
                }
            }
            clearTimeout(timeOut);
        }, 1000);
    }

    public onApplySort = (event: MouseEvent, propertyName: string, type: DataTableColumnType): void => {
        if (event && event.currentTarget) {
            for (let key in this.sortFields) {
                if (this.sortFields.hasOwnProperty(key)) {
                    if (key !== propertyName) {
                        this.sortFields[key] = 0;
                    } else {
                        if (this.sortFields[propertyName] === DataTableSortOrder.None || this.sortFields[propertyName] === DataTableSortOrder.Descending) {
                            this.sortFields[propertyName] = DataTableSortOrder.Ascending;
                        } else {
                            this.sortFields[propertyName] = DataTableSortOrder.Descending;
                        }
                    }
                }
            }
            if (this.sortFields[propertyName] !== DataTableSortOrder.None) {
                let sortedData: object[] = [];
                switch (type) {
                    case DataTableColumnType.Date:
                        sortedData = this.sortByDate(propertyName);
                        break;
                    case DataTableColumnType.Float:
                        sortedData = this.sortByFloat(propertyName);
                        break;
                    case DataTableColumnType.Integer:
                        sortedData = this.sortByInteger(propertyName);
                        break;
                    case DataTableColumnType.String:
                        sortedData = this.sortByString(propertyName);
                        break;
                    case DataTableColumnType.Version:
                        // sortedData = this.sortByVersion(propertyName);
                        break;
                    default:
                        break;
                }
                this.dataToDisplay = [...sortedData];
            }
        }
    }

    private sortByDate = (propertyName: string): object[] => {
        let sortedData: object[] = [];
        let sortOrder: number = this.sortFields[propertyName] || DataTableSortOrder.None;
        if (this.dataToDisplay && this.dataToDisplay.length > 0) {
            sortedData = this.dataToDisplay.sort((prev: object, next: object) => {
                let prevDate: number = Date.parse(prev[propertyName]) ? new Date(prev[propertyName]).getTime() : 0;
                let nextDate: number = Date.parse(next[propertyName]) ? new Date(next[propertyName]).getTime() : 0;
                return (sortOrder === DataTableSortOrder.Ascending) ? (prevDate - nextDate) : (nextDate - prevDate);
            });
        }
        return sortedData;
    }

    private sortByFloat = (propertyName: string): object[] => {
        let sortedData: object[] = [];
        let sortOrder: number = this.sortFields[propertyName] || DataTableSortOrder.None;
        if (this.dataToDisplay && this.dataToDisplay.length > 0) {
            sortedData = this.dataToDisplay.sort((prev: object, next: object) => {
                let prevValue: number = parseFloat(prev[propertyName]) || 0;
                let nextValue: number = parseFloat(next[propertyName]) || 0;
                return (sortOrder === DataTableSortOrder.Ascending) ? (prevValue - nextValue) : (nextValue - prevValue);
            });
        }
        return sortedData;
    }

    private sortByInteger = (propertyName: string): object[] => {
        let sortedData: object[] = [];
        let sortOrder: number = this.sortFields[propertyName] || DataTableSortOrder.None;
        if (this.dataToDisplay && this.dataToDisplay.length > 0) {
            sortedData = this.dataToDisplay.sort((prev: object, next: object) => {
                let prevValue: number = Number.isInteger(prev[propertyName]) ? prev[propertyName] : 0;
                let nextValue: number = Number.isInteger(next[propertyName]) ? next[propertyName] : 0;
                return (sortOrder === DataTableSortOrder.Ascending) ? (prevValue - nextValue) : (nextValue - prevValue);
            });
        }
        return sortedData;
    }

    private sortByString = (propertyName: string): object[] => {
        let sortedData: object[] = [];
        let sortOrder: number = this.sortFields[propertyName] || DataTableSortOrder.None;
        if (this.dataToDisplay && this.dataToDisplay.length > 0) {
            sortedData = this.dataToDisplay.sort((prev: object, next: object) => {
                let prevValue: string = prev[propertyName] && typeof (prev[propertyName]) === 'string' ? prev[propertyName].toLowerCase() : '';
                let nextValue: string = next[propertyName] && typeof (next[propertyName]) === 'string' ? next[propertyName].toLowerCase() : '';
                if (sortOrder === DataTableSortOrder.Ascending) {
                    if (prevValue < nextValue) {
                        return -1;
                    } else if (nextValue > prevValue) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else if (sortOrder === DataTableSortOrder.Descending) {
                    if (prevValue < nextValue) {
                        return 1;
                    } else if (nextValue > prevValue) {
                        return -1;
                    } else {
                        return 0;
                    }
                }
            });
        }
        return sortedData;
    }

    private preparePaginationTabs = (): void => {
        if (this.dataCollection && this.dataCollection.length > 0) {
            let paginationTabCollection: object[] = [];
            let counter: number = 0;
            for (let i: number = 0; i < this.dataCollection.length; i += this.numberOfRowsPerPage) {
                let paginationTab: object[] = this.dataCollection.slice(i, i + this.numberOfRowsPerPage);
                paginationTabCollection.push({ 'index': ++counter, 'data': paginationTab });
            }
            counter = 0;
            for (let i: number = 0; i < paginationTabCollection.length; i += 2) {
                let paginationTab = paginationTabCollection.slice(i, i + 2);
                this.paginationData.push({ 'series': ++counter, 'data': paginationTab });
            }
            this.currentPaginationTabs = this.paginationData[0];
        }
    }

    public onSelectPaginationTab = (index: number): void => {
        this.dataToDisplay = [...this.currentPaginationTabs['data'][index]['data']];
    }

    public onChangePaginationTabSeries = (index: number): void => {
        if (index <= 0) {
            index = 0;
        } else if (index >= this.paginationData.length) {
            index = this.paginationData.length - 1;
        }
        this.currentPaginationTabs = this.paginationData[index];
        this.onSelectPaginationTab(0);
    }
}
