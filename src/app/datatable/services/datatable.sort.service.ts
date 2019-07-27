import { Injectable } from '@angular/core';
import { DataTableColumnType, DataTableSortOrder } from '../datatable.enum';

@Injectable()
export class DataTableSortService {
    constructor() {
    }

    public onApplySort = (dataCollection: object[], sortFields: object, propertyName: string, type: DataTableColumnType): object[] => {
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

    private sortByDate = (dataCollection: object[], propertyName: string, sortOrder: number): object[] => {
        let sortedData: object[] = [];
        if (dataCollection && dataCollection.length > 0) {
            sortedData = dataCollection.sort((prev: object, next: object) => {
                let prevDate: number = Date.parse(prev[propertyName]) ? new Date(prev[propertyName]).getTime() : 0;
                let nextDate: number = Date.parse(next[propertyName]) ? new Date(next[propertyName]).getTime() : 0;
                return (sortOrder === DataTableSortOrder.Ascending) ? (prevDate - nextDate) : (nextDate - prevDate);
            });
        }
        return sortedData;
    }

    private sortByFloat = (dataCollection: object[], propertyName: string, sortOrder: number): object[] => {
        let sortedData: object[] = [];
        if (dataCollection && dataCollection.length > 0) {
            sortedData = dataCollection.sort((prev: object, next: object) => {
                let prevValue: number = parseFloat(prev[propertyName]) || 0;
                let nextValue: number = parseFloat(next[propertyName]) || 0;
                return (sortOrder === DataTableSortOrder.Ascending) ? (prevValue - nextValue) : (nextValue - prevValue);
            });
        }
        return sortedData;
    }

    private sortByInteger = (dataCollection: object[], propertyName: string, sortOrder: number): object[] => {
        let sortedData: object[] = [];
        if (dataCollection && dataCollection.length > 0) {
            sortedData = dataCollection.sort((prev: object, next: object) => {
                let prevValue: number = Number.isInteger(prev[propertyName]) ? prev[propertyName] : 0;
                let nextValue: number = Number.isInteger(next[propertyName]) ? next[propertyName] : 0;
                return (sortOrder === DataTableSortOrder.Ascending) ? (prevValue - nextValue) : (nextValue - prevValue);
            });
        }
        return sortedData;
    }

    private sortByString = (dataCollection: object[], propertyName: string, sortOrder: number): object[] => {
        let sortedData: object[] = [];
        if (dataCollection && dataCollection.length > 0) {
            sortedData = dataCollection.sort((prev: object, next: object) => {
                let prevValue: string = prev[propertyName] && typeof (prev[propertyName]) === 'string' ? prev[propertyName].toLowerCase() : '';
                let nextValue: string = next[propertyName] && typeof (next[propertyName]) === 'string' ? next[propertyName].toLowerCase() : '';
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
