import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withStyles, TextField, Button, Modal, Typography, FormControl, FormControlLabel, Checkbox } from '@material-ui/core';
import validator from 'validator';
import { getById, post, destroy } from '../api/base';
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
  }
});

// Formularz służący do usuwania użytkowników strony oraz dodawania nowych administratorów.
class AdminUserForm extends Component {
  constructor(props) {
    super(props);

    this.createDto = this.createDto.bind(this);
    this.validate = this.validate.bind(this);
    this.add = this.add.bind(this);
    this.delete = this.delete.bind(this);
    this.changeField = this.changeField.bind(this);
    this.getAction = this.getAction.bind(this);
    this.getClassName = this.getClassName.bind(this);
    this.renderConfirmator = this.renderConfirmator.bind(this);
    this.closeConfirmator = this.closeConfirmator.bind(this);
    this.chooseActionToConfirm = this.chooseActionToConfirm.bind(this);


    this.state = {
      user: { },
      userLoading: true,

      confirmatorOpened: false,
      actionToConfirm: null,
      addPath: '/api/user/register_admin',
      deletePath: '/api/user/delete',
      returnPath: '/admin/users'
    };
  }

  // Pobiera z serwera odpowiednie frazy do wyświetlenia na podstronie oraz dane dotyczące wybranego użytkownika.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('userdetails', true);

