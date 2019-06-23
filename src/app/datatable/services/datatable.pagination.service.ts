import { Injectable } from '@angular/core';
import { DataTableUIService } from './datatable.ui.service';
import { Pagination } from '../datatable.model';

@Injectable()
export class DataTablePaginationService {
    private paginationData: object[];

    constructor(
        private dataTableUIService: DataTableUIService) {
        this.paginationData = [];
    }

    /**
     * This method is responsible for preparing data structure of pagination tabs
     * @param dataCollection { object[] } Total number of datatable rows
     * @param paginationInfo { Pagination } Pagination information provided through invoked component
     * return paginationData { object } Segregated data into pagination tabs
     */
    public preparePaginationTabs = (dataCollection: object[], paginationInfo: Pagination): object => {
        if ((dataCollection && dataCollection.length > 0) && Object.getOwnPropertyNames(paginationInfo).length !== 0) {
            let paginationTabCollection: object[] = [];
            let counter: number = 0;
            for (let i: number = 0; i < dataCollection.length; i += paginationInfo.numberOfRowsPerTab) {
                let paginationTab: object[] = dataCollection.slice(i, i + paginationInfo.numberOfRowsPerTab);
                paginationTabCollection.push({ 'index': ++counter, 'data': paginationTab });
            }
            counter = 0;
            for (let i: number = 0; i < paginationTabCollection.length; i += paginationInfo.numberOfTabsPerSlot) {
                let paginationTab: object[] = paginationTabCollection.slice(i, i + paginationInfo.numberOfTabsPerSlot);
                this.paginationData.push({ 'slot': ++counter, 'data': paginationTab });
            }
            return this.paginationData;
        }
    }

    /**
     * This method gets triggered on select of pagination tab
     * @param currentPaginationSlot { object } Current pagination slot
     * @param index { number } Selected tab index
     * return dataToDisplay { object[] } Number of rows to be displayed on selection
     */
    public onSelectPaginationTab = (currentPaginationSlot: object, index: number): object[] => {
        const dataToDisplay: object[] = [...currentPaginationSlot['data'][index]['data']];
        return dataToDisplay;
    }

    /**
     * This method gets triggered on change of pagination slot
     * @param slotIndex { number } Pagination slot index
     * return currentPaginationSlot { object } Selected pagination slot data
     */
    public onChangePaginationSlot = (slotIndex: number): object => {
        if (slotIndex <= 0) {
            slotIndex = 0;
        } else if (slotIndex >= this.paginationData.length) {
            slotIndex = this.paginationData.length - 1;
        }
        const currentPaginationSlot: object = this.paginationData[slotIndex];
        return currentPaginationSlot;
    }
}
