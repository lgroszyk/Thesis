import React, { Component } from 'react';
import { Button } from '@material-ui/core';
import MUIDataTable from "mui-datatables";
import { get } from '../api/base';

// Podstrona panelu administracyjnego wyświetlająca listę użytkowników strony.
class AdminUsersList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      users: [],
    }
  }

  // Pobiera z serwera odpowiednie frazy do wyświetlenia na podstronie oraz dane dotyczące użytkowników strony.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('userslist', true);

    get('/api/user').then(response => {
      switch (true) { 

        case response.status === 200:    
          return response.json().then(data => { 
            this.setState({ users: data });
          });

        default:
          this.setState({ users: [], usersLoading: false });
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
          break;
      }
    });
  }

  // Otwiera szczegóły wybranego użytkownika.
  open(data) {
    const id = data[0];
    this.props.history.push(`/admin/user/details/${id}`);
  }

  // Przekierowuje na stronę do dodania nowego administratora strony.
  add() {
    this.props.history.push(`/admin/user/add`);
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
        name: "name",
        label: this.props.global.resources.admin_userslist_name,
        options: {
          filter: false,
          sort: true,
        }
      },
      {
        name: "email",
        label: this.props.global.resources.admin_userslist_email,
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
    };
    return <React.Fragment>
      <Button onClick={() => this.add()}>{this.props.global.resources.admin_userslist_add}</Button><br/>
      <MUIDataTable
        data={this.state.users}
        columns={columns}
        options={options} />
    </React.Fragment>;
  }
}

export default AdminUsersList;
