import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withStyles, TextField, Button, Modal, Typography, FormControl, InputLabel, Select, MenuItem, Table, TableHead, TableRow, TableBody, TableCell, TableFooter, Checkbox } from '@material-ui/core';
import validator from 'validator';
import { getById, get, put, destroy } from '../api/base';
import LoadingIndicator from './LoadingIndicator';

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
  },
});

// Formularz służący do edycji statusów zamówień oraz ich usuwania.
class AdminOrderForm extends Component {
  constructor(props) {
    super(props);

    this.getTotalOrderPrice = this.getTotalOrderPrice.bind(this);
    this.createDto = this.createDto.bind(this);
    this.validate = this.validate.bind(this);
    this.edit = this.edit.bind(this);
    this.delete = this.delete.bind(this);
    this.changeField = this.changeField.bind(this);
    this.getAction = this.getAction.bind(this);
    this.getClassName = this.getClassName.bind(this);
    this.renderConfirmator = this.renderConfirmator.bind(this);
    this.closeConfirmator = this.closeConfirmator.bind(this);
    this.chooseActionToConfirm = this.chooseActionToConfirm.bind(this);

    this.state = {
      order: { },
      orderLoading: true,

      orderStatuses: [],
      orderStatusesLoading: true,

      confirmatorOpened: false,
      actionToConfirm: null,
      editPath: '/api/orders/edit',
      deletePath: '/api/orders/delete',
      returnPath: '/admin/orders'
    };
  }

  // Oblicza i wyświetlą łączną kwotę zamówienia.
  getTotalOrderPrice() {
    const prices = this.state.order.books.map(x => x.price);
    let total;
    if (prices.length === 0) {
      total = 0;
    } else {
      total = prices.reduce((sum, x) => sum + x);
    }
    return `${this.props.global.resources.admin_orderdetails_total}: ${total.toFixed(2) + ' zł'}`;
  }

  // Pobiera z serwera odpowiednie frazy do wyświetlenia na podstronie oraz dane dotyczące wybranego zamówienia oraz dostępnych statusów zamówień.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('orderdetails', true);

    if (this.props.add) {
      return;
    }

    getById('/api/orders', this.props.id).then(response => {
      switch (true) { 

        case response.status === 200:    
          return response.json().then(data => { 
            this.setState({ order: data, orderLoading: false }) 
          });

        case response.status === 404:    
          this.setState({ orderLoading: false });
          this.props.history.push('/admin/orders');
          break;

        default:
          this.setState({ orderLoading: false });
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
          break;
      }
    });

