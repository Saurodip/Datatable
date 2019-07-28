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

    constructor(
        private dataTableElementReferenceService: DataTableElementReferenceService) {
        this.tooltipContent = '';
        this.arrowDirection = '';
    }

    /**
     * This method is responsible for determining the position of the tooltip and direction of the tooltip arrow
     * @param event { MouseEvent } Mouse hover position
     */
    private onDetermineTooltipPosition = (event: MouseEvent): void => {
        /* Allowing browser to render the tooltip content and arrow direction */
        setTimeout(() => {
            const dataTableMainSection: HTMLElement = this.dataTableElementReferenceService.getHTMLElementRefernce('datatable-main-section');
            const dataTableTooltipContainer: HTMLElement = this.dataTableElementReferenceService.getHTMLElementRefernce('datatable-tooltip-container');
            const tooltipArrowHeight: number = 20;
            if (dataTableMainSection && dataTableTooltipContainer) {
                const tooltipMainContainer = dataTableMainSection && dataTableMainSection.getBoundingClientRect();
                if (tooltipMainContainer) {
                    let left: number = event.clientX - tooltipMainContainer.left;
                    let top: number = event.clientY - (tooltipMainContainer.top + dataTableTooltipContainer['offsetHeight'] + tooltipArrowHeight);
                    dataTableTooltipContainer['style'].left = left + 'px';
                    dataTableTooltipContainer['style'].top = top + 'px';
                    const tooltipContainer = dataTableTooltipContainer.getBoundingClientRect();
                    if (tooltipContainer.top >= tooltipMainContainer.top && tooltipContainer.right <= tooltipMainContainer.right) {
                        this.arrowDirection = 'left-down';
                    } else if (tooltipContainer.top >= tooltipMainContainer.top && tooltipContainer.right > tooltipMainContainer.right) {
                        this.arrowDirection = 'right-down';
                        dataTableTooltipContainer['style'].left = left - dataTableTooltipContainer['offsetWidth'] + 'px';
                    } else if (tooltipContainer.top < tooltipMainContainer.top && tooltipContainer.right <= tooltipMainContainer.right) {
                        this.arrowDirection = 'left-up';
                        dataTableTooltipContainer['style'].top = top + dataTableTooltipContainer['offsetHeight'] + tooltipArrowHeight + 'px';
                    } else if (tooltipContainer.top < tooltipMainContainer.top && tooltipContainer.right > tooltipMainContainer.right) {
                        this.arrowDirection = 'right-up';
                        dataTableTooltipContainer['style'].left = left - dataTableTooltipContainer['offsetWidth'] + 'px';
                        dataTableTooltipContainer['style'].top = top + dataTableTooltipContainer['offsetHeight'] + tooltipArrowHeight + 'px';
                    }
                }
            }
        }, 0);
    }
}
