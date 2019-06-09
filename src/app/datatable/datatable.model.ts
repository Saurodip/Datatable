export class DataTable {
    public checkboxSelection?: boolean;
    public columnFilter: boolean;
    public columnResponsive: boolean;
    public data: Array<object>;
    public filterTextLimit: number;
    public globalFilter: boolean;
    public header: DataTableHeader;
    public headerStyle?: DataTableHeaderStyle;
    public height: string;
    public rowStyle?: DataTableRowStyle;

    constructor() {
        this.checkboxSelection = false;
        this.columnFilter = false;
        this.columnResponsive = false;
        this.data = [];
        this.filterTextLimit = 50;
        this.globalFilter = false;
        this.header = new DataTableHeader();
        this.headerStyle = new DataTableHeaderStyle();
        this.height = '';
        this.rowStyle = new DataTableRowStyle();
    }
}

export class DataTableHeader {
    public columnWidth: string;
    public isFrozen?: boolean;
    public pipe?: DataTablePipe;
    public propertyName: string;
    public title: string;
    public type: string;

    constructor() {
        this.columnWidth = '0';
        this.isFrozen = false;
        this.pipe = new DataTablePipe(DataTablePipeType.None);
        this.propertyName = '';
        this.title = 'Not Available';
        this.type = 'string';
    }
}

export class DataTableHeaderStyle {
    public backgroundColor?: string;
    public borderColor?: string;
    public color?: string;
    public cursor?: string;
    public font?: string;
    public lineHeight?: string;
    public maxWidth?: string;
    public minWidth?: string;
    public padding?: string;
    public selectionColor?: string;
    public textAlign?: string;

    constructor() {
        this.backgroundColor = '';
        this.borderColor = '';
        this.color = '';
        this.cursor = '';
        this.font = '';
        this.lineHeight = '';
        this.maxWidth = '';
        this.minWidth = '';
        this.padding = '';
        this.selectionColor = '';
        this.textAlign = '';
    }
}

export class DataTableRowStyle {
    public backgroundColor?: string;
    public border?: string;
    public color?: string;
    public cursor?: string;
    public font?: string;
    public height?: string;
    public hoverColor?: string;
    public lineHeight?: string;
    public maxWidth?: string;
    public minWidth?: string;
    public padding?: string;
    public selectionColor?: string;
    public textAlign?: string;

    constructor() {
        this.backgroundColor = '';
        this.border = '';
        this.color = '';
        this.cursor = '';
        this.font = '';
        this.height = '';
        this.hoverColor = '';
        this.lineHeight = '';
        this.maxWidth = '';
        this.minWidth = '';
        this.padding = '';
        this.selectionColor = '';
        this.textAlign = '';
    }
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

export enum DataTablePipeType {
    None,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    LowerCasePipe,
    UpperCasePipe
}
