import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withStyles, Table, TableHead, TableRow, TableBody, TableCell, Modal, Button, FormControl, FormControlLabel, Checkbox, RadioGroup, Radio, Typography, IconButton, TableFooter } from '@material-ui/core';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import { post } from '../api/base';
import { isLoggedIn } from '../auth/user';

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
  table: {
    maxWidth: '600px',
  },
  visible: {
    display: 'block'
  },
  invisible: {
    display: 'none'
  },
  rulesCheckerWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  }
});

class Cart extends Component {
  constructor(props) {
    super(props);

    this.renderBooks = this.renderBooks.bind(this);
    this.deleteCartItem = this.deleteCartItem.bind(this);
    this.getCartTotalPrice = this.getCartTotalPrice.bind(this);
    this.changePaymentMethod = this.changePaymentMethod.bind(this);
    this.openConfirmator = this.openConfirmator.bind(this);
    this.closeConfirmator = this.closeConfirmator.bind(this);
    this.changeRulesDecision = this.changeRulesDecision.bind(this);
    this.getRulesErrorClass = this.getRulesErrorClass.bind(this);
    this.sendOrder = this.sendOrder.bind(this);
    this.simulateOnlinePayment = this.simulateOnlinePayment.bind(this);

    if (!localStorage.getItem('cart')) {
      localStorage.setItem('cart', JSON.stringify([]));
    }

    this.state = {
      cart: JSON.parse(localStorage.getItem('cart')),
      paymentMethod: 'card',
      rulesAccepted: false,
      confirmatorOpened: false,
      rulesErrorVisible: false
    }
  }

