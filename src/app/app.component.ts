import { Component, OnInit } from '@angular/core';
import { AppService } from './app.service';
import { DataTableHeader, DataTableHeaderStyle, DataTableRowStyle, DataTablePipe } from './datatable/datatable.model';
import { DataTablePipeType, DataTableColumnType } from './datatable/datatable.enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  public data: any[];
  private error: string;
  public header: DataTableHeader[];
  public headerStyle: DataTableHeaderStyle;
  public rowStyle: DataTableRowStyle;

  constructor(private appService: AppService) {
    this.data = [];
    this.error = '';
    this.header = [];
    this.headerStyle = {};
    this.rowStyle = {};
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
      {
        propertyName: 'SerialNo',
        title: 'Serial No.',
        type: DataTableColumnType.Integer,
        columnWidth: '150px',
        isFrozen: true
      },
      {
        propertyName: 'ProductName',
        title: 'Product Name',
        type: DataTableColumnType.String,
        columnWidth: '200px',
        pipe: new DataTablePipe(DataTablePipeType.UpperCasePipe),
        isFrozen: true
      },
      {
        propertyName: 'Manufacturer',
        title: 'Manufacturer',
        type: DataTableColumnType.String,
        columnWidth: '400px'
      },
      {
        propertyName: 'Version',
        title: 'Version',
        type: DataTableColumnType.Version,
        columnWidth: '400px'
      },
      {
        propertyName: 'Date',
        title: 'Date',
        type: DataTableColumnType.Date,
        columnWidth: '400px',
        pipe: new DataTablePipe(DataTablePipeType.DatePipe, 'dd-MM-yyyy hh:mm:ss')
      },
      {
        propertyName: 'Price',
        title: 'Price',
        type: DataTableColumnType.String,
        pipe: new DataTablePipe(DataTablePipeType.CurrencyPipe, '1.2-2', 'INR', '₹ '),
        columnWidth: '250px'
      }
    ];
  }

  private setDataTableStyle = (): void => {
    this.headerStyle = {
      backgroundColor: 'pink',
      color: 'brown',
      borderColor: 'red'
    };

    this.rowStyle = {
      backgroundColor: 'pink',
      color: 'brown'
    };
  }
}
