import { Component, Input } from '@angular/core';
import { DataTableElementReferenceService } from '../../services/datatable.element-reference.service';
import { DataTableTooltip } from '../../models/datatable.model';

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
            const scrollWidth: number = 17;
            if (event && dataTableMainSection && dataTableTooltipContainer) {
                const tooltipMainContainer = dataTableMainSection && dataTableMainSection.getBoundingClientRect();
                const targetElement: any = event.target;
                const targetElementBoundary = targetElement.getBoundingClientRect();
                if (tooltipMainContainer && targetElementBoundary) {
                    const leftEdge: number = targetElementBoundary.x - tooltipMainContainer.left;
                    const topEdge: number = targetElementBoundary.y - (tooltipMainContainer.top + dataTableTooltipContainer['offsetHeight'] + tooltipArrowHeight);
                    dataTableTooltipContainer['style'].left = leftEdge + 'px';
                    dataTableTooltipContainer['style'].top = topEdge + 'px';
                    const tooltipContainer = dataTableTooltipContainer.getBoundingClientRect();
                    if (tooltipContainer.top >= tooltipMainContainer.top && tooltipContainer.right <= tooltipMainContainer.right) {
                        this.arrowDirection = 'left-down';
                    } else if (tooltipContainer.top >= tooltipMainContainer.top && tooltipContainer.right > tooltipMainContainer.right) {
                        this.arrowDirection = 'right-down';
                        dataTableTooltipContainer['style'].left = leftEdge + scrollWidth - dataTableTooltipContainer['offsetWidth'] + 'px';
                    } else if (tooltipContainer.top < tooltipMainContainer.top && tooltipContainer.right <= tooltipMainContainer.right) {
                        this.arrowDirection = 'left-up';
                        dataTableTooltipContainer['style'].top = topEdge + dataTableTooltipContainer['offsetHeight'] + (tooltipArrowHeight * 2.5) + 'px';
                    } else if (tooltipContainer.top < tooltipMainContainer.top && tooltipContainer.right > tooltipMainContainer.right) {
                        this.arrowDirection = 'right-up';
                        dataTableTooltipContainer['style'].left = leftEdge + scrollWidth - dataTableTooltipContainer['offsetWidth'] + 'px';
                        dataTableTooltipContainer['style'].top = topEdge + dataTableTooltipContainer['offsetHeight'] + (tooltipArrowHeight * 2.5) + 'px';
                    }
                }
            }
        }, 0);
    }
}
