import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DataTableExportType, DataTablePopupType, DataTableToolbarActionType } from '../../enumerations/datatable.enum';
import { DataTableUserActionResponse } from '../../interfaces/datatable.interface';
import { DataTablePopup } from '../../models/datatable.model';

@Component({
    selector: 'app-datatable-popup',
    templateUrl: './datatable-popup.component.html',
    styleUrls: ['./datatable-popup.component.scss']
})
export class DataTablePopupComponent {
    @Input() public data: DataTablePopup;

    @Output() public getDataTablePopupConfirmationAction = new EventEmitter<DataTableUserActionResponse>();

    @ViewChild('exportFileType') private exportFileType: ElementRef;
    @ViewChild('exportFileName') private exportFileName: ElementRef;
    @ViewChild('exportStartDate') private exportStartDate: ElementRef;
    @ViewChild('exportEndDate') private exportEndDate: ElementRef;

    public dataTablePopupType = DataTablePopupType;
    public dataTableToolbarActionType = DataTableToolbarActionType;
    public dataTableExportType = DataTableExportType;

    constructor() {
    }

    /**
     * This method gets triggered on confirmation of user action
     */
    public onProceedWithDataTablePopupAction = (): void => {
        if (this.data && this.data.action === DataTableToolbarActionType.Download) {
            const response: DataTableUserActionResponse = {
                data: [{
                    endDate: this.exportEndDate || '',
                    fileName: this.exportFileName && this.exportFileName.nativeElement && this.exportFileName.nativeElement.value || '',
                    fileType: this.exportFileType && this.exportFileType.nativeElement && this.exportFileType.nativeElement.value || DataTableExportType.Excel,
                    startDate: this.exportStartDate || ''
                }]
            };
            this.getDataTablePopupConfirmationAction.emit(response);
        } else {
            this.getDataTablePopupConfirmationAction.emit();
        }
        this.data = new DataTablePopup();
    }

    /**
     * This method is responsible for closing datatable popup
     */
    public onCloseDataTablePopup = (): void => {
        this.data = new DataTablePopup();
    }
}
