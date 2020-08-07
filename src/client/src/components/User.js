import React, { Component } from 'react';
import { withStyles, Typography, TextField, Button, Modal, FormControl, Tabs, Tab } from '@material-ui/core';
import MUIDataTable from 'mui-datatables';
import { get } from '../api/base';
import validator from 'validator';
import ChangePasswordForm from './ChangePasswordForm';
import { getJwt, removeJwt, getUsername } from '../auth/user';

const styles = theme => ({
  confirmationModalContent: {
    minWidth: '300px',
    textAlign: 'center',
    padding: '50px',
    backgroundColor: theme.palette.background.paper,
    position: 'absolute',
    top: `50%`,
    left: `50%`,
    transform: `translate(-50%, -50%)`
  },
  visible: {
    display: 'block'
  },
  invisible: {
    display: 'none'
  },
  input: {
    minWidth: '300px'
  }
});

// Komponent reprezentujący podstronę ukazującą dane o koncie użytkownika, panel do zmiany hasła oraz jego zamówienia, oferty i ebooki.
class User extends Component {
  constructor(props) {
    super(props);

    this.openOrder = this.openOrder.bind(this);
    this.openOffer = this.openOffer.bind(this);
    this.openFile = this.openFile.bind(this);
    this.changeTab = this.changeTab.bind(this);
    this.openConfirmator = this.openConfirmator.bind(this);
    this.closeConfirmator = this.closeConfirmator.bind(this);
    this.deleteAccount = this.deleteAccount.bind(this);


    this.state = {

      tab: 0,

      dto: { },

      orders: [],
      offers: [],

      
    };
  }

  // Pobiera z serwera dane konta oraz listę zamówień, ofert i ebooków użytkownika.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('account', false);

