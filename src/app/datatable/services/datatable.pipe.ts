import { Injectable } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe, LowerCasePipe, UpperCasePipe } from '@angular/common';
import { DataTablePipeType } from '../enumerations/datatable.enum';
import { DataTablePipe } from '../models/datatable.model';

@Injectable()
export class DataTablePipeService {
    constructor(
        private currencyPipe: CurrencyPipe,
        private datePipe: DatePipe,
        private decimalPipe: DecimalPipe,
        private lowerCasePipe: LowerCasePipe,
        private upperCasePipe: UpperCasePipe) {
    }

    /**
     * This method is responsible to apply provided pipe for the specified column
     * @param rowData { object } Current datatable row
     * @param propertyName { string } Name of the column property, on which pipe will be applied
     * @param pipe { DataTablePipe } Detail of the pipe provided from the invoked component
     * return rowData { object } Updated row data after pipe applied
     */
    public onApplyPipe = (rowData: object, propertyName: string, pipe: DataTablePipe): object => {
        switch (pipe && pipe.type) {
            case DataTablePipeType.CurrencyPipe: rowData[propertyName] = this.currencyPipe.transform(rowData[propertyName], pipe.code, pipe.display, pipe.format);
                break;
            case DataTablePipeType.DatePipe: rowData[propertyName] = this.datePipe.transform(rowData[propertyName], pipe.format);
                break;
            case DataTablePipeType.DecimalPipe: rowData[propertyName] = this.decimalPipe.transform(rowData[propertyName], pipe.format);
                break;
            case DataTablePipeType.LowerCasePipe: rowData[propertyName] = this.lowerCasePipe.transform(rowData[propertyName]);
                break;
            case DataTablePipeType.UpperCasePipe: rowData[propertyName] = this.upperCasePipe.transform(rowData[propertyName]);
                break;
            default:
                break;
        }
        return rowData;
    }
}
