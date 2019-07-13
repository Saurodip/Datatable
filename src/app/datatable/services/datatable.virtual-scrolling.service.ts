import { Injectable } from '@angular/core';
import { DataTableElementReferenceService } from './datatable.element-reference.service';

@Injectable()
export class DataTableVirtualScrollingService {
    constructor(
        private dataTableElementReferenceService: DataTableElementReferenceService) {
    }

    /**
     * This method is responsible for retrieving new data row on scroll by deleting existing one either from start or end of the dataset based on scrolling
     * @param currentTarget { EventTarget } Event current target
     * @param dataCollection { object[] } Total number of datatable rows
     * @param dataToDisplay { object[] } Number of datatable rows available for display
     * return dataToDisplay { object[] } Updated dataset to display in the datatable
     */
    public onRetrievalOfNewDataTableRow = (currentTarget: EventTarget, dataCollection: object[], dataToDisplay: object[]): object[] => {
        if ((dataCollection && dataCollection.length > 0) && (dataToDisplay && dataToDisplay.length > 0)) {
            if (currentTarget['scrollTop'] === 0) {
                const firstDataTableRowIndex: number = dataCollection.findIndex((rowData: object) => rowData['Index'] === dataToDisplay[0]['Index']);
                const previousDataTableRow: object = firstDataTableRowIndex > 0 ? dataCollection[firstDataTableRowIndex - 1] : dataCollection[firstDataTableRowIndex];
                if (previousDataTableRow) {
                    if (!dataToDisplay.find((rowData: object) => rowData['Index'] === previousDataTableRow['Index'])) {
                        dataToDisplay.unshift(previousDataTableRow);
                        dataToDisplay.pop();
                    }
                }
            } else if (currentTarget['scrollTop'] >= (currentTarget['scrollHeight'] - currentTarget['offsetHeight'])) {
                const lastDataTableRowIndex: number = dataCollection.findIndex((rowData: object) => rowData['Index'] === dataToDisplay[dataToDisplay.length - 1]['Index']);
                const nextDataTableRow: object = lastDataTableRowIndex < dataCollection.length - 1 ? dataCollection[lastDataTableRowIndex + 1] : dataCollection[lastDataTableRowIndex];
                if (nextDataTableRow) {
                    if (!dataToDisplay.find((rowData: object) => rowData['Index'] === nextDataTableRow['Index'])) {
                        dataToDisplay.shift();
                        dataToDisplay.push(nextDataTableRow);
                    }
                }
            }
        }
        return dataToDisplay;
    }
}
