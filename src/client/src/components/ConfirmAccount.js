import { Component } from 'react';
import { post } from '../api/base';


// Komponent obsługujący potwiedzenie adresu email nowo zarejestrowanego konta użytkownika.
class ConfirmAccount extends Component {
  constructor(props) {
    super(props);
  }

  // Potwierdza adres email użytkownika na podstawie tokenu zawartego w ścieżce podstrony oraz informuje użytkownika o rezultacie potwierdzenia.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('accountconfirmation', false);

    post('/api/user/confirm', { token: this.props.match.params.token })
      .then(response => {
        switch (true) {
          
          case response.status === 204:
            this.props.global.openSnackbar(this.props.global.resources.user_common_accountconfirmation_confirmed);  
            this.props.history.push('/login');
            break;

          case response.status === 400:
            this.props.global.openSnackbar(this.props.global.resources.user_common_errors_400);  
            this.props.history.push('/login');
            break;
        
          case response.status === 404:
            this.props.global.openSnackbar(this.props.global.resources.user_common_accountconfirmation_notfound);  
            this.props.history.push('/');
            break;

          case response.status === 409:
            this.props.global.openSnackbar(this.props.global.resources.user_common_accountconfirmation_expired);  
            this.props.history.push('/');
            break;

          default:
            this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);  
            break;
        }
      })
  }

  // Wskazuje, że komponent ma nie renderować zawartości.
  render() {
    return false;
  }
}

export default ConfirmAccount;
