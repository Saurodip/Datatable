import { Injectable } from '@angular/core';

@Injectable()
export class DataTableElementReferenceService {
    constructor() {
    }

    /**
     * This method is responsible for getting reference of the requested HTML element from DOM
     * @param domElement { string } Requested element
     * @param index? { number } Index of the requested element
     * return HTML element reference
     */
    public getHTMLElementRefernce = (domElement: string, index?: number): HTMLElement => {
        switch (domElement) {
            case 'datatable-main-section': return document.querySelector('#datatable-main-section');
            case 'datatable-frozen-area': return document.querySelector('.datatable-frozen-area');
            case 'datatable-scrollable-area': return document.querySelector('.datatable-scrollable-area');
            case 'datatable-scrollable-header-wrapper': return document.querySelector('.datatable-scrollable-area .datatable-header-wrapper');
            case 'datatable-header-container': return document.querySelector('.datatable-header-container');
            case 'datatable-header': return document.querySelector('#datatable-header-' + index);
            case 'datatable-scrollable-filter-wrapper': return document.querySelector('.datatable-scrollable-area .datatable-filter-wrapper');
            case 'datatable-filter-container': return document.querySelector('.datatable-filter-container');
            case 'datatable-select-all-checkbox': return document.querySelector('#datatable-select-all-checkbox');
            case 'checkbox-container': return document.querySelector('.checkbox-container');
            case 'frozen-area-datatable-body': return document.querySelector('.datatable-frozen-area .datatable-body');
            case 'scrollable-area-datatable-body': return document.querySelector('.datatable-scrollable-area .datatable-body');
            case 'datatable-row': return document.querySelector('.datatable-row');
            case 'datatable-tooltip-container': return document.querySelector('#datatable-tooltip-container');
            case 'current-datatable-checkbox': return document.querySelector('#datatable-checkbox-' + index);
            case 'datatable-footer': return document.querySelector('.datatable-footer');
            case 'datatable-export-file-name': return document.querySelector('#datatable-export-file-name');
            case 'previous-pagination-arrow': return document.querySelector('#previous-pagination-arrow');
            case 'pagination-tab': return document.querySelector('.pagination-tab-' + index);
            case 'next-pagination-arrow': return document.querySelector('#next-pagination-arrow');
            case 'datatable-edit-option': return document.querySelector('#datatable-edit-option');
            default: break;
        }
    }

    /**
     * This method is responsible for getting all the matched references of requested HTML element from DOM
     * @param domElement { string } Requested element
     * @param index? { number } Index of the requested element
     * return all matched HTML element references
     */
    public getNodeListReference = (domElement: string, index?: number): NodeList => {
        switch (domElement) {
            case 'current-datatable-row': return document.querySelectorAll('.datatable-row-' + index);
            case 'datatable-header': return document.querySelectorAll('.datatable-header');
            case 'datatable-column-index': return document.querySelectorAll('.datatable-column-' + index);
            case 'datatable-body': return document.querySelectorAll('.datatable-body');
            case 'pagination-tab': return document.querySelectorAll('.pagination-tab');
            default: break;
        }
    }
}