  // Pobiera z serwera odpowiednie frazy do wyświetlenia na podstronie.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('cart', false);
  }

  // Usuwa wybraną książkę z koszyka.
  deleteCartItem(id) {
    let cart = this.state.cart;
    cart = this.removeFromArray(cart, id);
    this.setState({ cart: cart });
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  // Metoda pomocnicza do usunięcia z tablicy wybranej wartości.
  removeFromArray(array, id) {
    let newArray = [];
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
      if (element.id !== id) {
        newArray.push(element);
      }
    }
    return newArray;
  }

  // Oblicza i wyświetla sumę zamówienia.
  getCartTotalPrice() {
    const prices = this.state.cart.map(x => x.price);
    let total;
    if (prices.length === 0) {
      total = 0;
    } else {
      total = prices.reduce((sum, x) => sum + x);
    }
    return `${this.props.global.resources.user_cart_table_totalprice}: ${total.toFixed(2) + ' zł'}`;
  }

  // Renderuje książki, znajdujące się w koszyku.
  renderBooks() {
    return this.state.cart.map(x => <TableRow key={`cart-item-${x.id}`}>
      <TableCell>
        <IconButton onClick={() => this.deleteCartItem(x.id)}>
          <RemoveCircleIcon/>
        </IconButton>
      </TableCell>
      <TableCell>
        {x.title}
      </TableCell>
      <TableCell>
        <Checkbox disabled checked={x.isEbook} />
      </TableCell>
      <TableCell align={'right'}>
        {x.price.toFixed(2) + ' zł'}
      </TableCell>
    </TableRow>);
  }

  // Zmienia metodę płatności, jeśli ta zmiana jest dostępna.
  changePaymentMethod(method) {
    this.setState({ paymentMethod: method });
  }

  // Otwiera okno do potwierdzenia wybranej akcji.
  openConfirmator() {
    this.setState({ confirmatorOpened: true });  
  }

  // Zamyka okno do potwierdzenia wybranej akcji.
  closeConfirmator() {
    this.setState({ confirmatorOpened: false });
  }

  // Zaznacza lub odznacza akceptację regulaminu.
  changeRulesDecision() {
    const previousDecision = this.state.rulesAccepted;
    const newDecision = previousDecision ? false : true;
    this.setState({ rulesAccepted: newDecision });
  }

  // Wyświetla komunikat o konieczności akceptacji regulaminu, jeśli nie został on zaakceptowany.
  getRulesErrorClass() {
    return this.state.rulesErrorVisible ? this.props.classes.visible : this.props.classes.invisible;
  }

  // Symuluje płatność przelewem bankowym.
  simulateOnlinePayment(orderId) {
    this.props.history.push(`/confirm_payment/${orderId}`);
  }

  // Wysyła zamówienie do sklepu.
  sendOrder() {
    if (!this.state.rulesAccepted) {
      this.setState({ rulesErrorVisible: true });
      this.closeConfirmator();
      return;

    }

    const orderData = {
      booksIds: this.state.cart.map(x => x.id)
    };

    setTimeout(() => {

      if (this.state.validationError) {
        this.props.global.openSnackbar(this.props.global.resources.user_common_errors_validation);
        return;
      }

      const apiCallPath = this.state.paymentMethod === 'card' ? '/api/orders/send_online' : '/api/orders/send';

      post(apiCallPath, orderData).then(response => {
        switch (true) {
          
          case response.status === 200:

            return response.json().then(data => {
              localStorage.setItem('cart', JSON.stringify([]));
              if (this.state.paymentMethod === 'cash') {
                this.props.global.openSnackbar(this.props.global.resources.user_cart_sent);  
                this.props.history.push('/');
              } else {
                this.simulateOnlinePayment(data.orderId);
              }
            });

          case response.status === 400:
            this.props.global.openSnackbar(this.props.global.resources.user_common_errors_400);
            break;

          default:
            this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);
            break;
        }
      });

      this.closeConfirmator();
    }, 1000);  
  }

  // Renderuje zawartość komponentu.
  render() {
    if (!isLoggedIn()) {
      return <Typography>
        {this.props.global.resources.user_cart_notLoggedIn}
      </Typography>
    }

    if (this.state.cart.length === 0) {
      return <Typography>
        {this.props.global.resources.user_cart_empty}
      </Typography>
    }

    return <React.Fragment>
      <div style={{ overflowX: 'auto' }}>
      <Table className={this.props.classes.table}>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>
              {this.props.global.resources.user_cart_table_title}
            </TableCell>
            <TableCell>
              {this.props.global.resources.user_cart_table_isEbook}
            </TableCell>
            <TableCell>
              {this.props.global.resources.user_cart_table_price}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {this.renderBooks()}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell />
            <TableCell />
            <TableCell />
            <TableCell align={'right'}>
              {this.getCartTotalPrice()}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table></div>
      
      <Typography>{this.props.global.resources.user_cart_paymentmethod}</Typography>
      <RadioGroup value={this.state.paymentMethod} onChange={event => this.changePaymentMethod(event.target.value)}>
        <FormControlLabel value={'card'} control={<Radio />} label={this.props.global.resources.user_cart_paymentmethod_card} />
        {this.state.cart.find(x => x.isEbook) ? false : <FormControlLabel value={'cash'} control={<Radio />} label={this.props.global.resources.user_cart_paymentmethod_cash} /> }
      </RadioGroup><br/>

      <FormControl className={this.props.classes.rulesCheckerWrapper}>
        <Checkbox color="primary" checked={this.state.rulesAccepted} onChange={() => this.changeRulesDecision()}/>
          <Typography>
            {this.props.global.resources.user_cart_rules_1}<Link to={'/rules'}>{this.props.global.resources.user_cart_rules_2}</Link>
        </Typography>
      </FormControl>      
      {this.state.rulesErrorVisible ? <Typography color={'error'}>{this.props.global.resources.user_cart_rulesnotaccepted}</Typography> : false}<br/><br/>


      <Button onClick={() => this.openConfirmator()}>{this.props.global.resources.user_cart_button_order}</Button>

      <Modal open={this.state.confirmatorOpened} onClose={() => this.closeConfirmator()}>         
        <div className={this.props.classes.confirmationModalContent}>         
          <Typography variant={'h6'}>{this.props.global.resources.user_cart_confirmation_question}</Typography><br/>
          <Button onClick={() => this.sendOrder()}>{this.props.global.resources.user_common_yes}</Button>
          <Button onClick={() => this.closeConfirmator()}>{this.props.global.resources.user_common_no}</Button> 
        </div>         
      </Modal>

    </React.Fragment>;
  }
}

export default withStyles(styles)(Cart);
