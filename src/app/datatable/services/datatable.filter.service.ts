import { Injectable } from '@angular/core';
import { DataTableHeader } from '../datatable.model';

@Injectable()
export class DataTableFilterService {
    constructor() {
    }

    /**
     * This method gets triggered on search of item through globar filter text field
     * @param searchedText { string } Searched text
     * @param dataCollection { object[] } Total number of datatable rows
     * @param header { DataTableHeader[] } Header information provided from invoked component
     * return filteredData { object[] } Filtered data
     */
    public onApplyGlobalSearch = (searchedText: string, dataCollection: object[], header: DataTableHeader[]): object[] => {
        if ((dataCollection && dataCollection.length > 0) && (header && header.length > 0)) {
            let isSearchTextMatched: boolean = false;
            const filteredData: object[] = dataCollection.filter((rowData: object) => {
                header.some((column: DataTableHeader) => {
                    const value: string = rowData[column.propertyName] && rowData[column.propertyName].toString().toLowerCase().trim();
                    if (value && value.indexOf(searchedText) >= 0) {
                        isSearchTextMatched = true;
                        return true;
                    }
                });
                if (isSearchTextMatched) {
                    isSearchTextMatched = false;
                    return rowData;
                }
            });
            return filteredData;
        }
        return dataCollection;
    }

    /**
     * This method gets triggered on search of item through column filter text field
     * @param dataCollection { object[] } Total number of datatable rows
     * @param searchTextFields { object } Column properties
     * return filteredData { object[] } Filtered data
     */
    public onApplyColumnSearch = (dataCollection: object[], searchTextFields: object): object[] => {
        if ((dataCollection && dataCollection.length > 0) && searchTextFields) {
            const filteredData: object[] = dataCollection.filter((rowData: object) => {
                let noOfAppliedSearchColumns: number = 0;
                let noOfMatchedColumns: number = 0;
                for (let key in searchTextFields) {
                    if (searchTextFields.hasOwnProperty(key)) {
                        const value: string = rowData[key] && rowData[key].toString().toLowerCase().trim();
                        if (searchTextFields[key]) {
                            noOfAppliedSearchColumns++;
                            if (value && value.indexOf(searchTextFields[key]) >= 0) {
                                noOfMatchedColumns++;
                            }
                        }
                    }
                }
                if (noOfAppliedSearchColumns === noOfMatchedColumns) {
                    return rowData;
                }
            });
            return filteredData;
        }
        return dataCollection;
    }
}
