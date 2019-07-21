import { Component, OnInit, Input } from '@angular/core';
import { DataTableElementReferenceService } from '../../services/datatable.element-reference.service';
import { DataTableTooltip } from '../../datatable.model';

@Component({
    selector: 'app-datatable-tooltip',
    templateUrl: './datatable-tooltip.component.html',
    styleUrls: ['./datatable-tooltip.component.scss']
})
export class DataTableTooltipComponent {
    public tooltipContent: string;
    public arrowDirection: string;

    @Input() set tooltipInfo(info: DataTableTooltip) {
        if (info) {
            this.tooltipContent = info.content;
            this.onDetermineTooltipPosition(info.event);
        }
    }
    @Input() set direction(value: string) {
        if (value) {
            this.arrowDirection = value;
        }
    }

    constructor(
        private dataTableElementReferenceService: DataTableElementReferenceService) {
        this.tooltipContent = '';
        this.arrowDirection = '';
    }

    private onDetermineTooltipPosition = (event: MouseEvent): void => {
        setTimeout(() => {
            const dataTableMainSection: HTMLElement = this.dataTableElementReferenceService.getHTMLElementRefernce('datatable-main-section');
            const dataTableTooltipContainer: HTMLElement = this.dataTableElementReferenceService.getHTMLElementRefernce('datatable-tooltip-container');
            dataTableTooltipContainer['style'].left = event.clientX - (dataTableTooltipContainer['offsetWidth'] / 2) + 'px';
            dataTableTooltipContainer['style'].top = event.clientY - (dataTableTooltipContainer['offsetHeight'] + 20) + 'px';
            const parent = dataTableMainSection && dataTableMainSection.getBoundingClientRect();
            const child = dataTableTooltipContainer.getBoundingClientRect();
        }, 0);
    }
}

