import React, { Component } from 'react';
import { withStyles, TextField, Button, Modal, Typography, FormControl } from '@material-ui/core';
import validator from 'validator';
import { post } from '../api/base';

const styles = theme => ({
  confirmationModalContent: {
    minWidth: '300px',
    textAlign: 'center',
    padding: '30px',
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

// Formularz do zmiany hasła użytkownika
class ChangePasswordForm extends Component {
  constructor(props) {
    super(props);

    this.changePassword = this.changePassword.bind(this);
    this.changePasswordField = this.changePasswordField.bind(this);
    this.validate = this.validate.bind(this);
    this.openConfirmator = this.openConfirmator.bind(this);
    this.closeConfirmator = this.closeConfirmator.bind(this);

    this.state = { passwordDto: {} };
  }

  // Pobiera z serwera odpowiednie frazy do wyświetlenia na podstronie.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('account', false);
  }

  // Zmienia hasło użytkownika.
  changePassword() {    
    this.validate();

    setTimeout(() => {
      if (this.state.validationError) {
        this.props.global.openSnackbar(this.props.global.resources.user_common_errors_validation);
        return;
      }  

      post('/api/user/change_password', { oldPassword: this.state.passwordDto.oldPassword, newPassword: this.state.passwordDto.newPassword, newPasswordConfirmation: this.state.passwordDto.newPasswordConfirmation })
        .then(response => {
          switch(response.status) {

            case 204:
              this.props.global.openSnackbar(this.props.global.resources.user_account_passwordChanged);
              this.props.changeTab(0);
              break;
            
            case 400:
              this.props.global.openSnackbar(this.props.global.resources.user_common_errors_400);
              this.props.changeTab(0);
              break;

            case 404:
              this.props.global.openSnackbar(this.props.global.resources.user_common_errors_404);
              break;

            default:
              this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);
              this.props.changeTab(0);
              break;
          }
      });
    }, 1000);
  }

  // Otwiera okno do potwierdzenia zmiany hasła.
  openConfirmator() {
    this.setState({ confirmatorOpened: true });
  }

  // Zamyka okno do potwierdzenia zmiany hasła.
  closeConfirmator() {
    this.setState({ confirmatorOpened: false });
  }

  // Sprawdza formę nowego hasła oraz czy wpisy w rubrykę z nowym hasłem oraz z potwórzeniem nowego hasła są identyczne.
  validate() {
    const dto = this.state.passwordDto;
    this.setState({ validationError: false, oldPasswordError: false, newPasswordError: false, newPasswordConfirmationError: false });

    if (!dto.oldPassword || !validator.isLength(dto.oldPassword, { min: 1, max: 64 })) {
      this.setState({ validationError: true, oldPasswordError: true });
    }

    if (!dto.newPassword || !validator.isLength(dto.newPassword, { min: 8, max: 64 }) ||
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/.exec(dto.newPassword)) {
      this.setState({ validationError: true, newPasswordError: true })
    }

    if (!dto.newPasswordConfirmation || dto.newPasswordConfirmation !== dto.newPassword) {
      this.setState({ validationError: true, newPasswordConfirmationError: true });
    }
  }

  // Aktualizuje stan komponentu w zakresie nowego lub starego hasła.
  changePasswordField (event) {
    let dto = this.state.passwordDto;
    dto[event.target.name] = event.target.value;
    this.setState({ passwordDto: dto });
  }

  // Renderuje formularz.
  render() {    
    return <div className={this.props.classes.formContainer}>  
      
      <FormControl>
        <TextField name={'oldPassword'} value={this.state.passwordDto.oldPassword} type={'password'} className={this.props.classes.input} error={this.state.oldPasswordError} label={this.props.global.resources.user_account_oldPassword} onChange={e => this.changePasswordField(e)}/><br/>
        {this.state.oldPasswordError ? <Typography color={'error'} variant={'caption'}>{this.props.global.resources.user_account_oldPasswordError}</Typography> : false}
      </FormControl><br/><br/>

      <FormControl>
        <TextField name={'newPassword'} value={this.state.passwordDto.newPassword} type={'password'} className={this.props.classes.input} error={this.state.newPasswordError} label={this.props.global.resources.user_account_newPassword} onChange={e => this.changePasswordField(e)}/><br/>
        {this.state.newPasswordError ? <Typography color={'error'} variant={'caption'}>{this.props.global.resources.user_account_newPasswordError}</Typography> : false}
      </FormControl><br/><br/>

      <FormControl>
        <TextField name={'newPasswordConfirmation'} value={this.state.passwordDto.newPasswordConfirmation} type={'password'} className={this.props.classes.input} error={this.state.newPasswordConfirmationError} label={this.props.global.resources.user_account_newPasswordConfirmation} onChange={e => this.changePasswordField(e)}/><br/>
        {this.state.newPasswordConfirmationError ?  <Typography color={'error'} variant={'caption'}>{this.props.global.resources.user_account_newPasswordConfirmationError}</Typography> : false}
      </FormControl><br/><br/>

      <FormControl>
        <Button onClick={() => this.openConfirmator()}>{this.props.global.resources.user_account_changePasswordButton}</Button>
      </FormControl>

      <Modal open={this.state.confirmatorOpened} onClose={() => this.closeConfirmator()}>         
        <div className={this.props.classes.confirmationModalContent}>         
          <Typography variant={'h6'}>{this.props.global.resources.user_account_changePasswordQuestion}</Typography><br/>
          <Button onClick={() => { this.changePassword(); this.closeConfirmator(); }}>{this.props.global.resources.user_common_yes}</Button>
          <Button onClick={() => this.closeConfirmator()}>{this.props.global.resources.user_common_no}</Button>  
        </div>         
      </Modal>
      
    </div>;
  }
}

export default withStyles(styles)(ChangePasswordForm);
