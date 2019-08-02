import { Injectable } from '@angular/core';
import { DataTableColumnType } from '../enumerations/datatable.enum';

@Injectable()
export class DataTableActionsToolbarService {
    private listOfEditedDataTableRows: object[];

    constructor() {
        this.listOfEditedDataTableRows = [];
    }

    /**
     * This method is responsible for preparing list of edited datatable rows
     * @param event { KeyboardEvent } Keyup event
     * @param dataCollection { object[] } Collection of datatable records
     * @param propertyName { string } Column header of the cell that has been modified
     * @param type { DataTableColumnType } Type of the column of which cell is modified
     * return listOfEditedDataTableRows { object[] } List of edited datatable rows
     */
    public onPrepareListOfDataTableEditedRows = (event: KeyboardEvent, dataCollection: object[], propertyName: string, type: DataTableColumnType): object[] => {
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
            }
            return this.listOfEditedDataTableRows;
        }
        return this.listOfEditedDataTableRows;
    }
}