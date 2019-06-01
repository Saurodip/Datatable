export class DataTable {
    public checkboxSelection?: boolean;
    public columnFilter: boolean;
    public columnResponsive: boolean;
    public filterTextLimit: number;
    public globalFilter: boolean;
    public header: DataTableHeader;
    public headerStyle?: DataTableHeaderStyle;
    public data: Array<object>;
    public height: string;
    public rowStyle?: DataTableRowStyle;

    constructor() {
        this.checkboxSelection = false;
        this.columnFilter = false;
        this.columnResponsive = false;
        this.filterTextLimit = 50;
        this.globalFilter = false;
        this.header = new DataTableHeader();
        this.headerStyle = new DataTableHeaderStyle();
        this.data = [];
        this.height = '';
        this.rowStyle = new DataTableRowStyle();
    }
}

export class DataTableHeader {
    public columnWidth: string;
    public isFixed?: boolean;
    public pipe?: string;
    public propertyName: string;
    public title: string;
    public type: string;

    constructor() {
        this.columnWidth = '0';
        this.isFixed = false;
        this.pipe = '';
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
