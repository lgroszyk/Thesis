import { Component } from 'react';
import { getById } from '../api/base';

// Komponent symulujący płatność przelewem bankowym za zamówienie.
class PaymentConfirmator extends Component {
  constructor(props) {
    super(props);
  }

  // Symuluje dokonanie płatności online oraz informuje użytkownika o rezultacie płatności.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('confirmpayment', false);

    getById(`/api/orders/confirm_payment`, this.props.match.params.id)
      .then(response => {
        switch (true) {
          
          case response.status === 204:
            this.props.global.openSnackbar(this.props.global.resources.user_common_confirmpayment_confirmed);  
            this.props.history.push('/');
            break;

          case response.status === 404:
            this.props.global.openSnackbar(this.props.global.resources.user_common_errors_404);  
            this.props.history.push('/');
            break;

          default:
            this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);  
            break;
        }
      });
  }

  // Wskazuje, że komponent ma nie renderować zawartości.
  render() {
    return false;
  }
}

export default PaymentConfirmator;
