import { AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DataTableActionsToolbarService } from '../services/datatable.actions-toolbar.service';
import { DataTableElementReferenceService } from '../services/datatable.element-reference.service';
import { DataTableFilterService } from '../services/datatable.filter.service';
import { DataTablePaginationService } from '../services/datatable.pagination.service';
import { DataTablePipeService } from '../services/datatable.pipe';
import { DataTableSelectionService } from '../services/datatable.selection.service';
import { DataTableSortService } from '../services/datatable.sort.service';
import { DataTableUIService } from '../services/datatable.ui.service';
import { DataTableVirtualScrollingService } from '../services/datatable.virtual-scrolling.service';
import { DataTableColumnType, DataTableFilterType, DataTableLoadingPattern, DataTablePopupType, DataTableSortOrder, DataTableToolbarActionType } from '../enumerations/datatable.enum';
import { DataTableHeader, DataTableHeaderStyle, DataTableRowStyle, DataTableToolbar, DataTableUserActionResponse, DataTableVirtualScrolling } from '../interfaces/datatable.interface';
import { DataTablePagination, DataTablePopup, DataTableTooltip } from '../models/datatable.model';

@Component({
    selector: 'app-datatable',
    templateUrl: './datatable.component.html',
    styleUrls: ['./datatable.component.scss']
})
export class DataTableComponent implements OnInit, AfterViewInit, AfterViewChecked {
    @Input() public checkboxSelection: boolean;
    @Input() public columnResponsive: boolean;
    @Input() set data(collection: object[]) {
        if (collection && collection.length > 0) {
            /* This variable is responsible to hold the original data received from invoked component and restricted for further modification */
            this.rawData = [...collection];
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
    @Input() public popup: DataTablePopup;
    @Input() public rowStyle: DataTableRowStyle;
    @Input() public toolbar: DataTableToolbar;
    @Input() public treeGrid: boolean;
    @Input() public virtualScrolling: DataTableVirtualScrolling;

    @Output() public getDataTableDownloadedData = new EventEmitter<DataTableUserActionResponse>();
    @Output() public getDataTableSelectAllCheckboxState = new EventEmitter<DataTableUserActionResponse>();
    @Output() public getDataTableSelectedRows = new EventEmitter<DataTableUserActionResponse>();
    @Output() public getDataTableCustomFilterInfo = new EventEmitter<DataTableUserActionResponse>();
    @Output() public getDataTableSortingInfo = new EventEmitter<DataTableUserActionResponse>();
    @Output() public getDataTableEditedData = new EventEmitter<DataTableUserActionResponse>();
    @Output() public getDataTableRowsToDelete = new EventEmitter<DataTableUserActionResponse>();

    public isLoading: boolean;
    public randomIndex: number;
    public isDataTableVisible: boolean;
    public dataToDisplay: object[];
    public frozenHeader: DataTableHeader[];
    public scrollableHeader: DataTableHeader[];
    public scrollableAreaWidth: string;
    public responsiveColumnWidth: string;
    public verticalScrollableRegion: string;
    public isDataTableCellDisabled: boolean;
    public columnFilter: boolean;
    public globalFilter: boolean;
    public sortFields: object;
    public currentPaginationSlot: object;
    public tooltipInfo: DataTableTooltip;
    public toolbarAction: DataTableToolbarActionType;
    public dataTableFilterType = DataTableFilterType;
    public dataTableLoadingPattern = DataTableLoadingPattern;
    public dataTableToolbarActionType = DataTableToolbarActionType;
    public isDataTablePopupVisible: boolean;
    private rawData: object[];
    private dataCollection: object[];
    private listOfInternalObjectProperties: string[];
    private listOfSelectedDataTableRows: object[];
    private selectAllCheckboxState: string;
    private filterType: number;
    private filteredTextFields: object;
    private isCompletelyRendered: boolean;
    private isFilterTextPresent: boolean;
    private filteredData: object[];
    private paginationData: object[];
    private listOfEditedDataTableRows: object[];
    private startPageXPosition: number;
    private selectedResizerIndex: number;
    private dataTableSelectedColumn: NodeList;
    private selectedColumnWidth: number;
    private dataTableNextColumn: NodeList;
    private nextColumnWidth: number;
    private currentSelectedColumnWidth: number;
    private currentNextColumnWidth: number;

    @ViewChild('dataTable') private dataTable: ElementRef;

    constructor(
        private dataTableActionsToolbarService: DataTableActionsToolbarService,
        private dataTableElementReferenceService: DataTableElementReferenceService,
        private dataTableFilterService: DataTableFilterService,
        private dataTablePaginationService: DataTablePaginationService,
        private dataTablePipeService: DataTablePipeService,
        private dataTableSelectionService: DataTableSelectionService,
        private dataTableSortService: DataTableSortService,
        private dataTableUIService: DataTableUIService,
        private dataTableVirtualScrollingService: DataTableVirtualScrollingService) {
        this.isLoading = true;
        this.randomIndex = Math.floor(1000 + Math.random() * 9000);
        this.isDataTableVisible = true;
        this.dataToDisplay = [];
        this.frozenHeader = [];
        this.scrollableHeader = [];
        this.scrollableAreaWidth = '';
        this.responsiveColumnWidth = '';
        this.verticalScrollableRegion = '';
        this.isDataTableCellDisabled = true;
        this.columnFilter = false;
        this.globalFilter = false;
        this.sortFields = {};
        this.currentPaginationSlot = {};
        this.tooltipInfo = new DataTableTooltip();
        this.isDataTablePopupVisible = false;
        this.rawData = [];
        this.dataCollection = [];
        this.listOfInternalObjectProperties = ['Index', 'RowSelected'];
        this.listOfSelectedDataTableRows = [];
        this.selectAllCheckboxState = '';
        this.filterType = -1;
        this.filteredTextFields = {};
        this.isCompletelyRendered = false;
        this.isFilterTextPresent = false;
        this.filteredData = [];
        this.paginationData = [];
        this.listOfEditedDataTableRows = [];
        this.toolbarAction = DataTableToolbarActionType.None;
        this.startPageXPosition = 0;
        this.selectedResizerIndex = 0;
        this.selectedColumnWidth = 0;
        this.nextColumnWidth = 0;
        this.currentSelectedColumnWidth = 0;
        this.currentNextColumnWidth = 0;
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
            this.onInitializeDataTableFields();
            /* In case, any of the data loading pattern is applied, then displaying data based on that */
            this.onDisplayDataBasedOnLoadingPattern(this.dataCollection);
        }, 0);
    }

