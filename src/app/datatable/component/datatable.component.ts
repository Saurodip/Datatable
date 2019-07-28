import { AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DataTableElementReferenceService } from '../services/datatable.element-reference.service';
import { DataTableFilterService } from '../services/datatable.filter.service';
import { DataTablePaginationService } from '../services/datatable.pagination.service';
import { DataTablePipeService } from '../services/datatable.pipe';
import { DataTableSelectionService } from '../services/datatable.selection.service';
import { DataTableSortService } from '../services/datatable.sort.service';
import { DataTableUIService } from '../services/datatable.ui.service';
import { DataTableVirtualScrollingService } from '../services/datatable.virtual-scrolling.service';
import { DataTableColumnType, DataTableLoadingPattern, DataTableSortOrder } from '../enumerations/datatable.enum';
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
    @Input() public columnFilter: boolean;
    @Input() public columnResponsive: boolean;
    @Input() set data(collection: object[]) {
        if (collection && collection.length > 0) {
            this.dataStore = JSON.parse(JSON.stringify(collection));
            this.onReceiveOfDataTableData(collection);
        }
    }
    @Input() public dataLoadingPattern: DataTableLoadingPattern;
    @Input() public filterTextLimit: number;
    @Input() public globalFilter: boolean;
    @Input() public header: DataTableHeader[];
    @Input() public headerStyle: DataTableHeaderStyle;
    @Input() public height: string;
    @Input() public pagination: DataTablePagination;
    @Input() public rowStyle: DataTableRowStyle;
    @Input() public virtualScrolling: DataTableVirtualScrolling;

    @Output() public changeSelectAllCheckboxState = new EventEmitter<DataTableUserActionResponse>();
    @Output() public selectedDataTableRows = new EventEmitter<DataTableUserActionResponse>();

    public isLoading: boolean;
    public randomIndex: number;
    public dataToDisplay: object[];
    public frozenHeader: DataTableHeader[];
    public scrollableHeader: DataTableHeader[];
    public scrollableAreaWidth: string;
    public responsiveColumnWidth: string;
    public verticalScrollableRegion: string;
    public sortFields: object;
    public currentPaginationSlot: object;
    public tooltipInfo: DataTableTooltip;
    public dataTableLoadingPattern = DataTableLoadingPattern;
    private dataStore: object[];
    private dataCollection: object[];
    private listOfSelectedDataTableRow: object[];
    private selectAllCheckboxState: string;
    private searchTextFields: object;
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
        this.sortFields = {};
        this.currentPaginationSlot = {};
        this.tooltipInfo = new DataTableTooltip();
        this.dataStore = [];
        this.dataCollection = [];
        this.listOfSelectedDataTableRow = [];
        this.selectAllCheckboxState = '';
        this.searchTextFields = {};
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
        if ((dataTableBody && dataTableBody['children'].length > 0) && (this.dataCollection && this.dataCollection.length > 0) && !this.isCompletelyRendered) {
            this.isCompletelyRendered = true;
            this.dataTableUIService.onSetDataTableStyle(this.headerStyle, this.rowStyle, this.randomIndex);
            this.dataTableUIService.onActivateScrollingForHiddenScrollbars();
            if (this.dataLoadingPattern === DataTableLoadingPattern.Pagination) {
                this.onPreparationOfDataForPagination(this.dataCollection);
            } else if (this.dataLoadingPattern === DataTableLoadingPattern.VirtualScrolling && this.virtualScrolling) {
                setTimeout(() => {
                    const noOfBufferedRow: number = 2;
                    this.dataToDisplay = this.dataCollection.slice(0, this.virtualScrolling.numberOfRowsPerScroll + noOfBufferedRow);
                }, 0);
            }
        }
    }

    /**
     * This method is responsible for preparing data collection suitable for datatable
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
                data: this.selectAllCheckboxState === 'checked' ? this.dataStore : [],
                state: this.selectAllCheckboxState
            };
            this.changeSelectAllCheckboxState.emit(response);
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
                this.selectedDataTableRows.emit(response);
            }
        }
    }

    public onApplySearch = (event: KeyboardEvent | MouseEvent, propertyName?: string): void => {
        let timeOut = setTimeout(() => {
            this.isFilterTextPresent = false;
            if (event && event.target) {
                const filteredText: string = event.target['value'] && event.target['value'].toLowerCase().trim();
                this.isFilterTextPresent = false;
                if (this.globalFilter) {
                    this.filteredData = filteredText ? this.dataTableFilterService.onApplyGlobalSearch(filteredText, this.dataCollection, this.header) : [...this.dataCollection];
                    this.isFilterTextPresent = filteredText ? true : false;
                } else if (this.columnFilter) {
                    this.searchTextFields[propertyName] = filteredText;
                    for (let key in this.searchTextFields) {
                        if (this.searchTextFields.hasOwnProperty(key)) {
                            if (this.searchTextFields[key]) {
                                this.isFilterTextPresent = true;
                                break;
                            }
                        }
                    }
                    this.filteredData = this.isFilterTextPresent ? this.dataTableFilterService.onApplyColumnSearch(this.dataCollection, this.searchTextFields) : [...this.dataCollection];
                    if (this.dataLoadingPattern === DataTableLoadingPattern.Pagination) {
                        this.onPreparationOfDataForPagination(this.filteredData);
                        /* Allowing browser to render the new dataset before performing selection related action */
                        setTimeout(() => this.dataTableSelectionService.onSelectDataTableSelectAll(this.selectAllCheckboxState, this.dataToDisplay, this.checkboxSelection, this.rowStyle.selectionColor), 0);
                    } else if (this.dataLoadingPattern === DataTableLoadingPattern.VirtualScrolling) {
                        this.dataToDisplay = this.filteredData.slice(0, this.virtualScrolling.numberOfRowsPerScroll + 2);
                        setTimeout(() => this.dataTableSelectionService.onSelectDataTableSelectAll(this.selectAllCheckboxState, this.dataToDisplay, this.checkboxSelection, this.rowStyle.selectionColor), 0);
                    } else {
                        this.dataToDisplay = [...this.filteredData];
                    }
                }
            }
            clearTimeout(timeOut);
        }, 1000);
    }

    public onApplySort = (event: MouseEvent, propertyName: string, type: DataTableColumnType, columnIndex: number): void => {
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
        let dataCollection: object[] = this.isFilterTextPresent ? this.dataToDisplay : this.dataCollection;
        if (type !== DataTableColumnType.Custom) {
            dataCollection = this.dataTableSortService.onApplySort(dataCollection, propertyName, type, this.sortFields);
            this.dataToDisplay = [...dataCollection];
        } else {
            // emit
        }
        // this.preparePaginationTabs();
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
        if ((event && event.currentTarget && event.currentTarget['className'].indexOf('scrollable-area-datatable-body') >= 0) && this.virtualScrolling) {
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
