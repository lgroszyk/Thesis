import React, { Component } from 'react';
import { Button } from '@material-ui/core';
import MUIDataTable from "mui-datatables";
import { get } from '../api/base';

class AdminBooksCategoriesList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      categories: [],
    }
  }

  // Pobiera z serwera odpowiednie frazy do wyświetlenia na podstronie oraz dane dotyczące kategorii książek.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('categorieslist', true);

    get('/api/books/categories').then(response => {
      switch (true) { 

        case response.status === 200:    
          return response.json().then(data => { 
            this.setState({ categories: data });
          });

        default:
          this.setState({ categories: [] });
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
          break;
      }
    });
  }

  // Otwiera wybraną przez użytkownika kategorię książek.
  open(data) {
    const id = data[0];
    this.props.history.push(`/admin/category/details/${id}`);
  }

  // Otwiera podstronę z formularzem do dodania nowej kategorii książek.
  add() {
    this.props.history.push(`/admin/category/add`);
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
        name: "namePl",
        label: this.props.global.resources.admin_categorieslist_namePl,
        options: {
          filter: false,
          sort: true,
        }
      },
      {
        name: "nameEn",
        label: this.props.global.resources.admin_categorieslist_nameEn,
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
      <Button onClick={() => this.add()}>{this.props.global.resources.admin_categorieslist_add}</Button><br/>
      <MUIDataTable
        data={this.state.categories}
        columns={columns}
        options={options} />
    </React.Fragment>;
  }
}

export default AdminBooksCategoriesList;