    get('/api/orders/my').then(response => {
      switch (response.status) { 

        case 200:    
          return response.json().then(data => { 
            this.setState({ orders: data.map(x => ({
              id: x.id,
              date: x.date.substring(0,10),
              booksCount: x.booksCount,
              totalPrice: x.totalPrice.toFixed(2) + ' zł'
            })) });
          });

        default:
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);
          break;
      }
    });

    get('/api/offers/my').then(response => {
      switch (response.status) { 

        case 200:    
          return response.json().then(data => { 
            this.setState({ offers: data.map(x => ({
              id: x.id,
              date: x.date.substring(0,10)
            })) });
          });

        default:
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);
          break;
      }
    });

    get('/api/books/my/ebooks').then(response => {
      switch (response.status) { 

        case 200:    
          return response.json().then(data => { 
            this.setState({ files: data });
          });

        default:
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);
          break;
      }
    });

    get('/api/user/my/email').then(response => {
      switch (response.status) { 

        case 200:    
          return response.json().then(data => { 
            this.setState({ email: data.email });
          });

        default:
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);
          break;
      }
    });
  }

  // Otwiera szczegóły wybranego zamówienia.
  openOrder(order) {
    const id = order[0];
    this.props.history.push(`/account/order/details/${id}`);
  }

  // Otwiera szczegóły wybranej oferty.
  openOffer(offer) {
    const id = offer[0];
    this.props.history.push(`/account/offer/details/${id}`);
  }

  // Otwiera szczegóły wybranego pliku.
  openFile(file) {
    const id = file[0];
    this.props.history.push(`/account/file/details/${id}`);
  }

  // Zmienia zakładki z poszczególymi fragmentami podstrony.
  changeTab(tab) {
    this.setState({ tab: tab });
  }

  // Usuwa konto użytkownika.
  deleteAccount() {
    fetch(`/api/user/delete/me`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getJwt()}`
      },
    }).then(response => {
        switch(response.status) {

          case 204:
            this.props.global.openSnackbar(this.props.global.resources.user_account_deleted);
            removeJwt();
            this.props.history.push('/');
            break;
        
          default:
            this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);
            this.props.history.push('/');
            break;
        }
      });
  }
  
  // Otwiera okno do potwierdzenia usunięcia konta użytkownika.
  openConfirmator() {
    this.setState({ confirmatorOpened: true });
  }

  // Zamyka okno do potwierdzenia usunięcia konta użytkownika.
  closeConfirmator() {
    this.setState({ confirmatorOpened: false });
  }

  // Renderuje zawartość komponentu.
  render() {
    const ordersColumns = [
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
        label: this.props.global.resources.user_account_ordersDate,
        options: {
          filter: false,
          sort: true,
        }
      },
      {
        name: "booksCount",
        label: this.props.global.resources.user_account_ordersBooksCount,
        options: {
          filter: false,
          sort: true,
        }
      },
      {
        name: "totalPrice",
        label: this.props.global.resources.user_account_ordersTotalPrice,
        options: {
          filter: false,
          sort: false,
        }
      },
    ];

    const offersColumns = [
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
        label: this.props.global.resources.user_account_offersDate,
        options: {
          filter: false,
          sort: true,
        }
      },
    ];

    const filesColumns = [
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
        label: this.props.global.resources.user_account_filesName,
        options: {
          filter: false,
          sort: true,
        }
      },
    ];

    const ordersOptions = {
      textLabels: {
        body: {
          noMatch: this.props.global.resources.user_common_muidatatable_body_noMatch,
          toolTip: this.props.global.resources.user_common_muidatatable_body_toolTip,
        },
        pagination: {
          next: this.props.global.resources.user_common_muidatatable_pagination_next,
          previous: this.props.global.resources.user_common_muidatatable_pagination_previous,
          rowsPerPage: this.props.global.resources.user_common_muidatatable_pagination_rowsPerPage,
          displayRows: this.props.global.resources.user_common_muidatatable_pagination_displayRows,
        },
        toolbar: {
          search: this.props.global.resources.user_common_muidatatable_toolbar_search,
          viewColumns: this.props.global.resources.user_common_muidatatable_toolbar_viewColumns,
          filterTable: this.props.global.resources.user_common_muidatatable_toolbar_filterTable,
        },
        filter: {
          all: this.props.global.resources.user_common_muidatatable_filter_all,
          title: this.props.global.resources.user_common_muidatatable_filter_title,
          reset: this.props.global.resources.user_common_muidatatable_filter_reset,
        },
        viewColumns: {
          title: this.props.global.resources.user_common_muidatatable_viewColumns_title,
          titleAria: this.props.global.resources.user_common_muidatatable_viewColumns_titleAria,
        },
      },
      responsive: 'scroll',
      filter: false,
      selectableRows: false,
      download: false,
      print: false,
      search: false,
      viewColumns: false,
      onRowClick: (rowData) => this.openOrder(rowData)
    };

    const offersOptions = {
      textLabels: {
        body: {
          noMatch: this.props.global.resources.user_common_muidatatable_body_noMatch,
          toolTip: this.props.global.resources.user_common_muidatatable_body_toolTip,
        },
        pagination: {
          next: this.props.global.resources.user_common_muidatatable_pagination_next,
          previous: this.props.global.resources.user_common_muidatatable_pagination_previous,
          rowsPerPage: this.props.global.resources.user_common_muidatatable_pagination_rowsPerPage,
          displayRows: this.props.global.resources.user_common_muidatatable_pagination_displayRows,
        },
        toolbar: {
          search: this.props.global.resources.user_common_muidatatable_toolbar_search,
          viewColumns: this.props.global.resources.user_common_muidatatable_toolbar_viewColumns,
          filterTable: this.props.global.resources.user_common_muidatatable_toolbar_filterTable,
        },
        filter: {
          all: this.props.global.resources.user_common_muidatatable_filter_all,
          title: this.props.global.resources.user_common_muidatatable_filter_title,
          reset: this.props.global.resources.user_common_muidatatable_filter_reset,
        },
        viewColumns: {
          title: this.props.global.resources.user_common_muidatatable_viewColumns_title,
          titleAria: this.props.global.resources.user_common_muidatatable_viewColumns_titleAria,
        },
      },
      responsive: 'scroll',
      filter: false,
      selectableRows: false,
      download: false,
      print: false,
      search: false,
      viewColumns: false,
      onRowClick: (rowData) => this.openOffer(rowData)
    };

    const filesOptions = {
      textLabels: {
        body: {
          noMatch: this.props.global.resources.user_common_muidatatable_body_noMatch,
          toolTip: this.props.global.resources.user_common_muidatatable_body_toolTip,
        },
        pagination: {
          next: this.props.global.resources.user_common_muidatatable_pagination_next,
          previous: this.props.global.resources.user_common_muidatatable_pagination_previous,
          rowsPerPage: this.props.global.resources.user_common_muidatatable_pagination_rowsPerPage,
          displayRows: this.props.global.resources.user_common_muidatatable_pagination_displayRows,
        },
        toolbar: {
          search: this.props.global.resources.user_common_muidatatable_toolbar_search,
          viewColumns: this.props.global.resources.user_common_muidatatable_toolbar_viewColumns,
          filterTable: this.props.global.resources.user_common_muidatatable_toolbar_filterTable,
        },
        filter: {
          all: this.props.global.resources.user_common_muidatatable_filter_all,
          title: this.props.global.resources.user_common_muidatatable_filter_title,
          reset: this.props.global.resources.user_common_muidatatable_filter_reset,
        },
        viewColumns: {
          title: this.props.global.resources.user_common_muidatatable_viewColumns_title,
          titleAria: this.props.global.resources.user_common_muidatatable_viewColumns_titleAria,
        },
      },
      responsive: 'scroll',
      filter: false,
      selectableRows: false,
      download: false,
      print: false,
      search: false,
      viewColumns: false,
      onRowClick: (rowData) => this.openFile(rowData)
    };

    return <React.Fragment>
      <Tabs value={this.state.tab} variant="scrollable" scrollButtons="on">
        <Tab label={this.props.global.resources.user_account_tabs_account} onClick={() => this.changeTab(0)} />
        <Tab label={this.props.global.resources.user_account_tabs_password} onClick={() => this.changeTab(1)} />
        <Tab label={this.props.global.resources.user_account_tabs_orders} onClick={() => this.changeTab(2)}/>
        <Tab label={this.props.global.resources.user_account_tabs_offers} onClick={() => this.changeTab(3)}/>
        <Tab label={this.props.global.resources.user_account_tabs_files} onClick={() => this.changeTab(4)}/>
      </Tabs><br/><br/>

      {this.state.tab === 0 ? <div>        
        <FormControl>
          <TextField disabled value={this.state.email} label={this.props.global.resources.user_account_userdata_email} InputLabelProps={{ shrink: true }} />
        </FormControl><br/><br/>

        <FormControl>
          <TextField disabled value={getUsername()} label={this.props.global.resources.user_account_userdata_name} InputLabelProps={{ shrink: true }} />
        </FormControl><br/><br/>

        <Button onClick={() => this.openConfirmator()}>{this.props.global.resources.user_account_userdata_delete}</Button><br/><br/>
      </div> : false}

      {this.state.tab === 1 ? <div>
        <ChangePasswordForm changeTab={this.changeTab} global={this.props.global} {...this.props} />
      </div> : false}

      {this.state.tab === 2? <div>
        <Typography variant={'title'}>Historia zamówień:</Typography><br/>
        <MUIDataTable data={this.state.orders} columns={ordersColumns} options={ordersOptions}/>
      </div> : false}

      {this.state.tab === 3 ? <div>
        <Typography variant={'title'}>Historia sprzedaży:</Typography><br/>
        <MUIDataTable data={this.state.offers} columns={offersColumns} options={offersOptions}/>
      </div> : false}

      {this.state.tab === 4 ? <div>
        <Typography variant={'title'}>Pliki:</Typography><br/>
        <MUIDataTable data={this.state.files} columns={filesColumns} options={filesOptions}/>
      </div> : false}

      <Modal open={this.state.confirmatorOpened} onClose={() => this.closeConfirmator()}>         
        <div className={this.props.classes.confirmationModalContent}>         
          <Typography variant={'h6'}>{this.props.global.resources.user_account_question}</Typography><br/>
          <Button onClick={() => { this.deleteAccount(); this.closeConfirmator(); }}>{this.props.global.resources.user_common_yes}</Button>
          <Button onClick={() => this.closeConfirmator()}>{this.props.global.resources.user_common_no}</Button>  
        </div>         
      </Modal>

    </React.Fragment>;
  }
}

export default withStyles(styles)(User);
