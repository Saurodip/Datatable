import { AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DataTableElementReferenceService } from '../services/datatable.element-reference.service';
import { DataTableFilterService } from '../services/datatable.filter.service';
import { DataTablePaginationService } from '../services/datatable.pagination.service';
import { DataTablePipeService } from '../services/datatable.pipe';
import { DataTableSelectionService } from '../services/datatable.selection.service';
import { DataTableSortService } from '../services/datatable.sort.service';
import { DataTableUIService } from '../services/datatable.ui.service';
import { DataTableVirtualScrollingService } from '../services/datatable.virtual-scrolling.service';
import { DataTableColumnType, DataTableFilterType, DataTableLoadingPattern, DataTableSortOrder } from '../enumerations/datatable.enum';
import { DataTableHeader, DataTableHeaderStyle, DataTableRowStyle, DataTableUserActionResponse, DataTableVirtualScrolling } from '../interfaces/datatable.interface';
import { DataTablePagination, DataTableTooltip } from '../models/datatable.model';

@Component({
    selector: 'app-datatable',
    templateUrl: './datatable.component.html',
    styleUrls: ['./datatable.component.scss']
})
export class DataTableComponent implements OnInit, AfterViewInit, AfterViewChecked {
    @ViewChild('dataTable') private dataTable: ElementRef;

    @Input() public checkboxSelection: boolean;
    @Input() public columnResponsive: boolean;
    @Input() set data(collection: object[]) {
        if (collection && collection.length > 0) {
            this.dataStore = JSON.parse(JSON.stringify(collection));
            this.onReceiveOfDataTableData(collection);
        }
    }
    @Input() public dataLoadingPattern: DataTableLoadingPattern;
    @Input() set filter(filterType: DataTableFilterType) {
        this.filterType = filterType;
        switch (filterType) {
            case DataTableFilterType.Column: this.columnFilter = true;
                break;
            case DataTableFilterType.CustomColumn: this.columnFilter = true;
                break;
            case DataTableFilterType.CustomGlobal: this.globalFilter = true;
                break;
            case DataTableFilterType.Global: this.globalFilter = true;
                break;
            default:
                break;
        }
    }
    @Input() public filterTextLimit: number;
    @Input() public header: DataTableHeader[];
    @Input() public headerStyle: DataTableHeaderStyle;
    @Input() public height: string;
    @Input() public pagination: DataTablePagination;
    @Input() public rowStyle: DataTableRowStyle;
    @Input() public virtualScrolling: DataTableVirtualScrolling;

    @Output() public getSelectAllCheckboxState = new EventEmitter<DataTableUserActionResponse>();
    @Output() public getSelectedDataTableRows = new EventEmitter<DataTableUserActionResponse>();
    @Output() public getCustomFilterInfo = new EventEmitter<DataTableUserActionResponse>();
    @Output() public getSortingInfo = new EventEmitter<DataTableUserActionResponse>();

    public isLoading: boolean;
    public randomIndex: number;
    public dataToDisplay: object[];
    public frozenHeader: DataTableHeader[];
    public scrollableHeader: DataTableHeader[];
    public scrollableAreaWidth: string;
    public responsiveColumnWidth: string;
    public verticalScrollableRegion: string;
    public columnFilter: boolean;
    public globalFilter: boolean;
    public sortFields: object;
    public currentPaginationSlot: object;
    public tooltipInfo: DataTableTooltip;
    public dataTableFilterType = DataTableFilterType;
    public dataTableLoadingPattern = DataTableLoadingPattern;
    private dataStore: object[];
    private dataCollection: object[];
    private listOfSelectedDataTableRow: object[];
    private selectAllCheckboxState: string;
    private filterType: number;
    private filteredTextFields: object;
    private isCompletelyRendered: boolean;
    private isFilterTextPresent: boolean;
    private filteredData: object[];
    private paginationData: object[];

