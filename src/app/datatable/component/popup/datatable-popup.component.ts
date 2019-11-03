import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit } from '@angular/core';
import { DataTableExportType, DataTablePopupType, DataTableToolbarActionType } from '../../enumerations/datatable.enum';
import { DataTableUserActionResponse } from '../../interfaces/datatable.interface';
import { DataTablePopup } from '../../models/datatable.model';

@Component({
    selector: 'app-datatable-popup',
    templateUrl: './datatable-popup.component.html',
    styleUrls: ['./datatable-popup.component.scss']
})
export class DataTablePopupComponent implements AfterViewInit {
    @Input() public data: DataTablePopup;

    @Output() public getDataTablePopupConfirmationAction = new EventEmitter<DataTableUserActionResponse>();
    @Output() public getDataTablePopupCloseEvent = new EventEmitter<boolean>();

    @ViewChild('exportFileType') private exportFileType: ElementRef;
    @ViewChild('exportFileName') private exportFileName: ElementRef;
    @ViewChild('exportFileExtension') private exportFileExtension: ElementRef;
    @ViewChild('exportStartDate') private exportStartDate: ElementRef;
    @ViewChild('exportEndDate') private exportEndDate: ElementRef;

    public dataTablePopupType = DataTablePopupType;
    public dataTableToolbarActionType = DataTableToolbarActionType;
    public dataTableExportType = DataTableExportType;
    public validationError: object;

    constructor() {
        this.validationError = { endDate: '', fileName: '', startDate: '' };
    }

    ngAfterViewInit() {
        /* Initializing fields with defaults */
        const currentDate: Date = new Date();
        if (this.exportFileName && this.exportFileName.nativeElement && this.exportFileExtension && this.exportFileExtension.nativeElement) {
            this.exportFileName.nativeElement.value = `DataTable_${currentDate.valueOf()}`;
            this.exportFileExtension.nativeElement.value = `.${DataTableExportType.Excel}`;
        }
        if (this.exportStartDate && this.exportStartDate.nativeElement && this.exportEndDate && this.exportEndDate.nativeElement) {
            this.exportStartDate.nativeElement.value = `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;
            this.exportEndDate.nativeElement.value = this.exportStartDate.nativeElement.value;
        }
    }

    /**
     * This method gets triggered on confirmation of user action
     */
    public onProceedWithDataTablePopupAction = (): void => {
        if (this.data && this.data.action === DataTableToolbarActionType.Download) {
            const fileType: DataTableExportType = this.exportFileType && this.exportFileType.nativeElement && this.exportFileType.nativeElement.value && this.exportFileType.nativeElement.value.trim() || DataTableExportType.Excel;
            const fileName: string = this.exportFileName && this.exportFileName.nativeElement && this.exportFileName.nativeElement.value && this.exportFileName.nativeElement.value.trim() || '';
            const startDate: string = this.exportStartDate && this.exportStartDate.nativeElement && this.exportStartDate.nativeElement.value && this.exportStartDate.nativeElement.value.trim() || '';
            const endDate: string = this.exportEndDate && this.exportEndDate.nativeElement && this.exportEndDate.nativeElement.value && this.exportEndDate.nativeElement.value.trim() || '';
            this.onValidatingFileName(fileName);
            this.onValidatingDateInput([startDate, endDate]);
            if (!this.validationError['fileName'] && !this.validationError['startDate'] && !this.validationError['endDate']) {
                const response: DataTableUserActionResponse = {
                    data: [{
                        endDate: new Date(endDate),
                        fileName: `${fileName}.${fileType}`,
                        fileType: fileType,
                        startDate: new Date(startDate)
                    }]
                };
                this.onCloseDataTablePopup();
                this.getDataTablePopupConfirmationAction.emit(response);
            }
        } else {
            this.onCloseDataTablePopup();
            this.getDataTablePopupConfirmationAction.emit();
        }
    }

    /**
     * This method is responsible for closing datatable popup
     */
    public onCloseDataTablePopup = (): void => {
        this.getDataTablePopupCloseEvent.emit(false);
    }

    /**
     * This method gets triggered on change of export type selection
     * @param type { string } Type of exported file (.xlsx or .pdf)
     */
    public onSelectExportType = (type: string): void => {
        if (type && this.exportFileExtension && this.exportFileExtension.nativeElement) {
            if (type === DataTableExportType.Excel) {
                this.exportFileExtension.nativeElement.value = `.${DataTableExportType.Excel}`;
            } else if (type === DataTableExportType.PDF) {
                this.exportFileExtension.nativeElement.value = `.${DataTableExportType.PDF}`;
            }
        }
    }

    /**
     * This method is responsible for validating exported file name
     * @param exportedFileName { string } Name of the exported file name
     */
    private onValidatingFileName = (exportedFileName: string): void => {
        if (exportedFileName) {
            this.validationError['fileName'] =
                exportedFileName.indexOf('\\') >= 0 ||
                    exportedFileName.indexOf('/') >= 0 ||
                    exportedFileName.indexOf(':') >= 0 ||
                    exportedFileName.indexOf('*') >= 0 ||
                    exportedFileName.indexOf('?') >= 0 ||
                    exportedFileName.indexOf('"') >= 0 ||
                    exportedFileName.indexOf('.') >= 0 ||
                    exportedFileName.indexOf('<') >= 0 ||
                    exportedFileName.indexOf('>') >= 0 ||
                    exportedFileName.indexOf('|') >= 0 ? 'Not allowed: \\ / : * ? " . < > |' :
                    exportedFileName.indexOf(' ') >= 0 ? 'White space not allowed !' : '';
        } else {
            this.validationError['fileName'] = 'Missing file name !';
        }
    }

    /**
     * This method is responsible for validating date range before downloading datatable data
     * @param dateRange { string[] } Collection of start date and end date
     */
    private onValidatingDateInput = (dateRange: string[]): void => {
        if (dateRange && dateRange.length > 0) {
            dateRange.forEach((dateValue: string, index: number) => {
                const type: string = index === 0 ? 'startDate' : 'endDate';
                if (dateValue) {
                    const splittedDate: string[] = dateValue.split('/');
                    if (splittedDate.length === 3) {
                        const month: number = Number(splittedDate[0]);
                        const date: number = Number(splittedDate[1]);
                        const year: number = Number(splittedDate[2]);
                        const calendar: object = {
                            '28': [2],
                            '30': [4, 6, 9, 11],
                            '31': [1, 3, 5, 7, 8, 10, 12]
                        };
                        this.validationError[type] =
                            (!month || month.toString().length > 2 || month > 12) ? 'Invalid month !' :
                                (!date || date.toString().length > 2) ? 'Invalid date !' :
                                    (!year || year.toString().length !== 4 || year > new Date().getFullYear()) ? 'Invalid year !' : '';
                        if (!this.validationError['startDate'] && !this.validationError['endDate']) {
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
                                if ((isLeapYear && date > 29) || (!isLeapYear && date > 28)) {
                                    this.validationError[type] = 'Invalid date !';
                                    return;
                                }
                            } else {
                                if (date > parseInt(matchedMaxDate, 10)) {
                                    this.validationError[type] = 'Invalid date !';
                                    return;
                                }
                            }
                            if (type === 'startDate' && Date.parse(dateRange[0]) > Date.parse(dateRange[1])) {
                                this.validationError[type] = 'Greater than end date !';
                            }
                        }
                    } else {
                        this.validationError[type] = 'Invalid date !';
                    }
                } else {
                    this.validationError[type] = 'Missing date !';
                }
            });
        }
    }
}