    ngAfterViewChecked() {
        const dataTableBody: HTMLElement = this.dataTableElementReferenceService.getHTMLElementRefernce('scrollable-area-datatable-body');
        if ((dataTableBody && dataTableBody['children'].length > 0) && (this.dataCollection && this.dataCollection.length > 0) && !this.isCompletelyRendered) {
            this.isCompletelyRendered = true;
            this.dataTableUIService.onSetDataTableStyle(this.headerStyle, this.rowStyle, this.randomIndex, (this.header && this.header.length));
            this.dataTableUIService.onActivateScrollingForHiddenScrollbars();
        }
    }

    /**
     * This method is responsible for preparing data collection for datatable
     * @param collection { object[] } Data collection provided from the invoked component
     */
    private onReceiveOfDataTableData = (collection: object[]): void => {
        if ((collection && collection.length > 0) && (this.header && this.header.length > 0)) {
            let isPipePresent: boolean = false;
            collection.forEach((rowData: object, index: number) => {
                /* Setting unique index value to each row to use for individual row identification */
                rowData['Index'] = index + 1;
                /* Setting 'RowSelected' attribute to each row, initialized with 'false' to keep track of individual row selection state */
                rowData['RowSelected'] = false;
                if (!isPipePresent) {
                    this.header.forEach((columnHeader: DataTableHeader) => {
                        if (columnHeader.pipe) {
                            isPipePresent = true;
                            this.dataTablePipeService.onApplyPipe(rowData, columnHeader.propertyName, columnHeader.pipe);
                        }
                    });
                    isPipePresent = !isPipePresent;
                }
            });
        }
        /* This variable is responsible for holding entire collection of data prepared for datatable */
        this.dataCollection = [...collection];
        /* This variable is responsible for displaying list of data to UI, mainly when entire data collection is not available */
        this.dataToDisplay = [...this.dataCollection];
        this.isLoading = false;
    }

