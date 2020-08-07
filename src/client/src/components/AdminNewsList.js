import React, { Component } from 'react';
import { Button } from '@material-ui/core';
import MUIDataTable from "mui-datatables";
import { get } from '../api/base';

// Podstrona panelu administracyjnego wyświetlająca listę aktualności o antykwariacie.
class AdminNewsList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      news: [],   
    }
  }

  // Pobiera z serwera odpowiednie frazy do wyświetlenia na podstronie oraz dane dotyczące aktualności.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('newslist', true);

    get('/api/news').then(response => {
      switch (true) { 

        case response.status === 200:    
          return response.json().then(data => { 
            this.setState({ news: data.map(x => ({
              id: x.id,
              title: x.title,
              date: x.date.substring(0,10)
            })) });
          });

        default:
          this.setState({ news: [], newsLoading: false });
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
          break;
      }
    });
  }

  // Otwiera szczegóły wybranej aktualności.
  open(data) {
    const id = data[0];
    this.props.history.push(`/admin/news/details/${id}`);
  }

  // Przekierowuje na stronę do dodania aktualności.
  add() {
    this.props.history.push(`/admin/news/add`);
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
        name: "title",
        label: this.props.global.resources.admin_newslist_title,
        options: {
          filter: false,
          sort: true,
        }
      },
      {
        name: "date",
        label: this.props.global.resources.admin_newslist_date,
        options: {
          filter: false,
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
      filter: false,     
      onRowClick: (rowData) => this.open(rowData)
    }
    return <React.Fragment>
      <Button onClick={() => this.add()}>{this.props.global.resources.admin_newslist_add}</Button><br/>
      <MUIDataTable
        data={this.state.news}
        columns={columns}
        options={options} />
    </React.Fragment>;
  }
}

export default AdminNewsList;
