import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import MUIDataTable from "mui-datatables";
import { get } from '../api/base';

// Podstrona panelu administracyjnego wyświetlająca listę ofert sprzedaży książek do antykwariatu.
class AdminOffersList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      offers: [],
    }
  }

  // Pobiera z serwera odpowiednie frazy do wyświetlenia na podstronie oraz dane dotyczące ofert sprzedaży książek.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('offerslist', true);

    get('/api/offers').then(response => {
      switch (true) { 

        case response.status === 200:    
          return response.json().then(data => { 
            this.setState({ offers: data.map(x => ({
              id: x.id,
              date: x.date.substring(0, 10),
              status: x.offerStatus.namePl,
            })), offersLoading: false });
          });

        default:
          this.setState({ offers: [], offersLoading: false });
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
          break;
      }
    });
  }

  // Otwiera szczegóły wybranegej oferty.
  open(data) {
    const id = data[0];
    this.props.history.push(`/admin/offer/details/${id}`);
  }

  // Renderuje zawartość podstrony.
  render() {
    const columns = [
      {
        name: "id",
        options: {
          display: 'excluded',
          filter: false,
          sort: false,
        }
      },
      {
        name: "date",
        label: this.props.global.resources.admin_offerslist_date,
        options: {
          filter: false,
          sort: true,
        }
      },
      {
        name: "status",
        label: this.props.global.resources.admin_offerslist_status,
        options: {
          filter: true,
          sort: true,
        }
      },
    ];
    const options = {
      textLabels: {
        body: {
          noMatch: this.props.global.resources.admin_common_muidatatable_body_noMatch,
          toolTip: this.props.global.resources.admin_common_muidatatable_body_toolTip,
        },
        pagination: {
          next: this.props.global.resources.admin_common_muidatatable_pagination_next,
          previous: this.props.global.resources.admin_common_muidatatable_pagination_previous,
          rowsPerPage: this.props.global.resources.admin_common_muidatatable_pagination_rowsPerPage,
          displayRows: this.props.global.resources.admin_common_muidatatable_pagination_displayRows,
        },
        toolbar: {
          search: this.props.global.resources.admin_common_muidatatable_toolbar_search,
          viewColumns: this.props.global.resources.admin_common_muidatatable_toolbar_viewColumns,
          filterTable: this.props.global.resources.admin_common_muidatatable_toolbar_filterTable,
        },
        filter: {
          all: this.props.global.resources.admin_common_muidatatable_filter_all,
          title: this.props.global.resources.admin_common_muidatatable_filter_title,
          reset: this.props.global.resources.admin_common_muidatatable_filter_reset,
        },
        viewColumns: {
          title: this.props.global.resources.admin_common_muidatatable_viewColumns_title,
          titleAria: this.props.global.resources.admin_common_muidatatable_viewColumns_titleAria,
        },
      },
      selectableRows: false,
      filterType: 'checkbox',
      responsive: 'scroll',
      download: false,
      print: false,
      onRowClick: (rowData) => this.open(rowData)
    };

    return <React.Fragment>
      <MUIDataTable
        data={this.state.offers}
        columns={columns}
        options={options} />
    </React.Fragment>;
  }
}

export default AdminOffersList;
