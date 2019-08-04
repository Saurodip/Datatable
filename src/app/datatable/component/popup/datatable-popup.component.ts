import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DataTablePopupType } from '../../enumerations/datatable.enum';
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

    public dataTablePopupType = DataTablePopupType;

    constructor() {
    }

    /**
     * This method gets triggered on confirmation of user action
     */
    public onProceedWithDataTablePopupAction = (): void => {
        this.data = new DataTablePopup();
        this.getDataTablePopupConfirmationAction.emit();
    }

    /**
     * This method is responsible for closing datatable popup
     */
    public onCloseDataTablePopup = (): void => {
        this.data = new DataTablePopup();
    }
}
