import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DataTableUserActionResponse } from '../../interfaces/datatable.interface';

@Component({
    selector: 'app-datatable-popup',
    templateUrl: './datatable-popup.component.html',
    styleUrls: ['./datatable-popup.component.scss']
})
export class DataTablePopupComponent {
    @Input() public visible: boolean;

    @Output() public getDataTablePopupConfirmationAction = new EventEmitter<DataTableUserActionResponse>();
    @Output() public getDataTablePopupCancellationAction = new EventEmitter<DataTableUserActionResponse>();

    constructor() {
    }

    /**
     * This method gets triggered on confirmation of user action
     */
    public onProceedWithDataTablePopupAction = (): void => {
        // this.visible = false;
        const response: DataTableUserActionResponse = {
            visible: false
        };
        this.getDataTablePopupConfirmationAction.emit(response);
    }

    /**
     * This method is responsible for closing datatable popup
     */
    public onCloseDataTablePopup = (): void => {
        // this.visible = false;
        const response: DataTableUserActionResponse = {
            visible: false
        };
        this.getDataTablePopupCancellationAction.emit(response);
    }
}
