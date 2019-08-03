export enum DataTableColumnType {
    Custom,
    Date,
    Float,
    Integer,
    None,
    String
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

export enum DataTableSortOrder {
    Ascending = -1,
    Descending = 1,
    None = 0
}

export enum DataTableToolbarActionType {
    Delete = 1,
    Edit = 2,
    None = 0,
    Save = 3
}