    constructor(
        private dataTableElementReferenceService: DataTableElementReferenceService,
        private dataTableFilterService: DataTableFilterService,
        private dataTablePaginationService: DataTablePaginationService,
        private dataTablePipeService: DataTablePipeService,
        private dataTableSelectionService: DataTableSelectionService,
        private dataTableSortService: DataTableSortService,
        private dataTableUIService: DataTableUIService,
        private dataTableVirtualScrollingService: DataTableVirtualScrollingService) {
        this.isLoading = false;
        this.randomIndex = Math.floor(1000 + Math.random() * 9000);
        this.dataToDisplay = [];
        this.frozenHeader = [];
        this.scrollableHeader = [];
        this.scrollableAreaWidth = '';
        this.responsiveColumnWidth = '';
        this.verticalScrollableRegion = '';
        this.columnFilter = false;
        this.globalFilter = false;
        this.sortFields = {};
        this.currentPaginationSlot = {};
        this.tooltipInfo = new DataTableTooltip();
        this.dataStore = [];
        this.dataCollection = [];
        this.listOfSelectedDataTableRow = [];
        this.selectAllCheckboxState = '';
        this.filterType = -1;
        this.filteredTextFields = {};
        this.isCompletelyRendered = false;
        this.isFilterTextPresent = false;
        this.filteredData = [];
        this.paginationData = [];
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.verticalScrollableRegion = this.dataTableUIService.onSetDataTableRowWrapperHeight(this.height);
            if (this.dataTable) {
                const headerInfo = this.dataTableUIService.onCalculateDataTableHeaderWidth(this.dataTable.nativeElement, this.header, this.columnResponsive);
                Object.assign(this, headerInfo);
            }
            if (this.header && this.header.length > 0) {
                this.frozenHeader = this.header.filter((header: DataTableHeader) => header.frozen);
                this.scrollableHeader = this.header.filter((header: DataTableHeader) => !header.frozen);
                this.header.forEach((header: DataTableHeader) => {
                    if (this.filterType === DataTableFilterType.Column || this.filterType === DataTableFilterType.CustomColumn) {
                        this.filteredTextFields[header.propertyName] = '';
                    }
                    this.sortFields[header.propertyName] = DataTableSortOrder.None;
                });
            }
            /* In case, any of the data loading pattern is applied, then displaying data based on that */
            this.onDisplayDataBasedOnLoadingPattern(this.dataCollection);
        }, 0);
    }

    ngAfterViewChecked() {
        let dataTableBody: HTMLElement = this.dataTableElementReferenceService.getHTMLElementRefernce('scrollable-area-datatable-body');
        if ((dataTableBody && dataTableBody['children'].length > 0) && (this.dataCollection && this.dataCollection.length > 0) && !this.isCompletelyRendered) {
            this.isCompletelyRendered = true;
            this.dataTableUIService.onSetDataTableStyle(this.headerStyle, this.rowStyle, this.randomIndex);
            this.dataTableUIService.onActivateScrollingForHiddenScrollbars();
        }
    }

    /**
     * This method is responsible for preparing data collection for datatable
     * @param collection { object[] } Data collection provided from the invoked component
     */
    private onReceiveOfDataTableData = (collection: object[]): void => {
        if ((collection && collection.length > 0) && (this.header && this.header.length > 0)) {
            collection.forEach((rowData: object, index: number) => {
                this.header.forEach((columnHeader: DataTableHeader) => {
                    if (columnHeader.pipe) {
                        this.dataTablePipeService.onApplyPipe(rowData, columnHeader.propertyName, columnHeader.pipe);
                    }
                });
                /* Setting unique index value to each row to use for individual row identification */
                rowData['Index'] = index + 1;
                /* Setting 'RowSelected' attribute to each row, initialized with 'false' to keep track of individual row selection state */
                rowData['RowSelected'] = false;
            });
        }
        /* This variable is responsible for holding entire collection of data prepared for datatable */
        this.dataCollection = [...collection];
        /* This variable is responsible for displaying list of data to UI, mainly when entire data collection is not available */
        this.dataToDisplay = [...this.dataCollection];
    }

    /**
     * This method gets triggered on change of 'Select All' checkbox state
     * @param event { MouseEvent } Change event
     */
    public onSelectDataTableSelectAll = (event: MouseEvent): void => {
        if (event && event.currentTarget) {
            this.selectAllCheckboxState = event.currentTarget['checked'] ? 'checked' : 'unchecked';
            this.dataTableSelectionService.onSelectDataTableSelectAll(this.selectAllCheckboxState, this.dataCollection, this.checkboxSelection, this.rowStyle.selectionColor);
            const response: DataTableUserActionResponse = {
                state: this.selectAllCheckboxState
            };
            this.getSelectAllCheckboxState.emit(response);
        }
    }

    /**
     * This method gets triggered on select of individiual datatable row
     * @param event { MouseEvent } Mouse click event
     */
    public onSelectDataTableRow = (event: MouseEvent): void => {
        if ((event && event.currentTarget) && (this.dataCollection && this.dataCollection.length > 0)) {
            const selectedRowIndex: number = event.currentTarget['id'] && parseInt(event.currentTarget['id'].replace(/^\D+/g, ''), 10);
            const selectedDataTableRow: object = this.dataCollection.find((rowData: object) => rowData['Index'] === selectedRowIndex);
            if (selectedDataTableRow) {
                selectedDataTableRow['RowSelected'] = !selectedDataTableRow['RowSelected'];
                this.selectAllCheckboxState = this.dataTableSelectionService.onSelectDataTableRow(selectedDataTableRow, this.dataCollection, this.checkboxSelection, this.rowStyle.selectionColor);
                const matchedRowIndex: number = this.listOfSelectedDataTableRow.findIndex((rowData: object) => rowData['Index'] === selectedDataTableRow['Index']);
                if (selectedDataTableRow['RowSelected']) {
                    if (matchedRowIndex < 0) {
                        this.listOfSelectedDataTableRow.push(this.dataStore[selectedDataTableRow['Index'] - 1]);
                    }
                } else {
                    this.listOfSelectedDataTableRow.splice(matchedRowIndex, 1);
                }
                const response: DataTableUserActionResponse = {
                    data: this.listOfSelectedDataTableRow
                };
                this.getSelectedDataTableRows.emit(response);
            }
        }
    }

    /**
     * This method is responsible for filtering the list of records based on user input
     * @param event { KeyboardEvent } Keyboard event
     * @param propertyName? { string } Name of the column on which filter is applied (if column-filter is applicable)
     */
    public onApplyFilter = (event: KeyboardEvent | MouseEvent, propertyName?: string): void => {
        let timeOut = setTimeout(() => {
            this.isFilterTextPresent = false;
            if (event && event.target) {
                const filteredText: string = event.target['value'] && event.target['value'].toLowerCase().trim();
                this.isFilterTextPresent = false;
                if (this.filterType === DataTableFilterType.Column) {
                    this.filteredTextFields[propertyName] = filteredText;
                    for (let key in this.filteredTextFields) {
                        if (this.filteredTextFields.hasOwnProperty(key)) {
                            if (this.filteredTextFields[key]) {
                                this.isFilterTextPresent = true;
                                break;
                            }
                        }
                    }
                    this.filteredData = this.isFilterTextPresent ? this.dataTableFilterService.onApplyColumnFilter(this.dataCollection, this.filteredTextFields) : [...this.dataCollection];
                } else if (this.filterType === DataTableFilterType.Global) {
                    this.filteredData = filteredText ? this.dataTableFilterService.onApplyGlobalFilter(filteredText, this.dataCollection, this.header) : [...this.dataCollection];
                    this.isFilterTextPresent = filteredText ? true : false;
                } else {
                    let response: DataTableUserActionResponse;
                    if (this.filterType === DataTableFilterType.CustomColumn) {
                        response = {
                            filterColumn: propertyName,
                            filterText: filteredText
                        };
                    } else if (this.filterType === DataTableFilterType.CustomGlobal) {
                        response = {
                            filterText: filteredText
                        };
                    }
                    this.getCustomFilterInfo.emit(response);
                }
                /* In case, any of the data loading pattern is applied, then displaying data based on that */
                this.onDisplayDataBasedOnLoadingPattern(this.filteredData);
            }
            clearTimeout(timeOut);
        }, 1000);
    }

    /**
     * This method is responsible for applying sorting on the respective datatable column
     * @param event { MouseEvent } Mouse click event
     * @param propertyName { string } Selected column of the datatable
     * @param type { DataTableColumnType } Type of the datatable column based on which sorting will be applied
     */
    public onApplySort = (event: MouseEvent, propertyName: string, type: DataTableColumnType): void => {
        this.dataTableUIService.onHighlightSelectedElement(event, 'datatable-header', 'highlight-column-header');
        for (let key in this.sortFields) {
            if (this.sortFields.hasOwnProperty(key)) {
                if (key !== propertyName) {
                    this.sortFields[key] = DataTableSortOrder.None;
                } else {
                    if (this.sortFields[propertyName] === DataTableSortOrder.None || this.sortFields[propertyName] === DataTableSortOrder.Descending) {
                        this.sortFields[propertyName] = DataTableSortOrder.Ascending;
                    } else {
                        this.sortFields[propertyName] = DataTableSortOrder.Descending;
                    }
                }
            }
        }
        let dataCollection: object[];
        if (type !== DataTableColumnType.Custom) {
            this.dataCollection = this.dataTableSortService.onApplySort(this.dataCollection, propertyName, type, this.sortFields);
            dataCollection = this.isFilterTextPresent ? this.dataTableSortService.onApplySort(this.dataToDisplay, propertyName, type, this.sortFields) : [...this.dataCollection];
        } else {
            const response: DataTableUserActionResponse = {
                sortColumn: propertyName,
                sortOrder: this.sortFields[propertyName]
            };
            this.getSortingInfo.emit(response);
        }
        /* In case, any of the data loading pattern is applied, then displaying data based on that */
        this.onDisplayDataBasedOnLoadingPattern(dataCollection);
    }

    /**
     * This method is responsible for displaying data based on the selected data loading pattern, if applicable
     * @param dataCollection { object[] } Collection of data to display
     */
    private onDisplayDataBasedOnLoadingPattern = (dataCollection: object[]): void => {
        if (dataCollection && dataCollection.length > 0) {
            if (this.dataLoadingPattern === DataTableLoadingPattern.Pagination) {
                this.onPreparationOfDataForPagination(dataCollection);
                /* Allowing browser to render the new dataset before performing selection related action */
                setTimeout(() => this.dataTableSelectionService.onSelectDataTableSelectAll(this.selectAllCheckboxState, dataCollection, this.checkboxSelection, this.rowStyle.selectionColor), 0);
            } else if (this.dataLoadingPattern === DataTableLoadingPattern.VirtualScrolling) {
                const numberOfBufferedDataRow: number = 2;
                this.dataToDisplay = dataCollection.slice(0, this.virtualScrolling.numberOfRowsPerScroll + numberOfBufferedDataRow);
                setTimeout(() => this.dataTableSelectionService.onSelectDataTableSelectAll(this.selectAllCheckboxState, this.dataToDisplay, this.checkboxSelection, this.rowStyle.selectionColor), 0);
            } else {
                this.dataToDisplay = [...this.filteredData];
            }
        } else {
            this.dataToDisplay = [];
        }
    }

    private onPreparationOfDataForPagination = (dataCollection: object[]): void => {
        let totalNoOfPaginationSlot: number = 1;
        this.paginationData = this.dataTablePaginationService.preparePaginationTabs(dataCollection, this.pagination);
        if (this.paginationData && this.paginationData.length > 0) {
            Object.assign(this.currentPaginationSlot, this.paginationData[0]);
            totalNoOfPaginationSlot = this.paginationData.length;
            this.dataTableUIService.onStateChangeOfPaginationArrow(0, totalNoOfPaginationSlot);
            this.dataToDisplay = this.currentPaginationSlot['data'][0]['data'];
        } else {
            this.currentPaginationSlot = {};
            this.dataTableUIService.onStateChangeOfPaginationArrow(0, totalNoOfPaginationSlot);
        }
    }

    public onSelectPaginationTab = (event: MouseEvent, index: number): void => {
        this.dataToDisplay = this.dataTablePaginationService.onSelectPaginationTab(this.currentPaginationSlot, index);
        /* Allowing browser to render the new dataset before performing selection related action */
        setTimeout(() => this.dataTableSelectionService.onSelectDataTableSelectAll(this.selectAllCheckboxState, this.dataToDisplay, this.checkboxSelection, this.rowStyle.selectionColor), 0);
        this.dataTableUIService.onHighlightSelectedElement(event, 'pagination-tab', 'highlight-pagination-tab');
    }

    public onChangePaginationSlot = (slotIndex: number): void => {
        if (slotIndex < 0 || slotIndex > this.paginationData.length - 1) {
            return;
        } else {
            const totalNoOfPaginationSlot: number = this.paginationData && this.paginationData.length;
            this.dataTableUIService.onStateChangeOfPaginationArrow(slotIndex, totalNoOfPaginationSlot);
            this.currentPaginationSlot = this.dataTablePaginationService.onChangePaginationSlot(slotIndex);
            const currentTabIndex: number = this.currentPaginationSlot['data'][0]['index'];
            /* Allowing browser to render the new pagination slot on slot change */
            setTimeout(() => document.getElementById('pagination-tab-' + currentTabIndex).click(), 0);
        }
    }

    @HostListener('scroll', ['$event'])
    onApplyVirtualScrolling(event: Event) {
        if (this.dataLoadingPattern === DataTableLoadingPattern.VirtualScrolling) {
            if ((event && event.currentTarget && event.currentTarget['className'].indexOf('scrollable-area-datatable-body') >= 0)) {
                const currentTarget: EventTarget = event.currentTarget;
                let dataCollection: object[] = [];
                let firstRowIndex: number = 0;
                if (this.isFilterTextPresent) {
                    dataCollection = this.filteredData;
                    firstRowIndex = (this.filteredData && this.filteredData.length > 0) ? this.filteredData[0]['Index'] : firstRowIndex;
                } else {
                    dataCollection = this.dataCollection;
                    firstRowIndex = (this.dataCollection && this.dataCollection.length > 0) ? this.dataCollection[0]['Index'] : firstRowIndex;
                }
                setTimeout(() => {
                    this.dataToDisplay = this.dataTableVirtualScrollingService.onRetrievalOfNewDataTableRow(currentTarget, dataCollection, this.dataToDisplay);
                    if (this.dataToDisplay && this.dataToDisplay.length > 0) {
                        const dataTableRow: HTMLElement = this.dataTableElementReferenceService.getHTMLElementRefernce('datatable-row');
                        if (currentTarget['scrollTop'] === 0 && firstRowIndex !== this.dataToDisplay[0]['Index']) {
                            currentTarget['scrollTop'] = dataTableRow ? dataTableRow['offsetHeight'] / 2 : 0;
                        }
                    }
                }, 0);
                /* Allowing browser to render the new dataset before performing selection related action */
                setTimeout(() => this.dataTableSelectionService.onSelectDataTableSelectAll(this.selectAllCheckboxState, this.dataToDisplay, this.checkboxSelection, this.rowStyle.selectionColor), 0);
            }
        }
    }

    public onHoverTooltipIcon = (event: MouseEvent, tooltipMessage: string): void => {
        if (event) {
            if (event.type === 'mouseenter') {
                this.tooltipInfo = { event: event, 'content': tooltipMessage };
            } else if (event.type === 'mouseleave') {
                this.tooltipInfo = new DataTableTooltip();
            }
        }
    }
}