    /**
     * This method is responsible for initializing datatable fields (filter, sorting etc.)
     */
    private onInitializeDataTableFields = (): void => {
        if (this.header && this.header.length > 0) {
            this.header.forEach((header: DataTableHeader, index: number) => {
                /* Setting unique index value to each column header to use for individual column identification */
                header['index'] = index + 1;
                if (this.filterType === DataTableFilterType.Column || this.filterType === DataTableFilterType.CustomColumn) {
                    this.filteredTextFields[header.propertyName] = '';
                }
                this.sortFields[header.propertyName] = DataTableSortOrder.None;
            });
            this.frozenHeader = this.header.filter((header: DataTableHeader) => header.frozen);
            this.scrollableHeader = this.header.filter((header: DataTableHeader) => !header.frozen);
        }
    }

    /**
     * This method gets triggered on change of 'Select All' checkbox state
     * @param event { MouseEvent } Change event
     */
    public onSelectDataTableSelectAll = (event?: MouseEvent): void => {
        this.selectAllCheckboxState = event && event.currentTarget['checked'] ? 'checked' : 'unchecked';
        this.dataTableSelectionService.onSelectDataTableSelectAll(this.selectAllCheckboxState, this.dataCollection, this.checkboxSelection, this.rowStyle.selectionColor);
        const response: DataTableUserActionResponse = {
            state: this.selectAllCheckboxState
        };
        this.getDataTableSelectAllCheckboxState.emit(response);
    }

    /**
     * This method gets triggered on selection of individiual datatable row
     * @param event { MouseEvent } Mouse click event
     */
    public onSelectDataTableRow = (event: MouseEvent): void => {
        const rowSelectionInfo = this.dataTableSelectionService.onSelectDataTableRow(event, this.dataCollection, this.checkboxSelection, this.rowStyle.selectionColor);
        Object.assign(this, rowSelectionInfo);
        this.onRemoveInternalObjectProperties(this.listOfSelectedDataTableRows);
        const response: DataTableUserActionResponse = {
            data: this.listOfSelectedDataTableRows,
            state: this.selectAllCheckboxState
        };
        this.getDataTableSelectedRows.emit(response);
    }

