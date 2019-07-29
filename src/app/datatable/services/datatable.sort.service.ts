import { Injectable } from '@angular/core';
import { DataTableColumnType, DataTableSortOrder } from '../enumerations/datatable.enum';

@Injectable()
export class DataTableSortService {
    constructor() {
    }

    /**
     * This method is responsible for applying sorting based on type
     * @param dataCollection { object[] } Collection of data that needs to be sorted
     * @param propertyName { string } Name of the property on which sorting will be applied
     * @param type { enumaration } Datatable column type
     * @param sortFields? { object } Records of sorting fields
     * return sortedData { object[] } Data collection after sorting operation
     */
    public onApplySort = (dataCollection: object[], propertyName: string, type: DataTableColumnType, sortFields?: object): object[] => {
        const sortOrder: number = sortFields[propertyName] || DataTableSortOrder.None;
        let sortedData: object[] = [];
        switch (type) {
            case DataTableColumnType.Date:
                sortedData = this.sortByDate(dataCollection, propertyName, sortOrder);
                break;
            case DataTableColumnType.Float:
                sortedData = this.sortByFloat(dataCollection, propertyName, sortOrder);
                break;
            case DataTableColumnType.Integer:
                sortedData = this.sortByInteger(dataCollection, propertyName, sortOrder);
                break;
            case DataTableColumnType.String:
                sortedData = this.sortByString(dataCollection, propertyName, sortOrder);
                break;
            default:
                break;
        }
        return [...sortedData];
    }

    /**
     * This method is responsible for sorting datatable collection based on date
     * @param dataCollection { object[] } Collection of data that needs to be sorted
     * @param propertyName { string } Name of the property on which sorting will be applied
     * @param type { enumaration } Datatable column type
     * return sortedData { object[] } Data collection after sorting operation
     */
    private sortByDate = (dataCollection: object[], propertyName: string, sortOrder: number): object[] => {
        let sortedData: object[] = [];
        if (dataCollection && dataCollection.length > 0) {
            sortedData = dataCollection.sort((prev: object, next: object) => {
                const prevDate: number = Date.parse(prev[propertyName]) ? new Date(prev[propertyName]).getTime() : 0;
                const nextDate: number = Date.parse(next[propertyName]) ? new Date(next[propertyName]).getTime() : 0;
                return (sortOrder === DataTableSortOrder.Ascending) ? (prevDate - nextDate) : (nextDate - prevDate);
            });
        }
        return sortedData;
    }

    /**
     * This method is responsible for sorting datatable collection based on float
     * @param dataCollection { object[] } Collection of data that needs to be sorted
     * @param propertyName { string } Name of the property on which sorting will be applied
     * @param type { enumaration } Datatable column type
     * return sortedData { object[] } Data collection after sorting operation
     */
    private sortByFloat = (dataCollection: object[], propertyName: string, sortOrder: number): object[] => {
        let sortedData: object[] = [];
        if (dataCollection && dataCollection.length > 0) {
            sortedData = dataCollection.sort((prev: object, next: object) => {
                const prevValue: number = parseFloat(prev[propertyName]) || 0;
                const nextValue: number = parseFloat(next[propertyName]) || 0;
                return (sortOrder === DataTableSortOrder.Ascending) ? (prevValue - nextValue) : (nextValue - prevValue);
            });
        }
        return sortedData;
    }

    /**
     * This method is responsible for sorting datatable collection based on integer
     * @param dataCollection { object[] } Collection of data that needs to be sorted
     * @param propertyName { string } Name of the property on which sorting will be applied
     * @param type { enumaration } Datatable column type
     * return sortedData { object[] } Data collection after sorting operation
     */
    private sortByInteger = (dataCollection: object[], propertyName: string, sortOrder: number): object[] => {
        let sortedData: object[] = [];
        if (dataCollection && dataCollection.length > 0) {
            sortedData = dataCollection.sort((prev: object, next: object) => {
                const prevValue: number = Number.isInteger(prev[propertyName]) ? prev[propertyName] : 0;
                const nextValue: number = Number.isInteger(next[propertyName]) ? next[propertyName] : 0;
                return (sortOrder === DataTableSortOrder.Ascending) ? (prevValue - nextValue) : (nextValue - prevValue);
            });
        }
        return sortedData;
    }

    /**
     * This method is responsible for sorting datatable collection based on string
     * @param dataCollection { object[] } Collection of data that needs to be sorted
     * @param propertyName { string } Name of the property on which sorting will be applied
     * @param type { enumaration } Datatable column type
     * return sortedData { object[] } Data collection after sorting operation
     */
    private sortByString = (dataCollection: object[], propertyName: string, sortOrder: number): object[] => {
        let sortedData: object[] = [];
        if (dataCollection && dataCollection.length > 0) {
            sortedData = dataCollection.sort((prev: object, next: object) => {
                const prevValue: string = prev[propertyName] && typeof (prev[propertyName]) === 'string' ? prev[propertyName].toLowerCase() : '';
                const nextValue: string = next[propertyName] && typeof (next[propertyName]) === 'string' ? next[propertyName].toLowerCase() : '';
                if (sortOrder === DataTableSortOrder.Ascending) {
                    if (prevValue === nextValue) {
                        return 0;
                    }
                    return (prevValue > nextValue) ? 1 : -1;
                } else if (sortOrder === DataTableSortOrder.Descending) {
                    if (prevValue === nextValue) {
                        return 0;
                    }
                    return (prevValue < nextValue) ? 1 : -1;
                }
            });
        }
        return sortedData;
    }
}
