import { DataTablePipeType, DataTablePopupType, DataTableToolbarActionType } from '../enumerations/datatable.enum';

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

export class DataTablePopup {
    public action: DataTableToolbarActionType;
    public heading: string;
    public message: string;
    public type: DataTablePopupType;
    public visible: boolean;

    constructor() {
        this.action = DataTableToolbarActionType.None;
        this.heading = '';
        this.message = '';
        this.type = DataTablePopupType.None;
        this.visible = false;
    }
}

export class DataTableTooltip {
    event: MouseEvent;
    content: string;

    constructor() {
        this.content = '';
    }
}
