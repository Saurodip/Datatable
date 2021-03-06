import { DataTableColumnType, DataTableFilterType, DataTableLoadingPattern } from '../enumerations/datatable.enum';
import { DataTablePagination, DataTablePipe, DataTablePopup } from '../models/datatable.model';

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
    popup?: DataTablePopup;
    rowStyle?: DataTableRowStyle;
    toolbar?: DataTableToolbar;
    treeGrid?: boolean;
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
    borderLeft?: string;
    borderRight?: string;
    color?: string;
    fontFamily?: string;
    font?: string;
    letterSpacing?: string;
    lineHeight?: string;
    maxWidth?: string;
    minWidth?: string;
    padding?: string;
    selectionColor?: string;
    textAlign?: string;
}

export interface DataTableRowStyle {
    backgroundColorEvenRow?: string;
    backgroundColorOddRow?: string;
    borderBottom?: string;
    borderLeft?: string;
    borderRight?: string;
    borderTop?: string;
    color?: string;
    font?: string;
    height?: string;
    hoverColor?: string;
    letterSpacing?: string;
    lineHeight?: string;
    padding?: string;
    selectionColor?: string;
    textAlign?: string;
}

export interface DataTableToolbar {
    delete?: boolean;
    edit?: boolean;
    reset?: boolean;
    save?: boolean;
}

export interface DataTableUserActionResponse {
    data?: object[];
    filterColumn?: string;
    filterText?: string;
    sortColumn?: string;
    sortOrder?: string;
    state?: string;
    visible?: boolean;
}

export interface DataTableVirtualScrolling {
    numberOfRowsPerScroll: number;
}

