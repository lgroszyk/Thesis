import React, { Component } from 'react';
import { Button } from '@material-ui/core';
import MUIDataTable from "mui-datatables";
import { post } from '../api/base';
import LoadingIndicator from './LoadingIndicator';

class AdminBooksList extends Component {
  constructor(props) {
    super(props);

    this.redirect = this.redirect.bind(this);

    this.state = {
      books: [],
    }
  }

  // Pobiera z serwera odpowiednie frazy do wyświetlenia na podstronie oraz dane dotyczące książek.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('bookslist', true);
    
    const filter = { 
      page: 1, 
      booksPerPage: 10000000,      
      releaseMinimumDate: new Date(1000, 0, 2),
      releaseMaximumDate: new Date(2100, 0, 2),
      purchaseMinimumDate: new Date(1000, 0, 2),
      purchaseMaximumDate: new Date(2100, 0, 2)
    };

    post('/api/books/all', filter).then(response => {
      switch (true) { 

        case response.status === 200:    
          return response.json().then(data => { 
            this.setState({ books: data.books.map(x => ({
              id: x.id,
              title: x.title,
              price: x.price.toFixed(2) + ' zł',
              purchaseByStoreDate: x.purchaseByStoreDate.substring(0,10)
            })), booksLoaded: true });
          });

        default:
          this.setState({ books: [], booksLoaded: true });
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
          break;
      }
    });
  }

  // Otwiera książkę wybraną przez użytkownika.
  openBook(data) {
    const id = data[0];
    this.props.history.push(`/admin/book/details/${id}`);
  }

  // Otwiera podstronę z formularzem do dodania nowej książki.
  addBook() {
    this.props.history.push(`/admin/book/add`);
  }

  // Przekierowuje na konkretny adres.
  redirect(url) {
    this.props.history.push(url);
  }
 
  // Renderuje zawartość podstrony (zawierającą odnośniki do podstron z listami języków, kategorii i autorów książek).
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
        label: this.props.global.resources.admin_bookslist_title,
        options: {
          filter: false,
          sort: true,
        }
      },

      {
        name: "price",
        label: this.props.global.resources.admin_bookslist_price,
        options: {
          filter: false,
          sort: false,
        }
      },

      {
        name: "purchaseByStoreDate",
        label: this.props.global.resources.admin_bookslist_purchaseDate,
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
      onRowClick: (rowData) => this.openBook(rowData)
    };
    return this.state.booksLoaded ? <React.Fragment>
      <Button onClick={() => this.redirect('/admin/categories')}>{this.props.global.resources.admin_bookslist_categories}</Button>
      <Button onClick={() => this.redirect('/admin/languages')}>{this.props.global.resources.admin_bookslist_languages}</Button>
      <Button onClick={() => this.redirect('/admin/authors')}>{this.props.global.resources.admin_bookslist_authors}</Button><br/>
      <Button onClick={() => this.addBook()}>{this.props.global.resources.admin_bookslist_addBook}</Button><br/>
      <MUIDataTable 
        data={this.state.books}
        columns={columns}
        options={options} />
    </React.Fragment> : <LoadingIndicator/>
  }
}

export default AdminBooksList;
