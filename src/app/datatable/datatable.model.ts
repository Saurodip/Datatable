import { DataTableColumnType, DataTablePipeType } from './datatable.enum';

export interface DataTable {
    checkboxSelection?: boolean;
    columnFilter: boolean;
    columnResponsive: boolean;
    data: Array<object>;
    filterTextLimit: number;
    globalFilter: boolean;
    header: DataTableHeader;
    headerStyle?: DataTableHeaderStyle;
    height: string;
    numberOfRowsPerPage: number;
    pagination: boolean;
    rowStyle?: DataTableRowStyle;
}

export interface DataTableHeader {
    propertyName: string;
    title: string;
    type: DataTableColumnType;
    columnWidth: string;
    pipe?: DataTablePipe;
    isFrozen?: boolean;
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
    selectionColor?: string;
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

export class DataTablePipe {
    public type: DataTablePipeType;
    public format?: string;
    public code?: string;
    public display?: boolean | string;

    constructor(type: DataTablePipeType, format?: string, code?: string, display?: boolean | string) {
        this.type = type;
        this.format = format;
        this.code = code;
        this.display = display;
    }
}

