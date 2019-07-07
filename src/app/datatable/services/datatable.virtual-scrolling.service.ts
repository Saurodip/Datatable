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
     * @param firstRowIndex { number } Index of the first datatable row in the current dataset
     * @param lastRowIndex { number } Index of the last datatable row in the current dataset
     * return dataToDisplay { object[] } Updated dataset to display in the datatable
     */
    public onRetrievalOfNewDataTableRow = (currentTarget: EventTarget, dataCollection: object[], dataToDisplay: object[], firstRowIndex: number, lastRowIndex: number): object[] => {
        if (dataCollection && dataCollection.length > 0) {
            if (currentTarget['scrollTop'] === 0) {
                const matchedRowData: object = dataCollection.find((rowData: object) => rowData['Index'] === firstRowIndex - 1);
                if (matchedRowData) {
                    if (!dataToDisplay.find((rowData: object) => rowData['Index'] === matchedRowData['Index'])) {
                        dataToDisplay.unshift(matchedRowData);
                        dataToDisplay.pop();
                    }
                }
            } else if (currentTarget['scrollTop'] >= (currentTarget['scrollHeight'] - currentTarget['offsetHeight'])) {
                const matchedRowData: object = dataCollection.find((rowData: object) => rowData['Index'] === lastRowIndex + 1);
                if (matchedRowData) {
                    if (!dataToDisplay.find((rowData: object) => rowData['Index'] === matchedRowData['Index'])) {
                        dataToDisplay.shift();
                        dataToDisplay.push(matchedRowData);
                    }
                }
            }
        }
        return dataToDisplay;
    }
}
