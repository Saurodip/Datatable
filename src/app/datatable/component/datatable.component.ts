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
import { DataTableColumnType, DataTableFilterType, DataTableLoadingPattern, DataTableSortOrder, DataTableToolbarActionType, DataTablePopupType } from '../enumerations/datatable.enum';
import { DataTableHeader, DataTableHeaderStyle, DataTableRowStyle, DataTableToolbar, DataTableUserActionResponse, DataTableVirtualScrolling } from '../interfaces/datatable.interface';
import { DataTablePagination, DataTablePopup, DataTableTooltip } from '../models/datatable.model';

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
    @Input() public virtualScrolling: DataTableVirtualScrolling;

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
    public dataTableFilterType = DataTableFilterType;
    public dataTableLoadingPattern = DataTableLoadingPattern;
    public dataTableToolbarActionType = DataTableToolbarActionType;
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
    private toolbarAction: DataTableToolbarActionType;

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
                this.onInitializeDataTableFields();
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
        this.isLoading = false;
    }

    /**
     * This method is responsible for initializing datatable fields (filter, sorting etc.)
     */
    private onInitializeDataTableFields = (): void => {
        if (this.header && this.header.length > 0) {
            this.header.forEach((header: DataTableHeader) => {
                if (this.filterType === DataTableFilterType.Column || this.filterType === DataTableFilterType.CustomColumn) {
                    this.filteredTextFields[header.propertyName] = '';
                }
                this.sortFields[header.propertyName] = DataTableSortOrder.None;
            });
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
                    this.onDisplayDataBasedOnLoadingPattern(this.filteredData);
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
    private onDisplayDataBasedOnLoadingPattern = (dataCollection: object[]): void => {
        if (dataCollection && dataCollection.length > 0) {
            if (this.dataLoadingPattern === DataTableLoadingPattern.Pagination) {
                this.onPreparationOfDataForPagination(dataCollection);
                /* Allowing browser to render the new dataset before performing selection related action */
                setTimeout(() => this.dataTableSelectionService.onSelectDataTableSelectAll(this.selectAllCheckboxState, dataCollection, this.checkboxSelection, this.rowStyle.selectionColor), 0);
            } else if (this.dataLoadingPattern === DataTableLoadingPattern.VirtualScrolling) {
                const numberOfBufferedDataRow: number = 2;
                setTimeout(() => {
                    this.dataToDisplay = dataCollection.slice(0, this.virtualScrolling.numberOfRowsPerScroll + numberOfBufferedDataRow);
                    this.dataTableSelectionService.onSelectDataTableSelectAll(this.selectAllCheckboxState, this.dataToDisplay, this.checkboxSelection, this.rowStyle.selectionColor);
                }, 0);
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

    public onSelectDataTableToolbarOption = (actionType: DataTableToolbarActionType): void => {
        let dataTablePopupHeading: string = '';
        let dataTablePopupMessage: string = '';
        this.toolbarAction = actionType || DataTableToolbarActionType.None;
        switch (actionType) {
            case DataTableToolbarActionType.Delete:
                dataTablePopupHeading = 'Delete';
                dataTablePopupMessage = 'Do you want to delete the selected rows?';
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
            heading: dataTablePopupHeading,
            message: dataTablePopupMessage,
            type: DataTablePopupType.Confirmation,
            visible: true
        };
    }

    public onConfirmDataTablePopupAction = (event: DataTableUserActionResponse): void => {
        switch (this.toolbarAction) {
            case DataTableToolbarActionType.Delete:
                this.onApplyDataTableDeleteOption();
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

    public onApplyDataTableEditOption = (): void => {
        const dataTableEditOption: HTMLElement = this.dataTableElementReferenceService.getHTMLElementRefernce('datatable-edit-option');
        if (dataTableEditOption) {
            dataTableEditOption['checked'] = this.isDataTableCellDisabled;
            this.isDataTableCellDisabled = !this.isDataTableCellDisabled;
        }
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
        this.isDataTableVisible = false;
        this.isDataTableCellDisabled = false;
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
}
