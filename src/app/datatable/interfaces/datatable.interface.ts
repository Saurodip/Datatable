import { DataTableColumnType, DataTableFilterType, DataTableLoadingPattern } from '../enumerations/datatable.enum';
import { DataTablePagination, DataTablePipe } from '../models/datatable.model';

export interface DataTable {
    checkboxSelection?: boolean;
    columnResponsive: boolean;
    data: Array<object>;
    dataLoadingPattern?: DataTableLoadingPattern;
    filter: DataTableFilterType;
    filterTextLimit: number;
    header: DataTableHeader;
    headerStyle?: DataTableHeaderStyle;
    height: string;
    pagination?: DataTablePagination;
    rowStyle?: DataTableRowStyle;
    virtualScrolling?: DataTableVirtualScrolling;
}

export interface DataTableHeader {
    frozen?: boolean;
    propertyName: string;
    title: string;
    type: DataTableColumnType;
    columnWidth: string;
    pipe?: DataTablePipe;
    tooltip?: boolean;
}

export interface DataTableHeaderStyle {
    backgroundColor?: string;
    borderColor?: string;
    color?: string;
    font?: string;
    lineHeight?: string;
    maxWidth?: string;
    minWidth?: string;
    padding?: string;
    textAlign?: string;
}

export interface DataTableRowStyle {
    backgroundColor?: string;
    border?: string;
    color?: string;
    cursor?: string;
    font?: string;
    height?: string;
    hoverColor?: string;
    lineHeight?: string;
    maxWidth?: string;
    minWidth?: string;
    padding?: string;
    selectionColor?: string;
    textAlign?: string;
}

export interface DataTableUserActionResponse {
    data?: object[];
    filterColumn?: string;
    filterText?: string;
    sortColumn?: string;
    sortOrder?: string;
    state?: string;
}

export interface DataTableVirtualScrolling {
    numberOfRowsPerScroll: number;
}
