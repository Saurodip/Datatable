export enum DataTableColumnType {
    Custom,
    Date,
    Float,
    Integer,
    None,
    String
}

export enum DataTableExportType {
    Excel = 'xlsx',
    None = 'none',
    PDF = 'pdf'
}

export enum DataTableFilterType {
    Column,
    CustomColumn,
    CustomGlobal,
    Global
}

export enum DataTableLoadingPattern {
    Pagination,
    VirtualScrolling
}

export enum DataTablePipeType {
    CurrencyPipe = 1,
    DatePipe,
    DecimalPipe,
    LowerCasePipe,
    None,
    UpperCasePipe
}

export enum DataTablePopupType {
    Confirmation,
    Failure,
    None,
    Successful
}

export enum DataTableSortOrder {
    Ascending = -1,
    Descending = 1,
    None = 0
}

export enum DataTableToolbarActionType {
    Delete = 4,
    Download = 1,
    Edit = 2,
    None = 0,
    Save = 3,
    Reset = 5
}