    /**
     * This method is responsible for filtering the list of records based on user input
     * @param event { KeyboardEvent } Keyboard event
     * @param propertyName? { string } Name of the column on which filter is applied (if column-filter is applicable)
     */
    public onApplyFilter = (event: KeyboardEvent | MouseEvent, propertyName?: string): void => {
        if (this.listOfEditedDataTableRows && this.listOfEditedDataTableRows.length <= 0) {
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
                        this.getDataTableCustomFilterInfo.emit(response);
                    }
                    /* In case, any of the data loading pattern is applied, then displaying data based on that */
                    this.onDisplayDataBasedOnLoadingPattern(this.filteredData, event);
                }
                clearTimeout(timeOut);
            }, 1000);
        } else {
            this.onSelectDataTableToolbarOption(DataTableToolbarActionType.Save);
        }
    }

    /**
     * This method is responsible for applying sorting on the respective datatable column
     * @param event { MouseEvent } Mouse click event
     * @param propertyName { string } Selected column of the datatable
     * @param type { DataTableColumnType } Type of the datatable column based on which sorting will be applied
     */
    public onApplySort = (event: MouseEvent, propertyName: string, type: DataTableColumnType): void => {
        if (this.listOfEditedDataTableRows && this.listOfEditedDataTableRows.length <= 0) {
            this.dataTableUIService.onHighlightSelectedElement(event, 'datatable-header', 'highlight-column-header', (this.headerStyle && this.headerStyle.selectionColor));
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
                dataCollection = this.isFilterTextPresent ? this.dataTableSortService.onApplySort(this.filteredData, propertyName, type, this.sortFields) : [...this.dataCollection];
            } else {
                const response: DataTableUserActionResponse = {
                    sortColumn: propertyName,
                    sortOrder: this.sortFields[propertyName]
                };
                this.getDataTableSortingInfo.emit(response);
            }
            /* In case, any of the data loading pattern is applied, then displaying data based on that */
            this.onDisplayDataBasedOnLoadingPattern(dataCollection);
        } else {
            this.onSelectDataTableToolbarOption(DataTableToolbarActionType.Save);
        }
    }

    /**
     * This method is responsible for displaying data based on the selected data loading pattern, if applicable
     * @param dataCollection { object[] } Collection of data to display
     */
    private onDisplayDataBasedOnLoadingPattern = (dataCollection: object[], event?: KeyboardEvent | MouseEvent): void => {
        if (dataCollection && dataCollection.length > 0) {
            if (this.dataLoadingPattern === DataTableLoadingPattern.Pagination) {
                this.onPreparationOfDataForPagination(dataCollection);
                /* Allowing browser to render the new dataset before performing selection related action */
                setTimeout(() => this.dataTableSelectionService.onSelectDataTableSelectAll(this.selectAllCheckboxState, dataCollection, this.checkboxSelection, this.rowStyle.selectionColor), 0);
            } else if (this.dataLoadingPattern === DataTableLoadingPattern.VirtualScrolling) {
                const numberOfBufferedDataRow: number = 2;
                this.dataToDisplay = dataCollection.slice(0, this.virtualScrolling.numberOfRowsPerScroll + numberOfBufferedDataRow);
                /* Allowing browser to render the new dataset before performing selection related action */
                setTimeout(() => this.dataTableSelectionService.onSelectDataTableSelectAll(this.selectAllCheckboxState, this.dataToDisplay, this.checkboxSelection, this.rowStyle.selectionColor), 0);
            } else {
                this.dataToDisplay = [...this.filteredData];
            }
        } else {
            this.dataToDisplay = [];
        }
    }

    /**
     * This method is responsible for structuring the data collection on slot basis for pagination
     * @param dataCollection { object[] } Data collection
     */
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

    /**
     * This method gets triggered on selection of pagination tab
     * @param event { MouseEvent } Tab selection mouse event
     * @param index { number } Selected tab index
     */
    public onSelectPaginationTab = (event: MouseEvent, index: number): void => {
        this.dataToDisplay = this.dataTablePaginationService.onSelectPaginationTab(this.currentPaginationSlot, index);
        /* Allowing browser to render the new dataset before performing selection related action */
        setTimeout(() => this.dataTableSelectionService.onSelectDataTableSelectAll(this.selectAllCheckboxState, this.dataToDisplay, this.checkboxSelection, this.rowStyle.selectionColor), 0);
        this.dataTableUIService.onHighlightSelectedElement(event, 'pagination-tab', 'highlight-pagination-tab');
    }

    /**
     * This method gets triggered on change of pagination slot
     * @param slotIndex { number } Selected slot index
     */
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

    /**
     * This method gets triggered on vertical scrolling, in case data loading pattern has set for virtual scrolling
     * @param event { ScrollEvent } Mouse scrolling event
     */
    @HostListener('scroll', ['$event'])
    onApplyVirtualScrolling(event: Event) {
        if (this.dataLoadingPattern === DataTableLoadingPattern.VirtualScrolling) {
            if ((event && event.currentTarget && event.currentTarget['className'].indexOf('scrollable-area-datatable-body') >= 0)) {
                const currentTarget: EventTarget = event.currentTarget;
                let dataCollection: object[] = [];
                let firstRowIndex: number = 0;
                /* In case filter is applied, virtual scrolling will run on filtered data; otherwise considering entire data collection */
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

    /**
     * This method gets triggered on hover of tooltip icon
     * @param event { MouseEvent } Mouse hover event
     * @param tooltipMessage { string } Message to show in tooltip
     */
    public onHoverTooltipIcon = (event: MouseEvent, tooltipMessage: string): void => {
        if (event) {
            if (event.type === 'mouseenter') {
                this.tooltipInfo = { event: event, 'content': tooltipMessage };
            } else if (event.type === 'mouseleave') {
                this.tooltipInfo = new DataTableTooltip();
            }
        }
    }

    /**
     * This method is responsible to display datatable popup based on the selected toolbar action
     * @param actionType { DataTableToolbarActionType } Type of the selected toolbar action
     */
    public onSelectDataTableToolbarOption = (actionType: DataTableToolbarActionType): void => {
        let dataTablePopupHeading: string = '';
        let dataTablePopupMessage: string = '';
        this.isDataTablePopupVisible = true;
        this.toolbarAction = actionType || DataTableToolbarActionType.None;
        switch (actionType) {
            case DataTableToolbarActionType.Delete:
                dataTablePopupHeading = 'Delete';
                dataTablePopupMessage = 'Do you want to delete the selected rows?';
                break;
            case DataTableToolbarActionType.Download:
                dataTablePopupHeading = 'Download';
                dataTablePopupMessage = 'Please provide the following details to download the records.';
                break;
            case DataTableToolbarActionType.Reset:
                dataTablePopupHeading = 'Reset';
                dataTablePopupMessage = 'Do you want to reset the data table?';
                break;
            case DataTableToolbarActionType.Save:
                dataTablePopupHeading = 'Save';
                dataTablePopupMessage = 'Do you want to save the unsaved data?';
                break;
            default:
                break;
        }
        this.popup = {
            action: this.toolbarAction,
            heading: dataTablePopupHeading,
            message: dataTablePopupMessage,
            type: DataTablePopupType.Confirmation
        };
    }

    /**
     * This method gets triggered on click of 'Proceed' button for confirming popup action
     * @param response { DataTableUserActionResponse } Response received from the popup component
     */
    public onConfirmDataTablePopupAction = (response: DataTableUserActionResponse): void => {
        switch (this.toolbarAction) {
            case DataTableToolbarActionType.Delete:
                this.onApplyDataTableDeleteOption();
                break;
            case this.dataTableToolbarActionType.Download:
                this.onApplyDataTableDownloadOption(response);
                break;
            case DataTableToolbarActionType.Reset:
                this.onApplyDataTableResetOption();
                break;
            case DataTableToolbarActionType.Save:
                this.onApplyDataTableSaveOption();
                break;
            default:
                break;
        }
    }

    /**
     * This method gets triggered on close of datatable popup to destroy the datatable popup component
     * @param state { boolean } Current state of the datatable popup; True - Visible, False - Hidden
     */
    public onClosingDataTablePopup = (state: boolean): void => {
        this.isDataTablePopupVisible = state;
    }

    /**
     * This method is responsible for deleting selected datatable rows
     */
    private onApplyDataTableDeleteOption = (): void => {
        const response: DataTableUserActionResponse = {
            data: this.listOfSelectedDataTableRows
        };
        this.getDataTableRowsToDelete.emit(response);
        this.listOfSelectedDataTableRows = [];
        this.onSelectDataTableSelectAll();
    }

    /**
     * This method is responsible for downloading datatable records
     */
    private onApplyDataTableDownloadOption = (response: DataTableUserActionResponse): void => {
        if (response && response.data && response.data.length > 0) {
            this.getDataTableDownloadedData.emit(response.data[0]);
        } else {
            this.getDataTableEditedData.emit(response);
        }
    }

    /**
     * This method gets triggered on selection of edit toolbar option
     */
    public onApplyDataTableEditOption = (): void => {
        this.isDataTableCellDisabled = !this.isDataTableCellDisabled;
    }

    /**
     * This method gets triggered on edition of datatable cell
     * @param event { KeyboardEvent } Keyup event
     * @param propertyName { string } Column header of the cell that has been modified
     * @param type { DataTableColumnType } Type of the column of which cell is modified
     */
    public onEditDataTableCell = (event: KeyboardEvent, propertyName: string, type: DataTableColumnType): void => {
        let timeOut = setTimeout(() => {
            this.listOfEditedDataTableRows = JSON.parse(JSON.stringify(this.dataTableActionsToolbarService.onPrepareListOfDataTableEditedRows(event, this.dataCollection, this.header, propertyName, type)));
            this.onRemoveInternalObjectProperties(this.listOfEditedDataTableRows);
            clearTimeout(timeOut);
        }, 1000);
    }

    /**
     * This method gets triggered on saving of edited datatable rows
     */
    private onApplyDataTableSaveOption = (): void => {
        const response: DataTableUserActionResponse = {
            data: this.listOfEditedDataTableRows
        };
        this.getDataTableEditedData.emit(response);
        this.listOfEditedDataTableRows = [];
    }

    /**
     * This method is responsible for resetting the edited datatable rows
     */
    private onApplyDataTableResetOption = (): void => {
        this.dataCollection = [...this.rawData];
        this.isDataTableVisible = false;
        this.isDataTableCellDisabled = false;
        this.isFilterTextPresent = false;
        this.dataToDisplay = [];
        this.listOfEditedDataTableRows = [];
        this.listOfSelectedDataTableRows = [];
        this.onSelectDataTableSelectAll();
        this.onDisplayDataBasedOnLoadingPattern(this.dataCollection);
        this.onInitializeDataTableFields();
        this.onApplyDataTableEditOption();
        setTimeout(() => this.isDataTableVisible = true, 0);
    }

    /**
     * This method is responsible for removing internal object properties used for datatable from actual data collection provided by invoked component
     * @param dataCollection { object[] } Collection of datatable rows
     * return dataCollection { object[] } Collection of datatable rows after removing internal used properties
     */
    private onRemoveInternalObjectProperties = (dataCollection: object[]): object[] => {
        if ((this.listOfInternalObjectProperties && this.listOfInternalObjectProperties.length > 0) && (dataCollection && dataCollection.length > 0)) {
            dataCollection.forEach((rowData: object) => {
                this.listOfInternalObjectProperties.forEach((internalPropertyName: string) => {
                    delete rowData[internalPropertyName];
                });
            });
            return dataCollection;
        }
        return dataCollection;
    }

    /**
     * This method is responsible for getting the start column dragging position
     * @param event { MouseEvent } Mouse click event
     */
    public onStartDataTableColumnResizing = (event: MouseEvent): void => {
        if (event && event.currentTarget) {
            const self = this;
            this.startPageXPosition = event.pageX;
            this.selectedResizerIndex = event.currentTarget['id'] && parseInt(event.currentTarget['id'].replace(/^\D+/g, ''), 10) || 0;
            if (this.selectedResizerIndex > 0) {
                this.dataTableSelectedColumn = this.dataTableElementReferenceService.getNodeListReference('datatable-column-index', this.selectedResizerIndex);
                this.dataTableNextColumn = this.dataTableElementReferenceService.getNodeListReference('datatable-column-index', this.selectedResizerIndex + 1);
                if ((this.dataTableSelectedColumn && this.dataTableSelectedColumn.length > 0) && (this.dataTableNextColumn && this.dataTableNextColumn.length > 0)) {
                    this.selectedColumnWidth = this.dataTableSelectedColumn[0]['offsetWidth'];
                    this.nextColumnWidth = this.dataTableNextColumn[0]['offsetWidth'];
                }
            }
            document.addEventListener('mousemove', this.mouseMove);
            document.addEventListener('mouseup', () => {
                self.dataTableSelectedColumn = undefined;
                self.selectedColumnWidth = 0;
                self.dataTableNextColumn = undefined;
                self.nextColumnWidth = 0;
                self.startPageXPosition = 0;
                document.removeEventListener('mousemove', self.mouseMove);
            });
        }
    }

    /**
     * This method gets triggered on movemovent of mouse while resizing datatable column
     * @param event { MouseEvent } Mouse move event
     */
    private mouseMove = (event: MouseEvent) => {
        const pageXDifference = event.pageX - this.startPageXPosition;
        const totalWidth: number = this.selectedColumnWidth + this.nextColumnWidth;
        this.currentSelectedColumnWidth = this.selectedColumnWidth + pageXDifference;
        this.currentNextColumnWidth = this.nextColumnWidth - pageXDifference;
        const minimumGap: number = 70;
        if ((pageXDifference >= 0 && this.currentSelectedColumnWidth + minimumGap <= totalWidth) || (pageXDifference <= 0 && this.currentNextColumnWidth + minimumGap <= totalWidth)) {
            if (this.dataTableSelectedColumn && this.dataTableSelectedColumn.length > 0) {
                this.header[this.selectedResizerIndex - 1].columnWidth = this.currentSelectedColumnWidth + 'px';
                this.header[this.selectedResizerIndex].columnWidth = this.currentNextColumnWidth + 'px';
                for (let i = 0; i < this.dataTableSelectedColumn.length; i++) {
                    this.dataTableSelectedColumn[i]['style'].width = this.currentSelectedColumnWidth + 'px';
                    this.dataTableNextColumn[i]['style'].width = this.currentNextColumnWidth + 'px';
                }
            }
        }
    }
}
