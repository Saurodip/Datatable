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
    public fileNameValidationError: string;
    public dateRangeValidationError: string;

    constructor() {
        this.fileNameValidationError = '';
        this.dateRangeValidationError = '';
    }

    /**
     * This method gets triggered on confirmation of user action
     */
    public onProceedWithDataTablePopupAction = (): void => {
        if (this.data && this.data.action === DataTableToolbarActionType.Download) {
            const fileType: DataTableExportType = this.exportFileType && this.exportFileType.nativeElement && this.exportFileType.nativeElement.value || DataTableExportType.Excel;
            const fileName: string = this.exportFileName && this.exportFileName.nativeElement && this.exportFileName.nativeElement.value || '';
            const startDate: string = this.exportStartDate && this.exportStartDate.nativeElement && this.exportStartDate.nativeElement.value || '';
            const endDate: string = this.exportEndDate && this.exportEndDate.nativeElement && this.exportEndDate.nativeElement.value || '';
            this.onValidatingDateInput(startDate);
            this.onValidatingDateInput(endDate);
            if (!this.fileNameValidationError && !this.dateRangeValidationError) {
                const response: DataTableUserActionResponse = {
                    data: [{
                        endDate: endDate,
                        fileName: fileName,
                        fileType: fileType,
                        startDate: startDate
                    }]
                };
                this.getDataTablePopupConfirmationAction.emit(response);
            }
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

    /**
     * This method is responsible for validating user date input
     * @param dateValue { string } Date value
     */
    private onValidatingDateInput = (dateValue: string): boolean => {
        this.dateRangeValidationError = '';
        if (dateValue) {
            const splittedDate: string[] = dateValue.split('/');
            if (splittedDate.length === 3) {
                const month: number = parseInt(splittedDate[0], 10);
                const date: number = parseInt(splittedDate[1], 10);
                const year: number = parseInt(splittedDate[2], 10);
                const calendar: object = {
                    '28': [2],
                    '30': [4, 6, 9, 11],
                    '31': [1, 3, 5, 7, 8, 10, 12]
                };
                if ((month && month.toString().length <= 2) && (date && date.toString().length <= 2) && (year && year.toString().length === 4)) {
                    let matchedMaxDate: string;
                    for (const maxDate in calendar) {
                        if (calendar.hasOwnProperty(maxDate)) {
                            calendar[maxDate].forEach((monthIndex: number) => {
                                if (monthIndex === month) {
                                    matchedMaxDate = maxDate;
                                }
                            });
                            if (matchedMaxDate) {
                                break;
                            }
                        }
                    }
                    if (matchedMaxDate === '28') {
                        const isLeapYear: boolean = year % 100 === 0 ? year % 400 === 0 : year % 4 === 0;
                        if ((isLeapYear && date <= 29) || (!isLeapYear && date <= 28)) {
                            return true;
                        }
                    } else {
                        if (date <= parseInt(matchedMaxDate, 10)) {
                            return true;
                        }
                    }
                }
            }
        }
        this.dateRangeValidationError = 'Please enter valid date range.';
    }
}
