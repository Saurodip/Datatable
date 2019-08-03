import { Injectable } from '@angular/core';
import { DataTableSortService } from './datatable.sort.service';
import { DataTableColumnType } from '../enumerations/datatable.enum';
import { DataTableHeader } from '../interfaces/datatable.interface';


@Injectable()
export class DataTableActionsToolbarService {
    private listOfEditedDataTableRows: object[];

    constructor(
        private dataTableSortService: DataTableSortService) {
        this.listOfEditedDataTableRows = [];
    }

    /**
     * This method is responsible for preparing list of edited datatable rows
     * @param event { KeyboardEvent } Keyup event
     * @param dataCollection { object[] } Collection of datatable records
     * @param headerInfo { DataTableHeader[] } Datatable header information
     * @param propertyName { string } Column header of the cell that has been modified
     * @param type { DataTableColumnType } Type of the column of which cell is modified
     * return listOfEditedDataTableRows { object[] } List of edited datatable rows
     */
    public onPrepareListOfDataTableEditedRows = (event: KeyboardEvent, dataCollection: object[], headerInfo: DataTableHeader[], propertyName: string, type: DataTableColumnType): object[] => {
        if ((event && event.target) && (dataCollection && dataCollection.length > 0)) {
            const editedDataTableRowIndex: number = event.target['id'] && parseInt(event.target['id'].match(/\d+/g, ''), 10) || 0;
            if (editedDataTableRowIndex > 0) {
                const matchedRow: object = Object.assign({}, dataCollection[editedDataTableRowIndex - 1]);
                matchedRow[propertyName] = event.target['value'];
                if (this.listOfEditedDataTableRows && this.listOfEditedDataTableRows.length > 0) {
                    const matchedEditedRow: object = this.listOfEditedDataTableRows.find((rowData: object) => rowData['Index'] === matchedRow['Index']);
                    if (matchedEditedRow) {
                        matchedEditedRow[propertyName] = matchedRow[propertyName];
                    } else {
                        this.listOfEditedDataTableRows.push(matchedRow);
                    }
                } else {
                    this.listOfEditedDataTableRows.push(matchedRow);
                }
                this.onDetectionOfActualEditedDataTableRows(dataCollection, headerInfo);
            }
            return this.listOfEditedDataTableRows;
        }
        return this.listOfEditedDataTableRows;
    }

    /**
     * This method is responsible for detecting the actual edited rows whose data is different from the data collection
     * @param dataCollection { object[] } Collection of datatable records
     * @param headerInfo { DataTableHeader[] } Datatable header information
     */
    private onDetectionOfActualEditedDataTableRows = (dataCollection: object[], headerInfo: DataTableHeader[]): void => {
        if ((this.listOfEditedDataTableRows && this.listOfEditedDataTableRows.length > 0) && (dataCollection && dataCollection.length > 0)) {
            this.listOfEditedDataTableRows.forEach((editedRowData: object, index: number) => {
                const matchedRow: object = dataCollection.find((rowData: object) => rowData['Index'] === editedRowData['Index']);
                let isDataTableRowUpdated: boolean = false;
                if (matchedRow) {
                    headerInfo.some((header: DataTableHeader) => {
                        if (editedRowData[header.propertyName].toString() !== matchedRow[header.propertyName].toString()) {
                            isDataTableRowUpdated = true;
                            return true;
                        }
                    });
                    if (!isDataTableRowUpdated) {
                        this.listOfEditedDataTableRows.splice(index, 1);
                    }
                }
            });
            this.listOfEditedDataTableRows = [...this.dataTableSortService.onApplySort(this.listOfEditedDataTableRows, 'Index', DataTableColumnType.Integer)];
        }
    }
}
