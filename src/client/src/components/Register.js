import React, { Component } from 'react';
import { withStyles, TextField, Button, Modal, Typography, FormControl } from '@material-ui/core';
import validator from 'validator';
import { post } from '../api/base';

const styles = theme => ({
  confirmationModalContent: {
    padding: '50px',
    backgroundColor: theme.palette.background.paper,
    position: 'absolute',
    top: `50%`,
    left: `50%`,
    transform: `translate(-50%, -50%)`,
    minWidth: '300px',
    textAlign: 'center'
  },
  input: {
    minWidth: '250px',
  },
  formContainer: {
    margin: '20px'
  }
});

// Formularz rejestracji konta użytkownika
class Register extends Component {
  constructor(props) {
    super(props);

    this.register = this.register.bind(this);
    this.changeField = this.changeField.bind(this);
    this.validate = this.validate.bind(this);
    this.openConfirmator = this.openConfirmator.bind(this);
    this.closeConfirmator = this.closeConfirmator.bind(this);

    this.state = { user: {} };
  }

  // Pobiera z serwera odpowiednie frazy do wyświetlenia na podstronie.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('register', false);
  }

  // Zakłada nowe konto użytkownika.
  register() {    
    this.validate();

    setTimeout(() => {
      if (this.state.validationError) {
        this.props.global.openSnackbar(this.props.global.resources.user_common_errors_validation);
        return;
      }  

      post('/api/user/register', { email: this.state.user.email, userName: this.state.user.userName, password: this.state.user.password })
        .then(response => {
          switch(response.status) {

            case 204:
              this.props.global.openSnackbar(this.props.global.resources.user_register_created);
              this.props.history.push('/');
              break;
            
            case 400:
              this.props.global.openSnackbar(this.props.global.resources.user_common_errors_400);
              this.props.history.push('/');
              break;

            case 409:
              this.props.global.openSnackbar(this.props.global.resources.user_register_notunique);
              break;

            default:
              this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);
              this.props.history.push('/');
              break;
          }
      });
    }, 1000);
  }

  // Otwiera okno do potwierdzenia wybranej akcji.
  openConfirmator() {
    this.setState({ confirmatorOpened: true });
  }

  // Zamyka okno do potwierdzenia wybranej akcji.
  closeConfirmator() {
    this.setState({ confirmatorOpened: false });
  }

  // Sprawdza formę nazwy, emaila i hasła wpisanych przez użytkownika.
  validate() {
    const dto = this.state.user;
    this.setState({ validationError: false, passwordError: false, userNameError: false, emailError: false });

    if (!dto.userName || !validator.isLength(dto.userName, { min: 1, max: 16 })) {
      this.setState({ validationError: true, userNameError: true })
    }

    if (!dto.userName || !validator.isLength(dto.userName, { min: 1, max: 64 }) || !validator.isEmail(dto.email)) {
      this.setState({ validationError: true, emailError: true })
    }

    if (!dto.password || !validator.isLength(dto.password, { min: 8, max: 64 }) ||
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/.exec(dto.password)) {
      this.setState({ validationError: true, passwordError: true })
    }
  }

  // Aktualizuje stan komponentu w zakresie danych nowego konta.
  changeField (event) {
    let dto = this.state.user;
    dto[event.target.name] = event.target.value;
    this.setState({ user: dto });
  }

  // Renderuje formularz.
  render() {    
    return <div className={this.props.classes.formContainer}>  

      <FormControl>
        <TextField name={'email'} value={this.state.user.email} type={'text'} className={this.props.classes.input} error={this.state.emailError} label={this.props.global.resources.user_register_email} onChange={e => this.changeField(e)}/><br/>
        {this.state.emailError ? <Typography color={'error'} variant={'caption'}>{this.props.global.resources.user_register_emailError}</Typography> : false}
      </FormControl><br/><br/>

      <FormControl>
        <TextField name={'userName'} value={this.state.user.userName} type={'text'} className={this.props.classes.input} error={this.state.userNameError} label={this.props.global.resources.user_register_userName} onChange={e => this.changeField(e)}/><br/>
        {this.state.userNameError ? <Typography color={'error'} variant={'caption'}>{this.props.global.resources.user_register_userNameError}</Typography> : false}
      </FormControl><br/><br/>

      <FormControl>
        <TextField name={'password'} value={this.state.user.password} type={'password'} className={this.props.classes.input} error={this.state.passwordError} label={this.props.global.resources.user_register_password} onChange={e => this.changeField(e)}/><br/>
        {this.state.passwordError ? <Typography color={'error'} variant={'caption'}>{this.props.global.resources.user_register_passwordError}</Typography> : false}
      </FormControl><br/><br/>

      <FormControl>
        <Button onClick={() => this.openConfirmator()}>{this.props.global.resources.user_register_registerButton}</Button>
      </FormControl>

      <Modal open={this.state.confirmatorOpened} onClose={() => this.closeConfirmator()}>         
        <div className={this.props.classes.confirmationModalContent}>         
          <Typography variant={'h6'}>{this.props.global.resources.user_register_question}</Typography><br/>
          <Button onClick={() => { this.register(); this.closeConfirmator(); }}>{this.props.global.resources.user_common_yes}</Button>
          <Button onClick={() => this.closeConfirmator()}>{this.props.global.resources.user_common_no}</Button>  
        </div>         
      </Modal>
      
    </div>;
  }
}

export default withStyles(styles)(Register);
