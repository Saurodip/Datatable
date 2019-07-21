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

export class DataTablePagination {
    public numberOfRowsPerTab: number;
    public numberOfTabsPerSlot: number;

    constructor() {
        this.numberOfRowsPerTab = 10;
        this.numberOfTabsPerSlot = 5;
    }
}

export class DataTableVirtualScrolling {
    public numberOfRowsPerScroll: number;
}

export class DataTableTooltip {
    public event: MouseEvent;
    public content: string;
}