    get('/api/orders/statuses').then(response => {
      switch (true) { 

        case response.status === 200:    
          return response.json().then(data => { 
            this.setState({ orderStatuses: data, orderStatusesLoading: false });
          });

        default:
          this.setState({ orderStatuses: [], orderStatusesLoading: false });
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
          break;
      }
    });
  }

  // Edytuje status zamówienia.
  edit() {
    const dto = this.createDto();
    this.validate(dto);    

    setTimeout(() => {

      if (this.state.validationError) {
        this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_validation);
        return;
      }

      put(this.state.editPath, this.props.id, dto)
        .then(response => {
          switch(true) {

            case response.status === 204:
              this.props.global.openSnackbar(this.props.global.resources.admin_orderdetails_edited);
              this.props.history.push(this.state.returnPath);
              break;
            
            case response.status === 400:
              this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_400);
              break;

            case response.status === 404:
              this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_404);
              break;

            default:
              this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
              break;
          }
      });
    }, 1000);
  }

  // Usuwa wybrane zamówienie.
  delete() {
    destroy(this.state.deletePath, this.props.id)
      .then(response => {
        switch(true) {

          case response.status === 204:
            this.props.global.openSnackbar(this.props.global.resources.admin_orderdetails_deleted);
            this.props.history.push(this.state.returnPath);
            break;
        
          case response.status === 404:
            this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_404);
            break;

          default:
            this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
            break;
        }
      });
  }


  // Decyduje, czy przycisk do podjęcia konkretnej akcji ma zostać wyświetlony.
  getAction(action) {
    return this.props[action] ? this.props.classes.visible : this.props.classes.invisible;
  }

  // Decyduje, czy komunikat o błędnej formie konkretnego wpisu użytkownika ma zostać wyświetlony.
  getClassName(field) {
    return this.state[`${field}Error`] ? this.props.classes.visible : this.props.classes.invisible;
  }
  
  // Renderuje zawartość okna do potwierdzenia wybranej akcji.
  renderConfirmator() {
    if (!this.state.confirmatorOpened) {
      return false;
    }

    return <React.Fragment>
      <Typography variant={'h6'}>
        {this.state.confirmationQuestion}
      </Typography><br/>
      <Button onClick={() => { this.state.actionToConfirm(); this.closeConfirmator(); }}>{this.props.global.resources.admin_common_yes}</Button>
      <Button onClick={() => this.closeConfirmator()}>{this.props.global.resources.admin_common_no}</Button>
    </React.Fragment>;
  }

  // Zamyka okno do potwierdzenia wybranej akcji.
  closeConfirmator() {
    this.setState({ confirmatorOpened: false });
  }

  // Określa, która akcja ma zostać wykonana na podstawie tego, który przycisk został naciśnięty.
  chooseActionToConfirm(action) {
    switch (action) {
    
      case 'edit':
        this.setState({ confirmatorOpened: true, actionToConfirm: this.edit, confirmationQuestion: this.props.global.resources.admin_orderdetails_editQuestion });
        break;

      case 'delete':
        this.setState({ confirmatorOpened: true, actionToConfirm: this.delete, confirmationQuestion: this.props.global.resources.admin_orderdetails_deleteQuestion });
        break;
      
      default:
        break;
    }
  }

  // Aktualizuje stan komponentu w zakresie danych zamówienia.
  changeField(event) {
    let order = this.state.order;
    order[event.target.name] = event.target.value;
    this.setState({ order: order });
  }

  // Tworzy DTO dotyczący statusu zamówienia.
  createDto() {
    let editStatusDto = { statusId: this.state.order.orderStatusId }
    return editStatusDto;
  }

  // Sprawdza formę danych o statusie zamówienia.
  validate(dto) {
    this.setState({ validationError: false, orderStatusError: false });

    if (!dto.statusId || !validator.isInt(dto.statusId.toString())) {
      this.setState({ validationError: true, orderStatusError: true });
    }
  }

  // Renderuje zawartość podstrony.
  render() {
    if (this.props.add || this.state.orderLoading || this.state.orderStatusesLoading) {
      return <LoadingIndicator/>;
    }
    
    return <React.Fragment>
      <TextField disabled name={'number'} className={this.props.classes.input} type={'text'} value={this.state.order.id} label={this.props.global.resources.admin_orderdetails_id} InputLabelProps={{ shrink: true }}/><br/><br/>
      <TextField disabled name={'date'} className={this.props.classes.input} type={'date'} value={this.state.order.date.substring(0, 10)} label={this.props.global.resources.admin_orderdetails_date} InputLabelProps={{ shrink: true }}/><br/><br/>
      <TextField disabled name={'userEmail'} className={this.props.classes.input} type={'text'} value={this.state.order.userEmail} label={this.props.global.resources.admin_orderdetails_userEmail} InputLabelProps={{ shrink: true }}/><br/><br/>

      <FormControl>
        <InputLabel shrink>{this.props.global.resources.admin_orderdetails_status}</InputLabel>
        <Select className={this.props.classes.input}
          name={'orderStatusId'}
          value={this.state.order.orderStatusId}
          onChange={e => this.changeField(e)}>
          {this.state.orderStatuses.map(x => <MenuItem key={`order-status-${x.id}`} value={x.id}>
              {x.namePl}
            </MenuItem>)}
        </Select>
      </FormControl><br/><br/><br/>

      <FormControl>
        <InputLabel shrink>{this.props.global.resources.admin_orderdetails_books}</InputLabel><br/>
        <Table className={this.props.classes.table}>
        <TableHead>
          <TableRow>
            <TableCell align={'center'}>
              {this.props.global.resources.admin_orderdetails_book_id}
            </TableCell>
            <TableCell align={'center'}>
              {this.props.global.resources.admin_orderdetails_book_title}
            </TableCell>
            <TableCell align={'center'}>
              {this.props.global.resources.admin_orderdetails_book_isElectronic}
            </TableCell>
            <TableCell align={'right'}>
              {this.props.global.resources.admin_orderdetails_book_price}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {this.state.order.books.map(x => <TableRow key={`orderdetails-orderitem-${x.id}`}>
            <TableCell>
            <Link to={`/admin/book/details/${x.id}`}>
                <Typography>{x.id}</Typography>
              </Link>
            </TableCell>
            <TableCell>
              {x.title}
            </TableCell>
            <TableCell align={'center'}>
              <Checkbox disabled checked={x.isElectronic}/>
            </TableCell>
            <TableCell align={'right'}>
              {x.price.toFixed(2) + ' zł'}
            </TableCell>
          </TableRow>)}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell />
            <TableCell />
            <TableCell />
            <TableCell align={'right'}>
              {this.getTotalOrderPrice()}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>      
      </FormControl>




      <Button className={this.getAction('edit')} onClick={() => this.chooseActionToConfirm('edit')}>{this.props.global.resources.admin_orderdetails_edit}</Button>
      <Button className={this.getAction('delete')} onClick={() => this.chooseActionToConfirm('delete')}>{this.props.global.resources.admin_orderdetails_delete}</Button>

      <Modal open={this.state.confirmatorOpened} onClose={() => this.closeConfirmator()}>         
        <div className={this.props.classes.confirmationModalContent}>         
          {this.renderConfirmator()}  
        </div>         
      </Modal>
    </React.Fragment>;
  }
}

export default withStyles(styles)(AdminOrderForm);
