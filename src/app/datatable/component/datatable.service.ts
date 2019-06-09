import { Injectable } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe, LowerCasePipe, UpperCasePipe } from '@angular/common';
import { DataTableHeader, DataTablePipeType } from '../datatable.model';

@Injectable()
export class DataTableService {
    constructor(
        private currencyPipe: CurrencyPipe,
        private datePipe: DatePipe,
        private decimalPipe: DecimalPipe,
        private lowerCasePipe: LowerCasePipe,
        private upperCasePipe: UpperCasePipe
    ) {
    }

    public onApplyPipe = (data: object[], header: DataTableHeader[]): object[] => {
        if (header && header.length > 0) {
            header.forEach((columnHeader: DataTableHeader) => {
                if (columnHeader.pipe && columnHeader.pipe.type) {
                    if (data && data.length > 0) {
                        data.forEach((rowData: object) => {
                            let propertyName: string = columnHeader.propertyName;
                            switch (columnHeader.pipe.type) {
                                case DataTablePipeType.CurrencyPipe: rowData[propertyName] = this.currencyPipe.transform(rowData[propertyName], columnHeader.pipe.code, columnHeader.pipe.display, columnHeader.pipe.format);
                                    break;
                                case DataTablePipeType.DatePipe: rowData[propertyName] = this.datePipe.transform(rowData[propertyName], columnHeader.pipe.format);
                                    break;
                                case DataTablePipeType.DecimalPipe: rowData[propertyName] = this.decimalPipe.transform(rowData[propertyName], columnHeader.pipe.format);
                                    break;
                                case DataTablePipeType.LowerCasePipe: rowData[propertyName] = this.lowerCasePipe.transform(rowData[propertyName]);
                                    break;
                                case DataTablePipeType.UpperCasePipe: rowData[propertyName] = this.upperCasePipe.transform(rowData[propertyName]);
                                    break;
                                default:
                                    break;
                            }
                        });
                    }
                }
            });
        }
        return data;
    }
}