    if (!this.props.add) {
      getById('/api/user', this.props.id).then(response => {
        switch (true) { 
  
          case response.status === 200:    
            return response.json().then(data => { 
              this.setState({ user: data, userLoading: false }) 
            });
  
          case response.status === 404:    
            this.setState({ userLoading: false });
            this.props.history.push('/admin/users');
            break;
  
          default:
            this.setState({ userLoading: false });
            this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
            break;
        }
      });
    }
  }

  // Dodaje nowego administratora strony.
  add() {
    const dto = this.createDto();
    this.validate(dto);    

    setTimeout(() => {

      if (this.state.validationError) {
        this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_validation);
        return;
      }

      post(this.state.addPath, dto)
        .then(response => {
          switch(response.status) {

            case 204:
              this.props.global.openSnackbar(this.props.global.resources.admin_userdetails_added);
              this.props.history.push('/admin/users');
              break;
            
            case 400:
              this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_400);
              this.props.history.push('/admin/users');
              break;

            case 409:
              this.props.global.openSnackbar(this.props.global.resources.admin_userdetails_notunique);
              break;

            default:
              this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
              this.props.history.push('/admin/users');
              break;
          }
      });
    }, 1000);
  }

  // Usuwa wybranego użytkownika.
  delete() {
    destroy(this.state.deletePath, this.props.id)
      .then(response => {
        switch(true) {

          case response.status === 204:
            this.props.global.openSnackbar(this.props.global.resources.admin_userdetails_deleted);
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
      case 'add':
        this.setState({ confirmatorOpened: true, actionToConfirm: this.add, confirmationQuestion: this.props.global.resources.admin_userdetails_addQuestion });
        break;
    
      case 'edit':
        this.setState({ confirmatorOpened: true, actionToConfirm: this.edit, confirmationQuestion: this.props.global.resources.admin_userdetails_editQuestion });
        break;

      case 'delete':
        this.setState({ confirmatorOpened: true, actionToConfirm: this.delete, confirmationQuestion: this.props.global.resources.admin_userdetails_deleteQuestion });
        break;
      
      default:
        break;
    }
  }

  // Aktualizuje stan komponentu w zakresie danych użytkownika.
  changeField(event) {
    let user = this.state.user;
    user[event.target.name] = event.target.value;
    this.setState({ user: user });
  }

  // Tworzy DTO dotyczący danych użytkownika.
  createDto() {
    let user = { userName: this.state.user.name, password: this.state.user.password, email: this.state.user.email }
    return user;
  }

  // Sprawdza formę danych użytkownika.
  validate(dto) {
    const user = dto;

    this.setState({ validationError: false, nameError: false, passwordError: false, emailError: false });

    if (!user.userName || !validator.isLength(user.userName, { min: 1, max: 128 })) {
      this.setState({ validationError: true, nameError: true });
    }

    if (!user.password || !validator.isLength(user.password, { min: 8, max: 64 }) || 
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/.exec(user.password)) {
      this.setState({ validationError: true, passwordError: true });
    }

    if (!user.email || !validator.isLength(user.email, { min: 1, max: 64 }) ||!validator.isEmail(user.email)) {
      this.setState({ validationError: true, emailError: true });
    }
  }

  // Renderuje zawartość podstrony.
  render() {
    if (!this.props.add && this.state.userLoading) {
      return <LoadingIndicator/>;
    }
    
    return <React.Fragment>
      <TextField disabled={!this.props.add} name={'email'} className={this.props.classes.input} type={'text'} value={this.state.user.email} label={this.props.global.resources.admin_userdetails_email} error={this.state.emailError} onChange={e => this.changeField(e)} /><br/>
      <Typography className={this.getClassName('email')} variant={'caption'} color={'error'}>{this.props.global.resources.admin_userdetails_emailError}</Typography><br/><br/>

      <TextField disabled={!this.props.add} name={'name'} className={this.props.classes.input} type={'text'} value={this.state.user.name} label={this.props.global.resources.admin_userdetails_name} error={this.state.nameError} onChange={e => this.changeField(e)} /><br/>
      <Typography className={this.getClassName('name')} variant={'caption'} color={'error'}>{this.props.global.resources.admin_userdetails_nameError}</Typography><br/><br/>

      {!this.props.add ? false : <React.Fragment>
        <TextField disabled={!this.props.add} name={'password'} className={this.props.classes.input} type={'password'} value={this.state.user.password} label={this.props.global.resources.admin_userdetails_password} error={this.state.passwordError} onChange={e => this.changeField(e)} /><br/>
        <Typography className={this.getClassName('password')} variant={'caption'} color={'error'}>{this.props.global.resources.admin_userdetails_passwordError}</Typography><br/><br/>
      </React.Fragment>}

      {this.props.add ? false : <React.Fragment>
        <FormControlLabel control={<Checkbox disabled checked={this.state.user.isAdmin} color="primary" />} label={this.props.global.resources.admin_userdetails_isAdmin} /><br/><br/>
      </React.Fragment>}

      {this.props.add ? false : <React.Fragment>
        <FormControl>
          <Typography>{this.props.global.resources.admin_userdetails_ordersNumbers}</Typography>
          <ul>
            {this.state.user.ordersNumbers.map(x => 
              <li key={`admin-userform-order-${x}`}>
                <Link to={`/admin/order/details/${x}`}>
                  <Typography>{x}</Typography>
                </Link>
              </li>)}
          </ul>
        </FormControl><br/><br/>
      </React.Fragment>}

      {this.props.add ? false : <React.Fragment>
        <FormControl>
          <Typography>{this.props.global.resources.admin_userdetails_offerNumbers}</Typography>
          <ul>
            {this.state.user.offersNumbers.map(x => 
              <li key={`admin-userform-offer-${x}`}>
                <Link to={`/admin/offer/details/${x}`}>
                  <Typography>{x}</Typography>
                </Link>
              </li>)}
          </ul>
        </FormControl><br/><br/>
      </React.Fragment>}

      {this.props.add ? false : <React.Fragment>
        <FormControl>
          <Typography>{this.props.global.resources.admin_userdetails_filesNumbers}</Typography>
          <ul>
            {this.state.user.filesNumbers.map(x => 
              <li key={`admin-userform-file-${x}`}>
                <Link to={`/admin/file/details/${x}`}>
                  <Typography>{x}</Typography>
                </Link>
              </li>)}
          </ul>
        </FormControl><br/><br/>
      </React.Fragment>}

      {this.props.add ? <React.Fragment><Button className={this.getAction('add')} onClick={() => this.chooseActionToConfirm('add')}>{this.props.global.resources.admin_userdetails_add}</Button></React.Fragment> : false}
      {this.props.add ? false : <React.Fragment><Button className={this.getAction('delete')} onClick={() => this.chooseActionToConfirm('delete')}>{this.props.global.resources.admin_userdetails_delete}</Button></React.Fragment>}

      <Modal open={this.state.confirmatorOpened} onClose={() => this.closeConfirmator()}>         
        <div className={this.props.classes.confirmationModalContent}>         
          {this.renderConfirmator()}  
        </div>         
      </Modal>
    </React.Fragment>;
  }
}

export default withStyles(styles)(AdminUserForm);
