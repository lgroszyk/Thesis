import React, { Component } from 'react';
import { withStyles, FormControl, TextField, Table, TableHead, TableRow, TableCell, TableBody, TableFooter, Typography } from '@material-ui/core';
import { getById } from '../api/base';

const styles = theme => ({
  input: {
    width: '300px'
  }
});

// Komponent reprezentujący podstronę informującą o szczegółach zamówienia.
class OrderDetails extends Component {
  constructor(props) {
    super(props);

    this.getOrderTotalPrice = this.getOrderTotalPrice.bind(this);

    this.state = { };
  }

  // Pobiera z serwera szczegóły konkretnego zamówienia.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('orderdetails', false);

    getById('/api/orders/my', this.props.match.params.id).then(response => {
      switch (response.status) {
        
        case 200:
          return response.json().then(data => this.setState({ order: data, orderLoaded: true }));
        
        case 404:
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_404);
          this.props.history.push('/account');
          break;

        default:
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);
          this.props.history.push('/account');
          break;
      }
    });
  }

  // Oblicza i wyświetlą łączną kwotę zamówienia.
  getOrderTotalPrice() {
    const prices = this.state.order.books.map(x => x.price);
    let total;
    if (prices.length === 0) {
      total = 0;
    } else {
      total = prices.reduce((sum, x) => sum + x);
    }
    return `${this.props.global.resources.user_orderdetails_totalprice}: ${total.toFixed(2) + ' zł'}`;
  }

  // Renderuje zawartość komponentu.
  render() {
    return this.state.orderLoaded ? <React.Fragment>
      <FormControl>
        <TextField disabled className={this.props.classes.input} type={'text'} value={this.state.order.id} label={this.props.global.resources.user_orderdetails_id} /><br/>
      </FormControl><br/><br/>

      <FormControl>
        <TextField disabled className={this.props.classes.input} type={'text'} value={this.state.order.date.substring(0,10)} label={this.props.global.resources.user_orderdetails_date} /><br/>
      </FormControl><br/><br/>

      <FormControl>
        <TextField disabled className={this.props.classes.input} type={'text'} value={this.props.global.currentLanguage === 'en' ? this.state.order.statusEn : this.state.order.status} label={this.props.global.resources.user_orderdetails_status} /><br/>
      </FormControl><br/><br/>

      <FormControl>
        <Typography variant={'caption'}>{this.props.global.resources.user_orderdetails_books}</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                {this.props.global.resources.user_orderdetails_title}
              </TableCell>
              <TableCell>
                {this.props.global.resources.user_orderdetails_price}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.state.order.books.map(x => 
            <TableRow key={`account-order-details-${x.id}`}>
              <TableCell>
                {x.title}
              </TableCell>
              <TableCell align={'right'}>
                {x.price.toFixed(2) + ' zł'}
              </TableCell>
            </TableRow>)}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell/>
              <TableCell align={'right'}>
                <Typography variant={'caption'}>
                  {this.getOrderTotalPrice()}
                </Typography>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </FormControl>

    </React.Fragment> : false;
  }
}

export default withStyles(styles)(OrderDetails);
