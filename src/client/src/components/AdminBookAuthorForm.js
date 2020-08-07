import React, { Component } from 'react';
import { withStyles, TextField, Button, Modal, Typography, FormControl } from '@material-ui/core';
import validator from 'validator';
import { getById, post, put, destroy } from '../api/base';

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
  },
  input: {
    minWidth: '250px',
  },
  formContainer: {
    margin: '20px'
  }
});

// Formularz służący do dodawania, edycji i usuwania autorów książek.
class AdminAuthorForm extends Component {
  constructor(props) {
    super(props);

    this.add = this.add.bind(this);
    this.edit = this.edit.bind(this);
    this.delete = this.delete.bind(this);
    this.changeField = this.changeField.bind(this);
    this.validate = this.validate.bind(this);
    this.openConfirmator = this.openConfirmator.bind(this);
    this.closeConfirmator = this.closeConfirmator.bind(this);

    this.state = {
      author: { },
    };
  }

  // Pobiera z serwera dane o autorze.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('authordetails', true);

    if (this.props.add) {
      return;
    }

    getById('/api/books/author', this.props.match.params.id).then(response => {
      switch (response.status) { 

        case 200:    
          return response.json().then(data => { 
            this.setState({ author: data, authorLoaded: true });
          });

        default:
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
          this.props.history.push('/admin/authors');
          break;
      }
    });
  }

  // Dodaje autora książek.
  add() {    
    this.validate();

    setTimeout(() => {
      if (this.state.validationError) {
        this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_validation);
        return; 
      }  

      const dto = { firstName: this.state.author.firstName, lastName: this.state.author.lastName };
      if (this.state.author.nickName) {
        dto.nickName = this.state.author.nickName;
      }
      post('/api/books/author/add', dto)
        .then(response => {
          switch(response.status) {

            case 204:
              this.props.global.openSnackbar(this.props.global.resources.admin_authordetails_added);
              this.props.history.push('/admin/authors');
              break;
            
            case 400:
              this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_400);
              this.props.history.push('/admin/authors');
              break;

            default:
              this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
              this.props.history.push('/admin/authors');
              break;
          }
      });
    }, 1000);
  }

  // Edytuje autora książek.
  edit() {
    this.validate();

    setTimeout(() => {
      if (this.state.validationError) {
        this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_validation);
        return;
      }  

      const dto = { firstName: this.state.author.firstName, lastName: this.state.author.lastName };
      if (this.state.author.nickName) {
        dto.nickName = this.state.author.nickName;
      }
      put('/api/books/author/edit', this.props.match.params.id, dto)
        .then(response => {
          switch(response.status) {

            case 204:
              this.props.global.openSnackbar(this.props.global.resources.admin_authordetails_edited);
              this.props.history.push('/admin/authors');
              break;
            
            case 400:
              this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_400);
              this.props.history.push('/admin/authors');
              break;

            default:
              this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
              this.props.history.push('/admin/authors');
              break;
          }
      });
    }, 1000);
  }

  // Usuwa autora książek.
  delete() {
    destroy('/api/books/author/delete', this.props.match.params.id)
      .then(response => {
        switch(response.status) {

          case 204:
            this.props.global.openSnackbar(this.props.global.resources.admin_authordetails_deleted);
            this.props.history.push('/admin/authors');
            break;
        
          case 404:
            this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_404);
            this.props.history.push('/admin/authors');
            break;

          default:
            this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
            this.props.history.push('/admin/authors');
            break;
        }
      });
  }

  // Otwiera okno do potwierdzenia wybranej akcji.
  openConfirmator(action) {
    switch (action) {
      case 'add':
        this.setState({ confirmatorOpened: true, actionToConfirm: this.add, confirmationQuestion: this.props.global.resources.admin_authordetails_addQuestion });
        break;

      case 'edit':
        this.setState({ confirmatorOpened: true, actionToConfirm: this.edit, confirmationQuestion: this.props.global.resources.admin_authordetails_editQuestion });
        break;

      case 'delete':
        this.setState({ confirmatorOpened: true, actionToConfirm: this.delete, confirmationQuestion: this.props.global.resources.admin_authordetails_deleteQuestion });
        break;
      
      default:
        break;
    }
  }

  // Zamyka okno do potwierdzenia wybranej akcji.
  closeConfirmator() {
    this.setState({ confirmatorOpened: false });
  }

  // Sprawdza formę danych o autorze.
  validate() {
    const firstName = this.state.author.firstName;
    const lastName = this.state.author.lastName;
    const nickName = this.state.author.nickName;

    this.setState({ validationError: false, firstNameError: false, lastNameError: false, nickNameError: false });   

    if (!firstName || !validator.isLength(firstName, { min: 1, max: 32 })) {
      this.setState({ validationError: true, firstNameError: true });
    }
    if (!lastName || !validator.isLength(lastName, { min: 1, max: 64 })) {
      this.setState({ validationError: true, lastNameError: true });
    }
    if (nickName && !validator.isLength(nickName, { min: 1, max: 32 })) {
      this.setState({ validationError: true, nickNameError: true });
    }
  }

  // Aktualizuje stan komponentu w zakresie danych o autorze.
  changeField (event) {
    let author = this.state.author;
    author[event.target.name] = event.target.value;
    this.setState({ author: author });
  }

  // Zwraca zawartość formularza.
  render() {    
    return this.props.add || this.state.authorLoaded ? <div className={this.props.classes.formContainer}>  
      
      <FormControl>
        <TextField name={'firstName'} value={this.state.author.firstName} type={'text'} label={this.props.global.resources.admin_authordetails_firstName} className={this.props.classes.input} error={this.state.firstNameError} onChange={e => this.changeField(e)} /><br/>
        {this.state.firstNameError ? <Typography variant={'caption'} color={'error'}>{this.props.global.resources.admin_authordetails_firstNameError}</Typography> : false}
      </FormControl><br/><br/>

      <FormControl>
        <TextField name={'lastName'} value={this.state.author.lastName} type={'text'} label={this.props.global.resources.admin_authordetails_lastName} className={this.props.classes.input} error={this.state.lastNameError} onChange={e => this.changeField(e)} /><br/>
        {this.state.lastNameError ? <Typography variant={'caption'} color={'error'}>{this.props.global.resources.admin_authordetails_lastNameError}</Typography> : false}
      </FormControl><br/><br/>

      <FormControl>
        <TextField name={'nickName'} value={this.state.author.nickName} type={'text'} label={this.props.global.resources.admin_authordetails_nickName} className={this.props.classes.input} error={this.state.nickNameError} onChange={e => this.changeField(e)} /><br/>
        {this.state.nickNameError ? <Typography variant={'caption'} color={'error'}>{this.props.global.resources.admin_authordetails_nickNameError}</Typography> : false}
      </FormControl><br/><br/>

      {this.props.add ? <React.Fragment><Button onClick={() => this.openConfirmator('add')}>{this.props.global.resources.admin_authordetails_add}</Button><br/></React.Fragment> : false}
      {this.props.edit ? <React.Fragment><Button onClick={() => this.openConfirmator('edit')}>{this.props.global.resources.admin_authordetails_edit}</Button><br/></React.Fragment> : false}
      {this.props.delete ? <React.Fragment><Button onClick={() => this.openConfirmator('delete')}>{this.props.global.resources.admin_authordetails_delete}</Button><br/></React.Fragment> : false}

      <Modal open={this.state.confirmatorOpened} onClose={() => this.closeConfirmator()}>         
        <div className={this.props.classes.confirmationModalContent}>         
          <Typography variant={'h6'}>{this.state.confirmationQuestion}</Typography><br/>
          <Button onClick={() => { this.state.actionToConfirm(); this.closeConfirmator(); }}>{this.props.global.resources.admin_common_yes}</Button>
          <Button onClick={() => this.closeConfirmator()}>{this.props.global.resources.admin_common_no}</Button>  
        </div>         
      </Modal>
      
    </div> : false;
  }
}

export default withStyles(styles)(AdminAuthorForm);
