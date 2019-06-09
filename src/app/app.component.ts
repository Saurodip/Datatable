import { Component, OnInit } from '@angular/core';
import { AppService } from './app.service';
import { DataTableHeader, DataTableHeaderStyle, DataTableRowStyle, DataTablePipe, DataTablePipeType } from './datatable/datatable.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  public data: Array<any>;
  private error: string;
  public header: Array<DataTableHeader>;
  public headerStyle: DataTableHeaderStyle;
  public rowStyle: DataTableRowStyle;

  constructor(private appService: AppService) {
    this.data = [];
    this.error = '';
    this.header = [];
    this.headerStyle = new DataTableHeaderStyle();
    this.rowStyle = new DataTableRowStyle();
  }

  ngOnInit() {
    this.getDataTableData();
    this.prepareDataTableHeader();
    this.setDataTableStyle();
  }

  private getDataTableData = (): void => {
    this.appService.getRequest('assets/data/datatable.json').subscribe(
      (data) => this.data = data,
      (error) => this.error = error
    );
  }

  private prepareDataTableHeader = (): void => {
    this.header = [
      { propertyName: 'SerialNo', title: 'Serial No.', type: 'integer', columnWidth: '150px', isFrozen: true },
      { propertyName: 'ProductName', title: 'Product Name', type: 'string', columnWidth: '200px', pipe: new DataTablePipe(DataTablePipeType.UpperCasePipe), isFrozen: true },
      { propertyName: 'Manufacturer', title: 'Manufacturer', type: 'string', columnWidth: '200px' },
      { propertyName: 'Version', title: 'Version', type: 'version', columnWidth: '200px' },
      { propertyName: 'Date', title: 'Date', type: 'date', columnWidth: '400px', pipe: new DataTablePipe(DataTablePipeType.DatePipe, 'dd/MM/yyyy') },
      { propertyName: 'Price', title: 'Price', type: 'decimal', pipe: new DataTablePipe(DataTablePipeType.CurrencyPipe, '1.2-2', 'INR', 'Rs. '), columnWidth: '250px' }
    ];
  }

  private setDataTableStyle = (): void => {
    this.headerStyle = {

    };

    this.rowStyle = {

    };
  }
}
