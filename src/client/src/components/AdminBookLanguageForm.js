import React, { Component } from 'react';
import { withStyles, TextField, Button, Modal, Typography, FormControl } from '@material-ui/core';
import validator from 'validator';
import { getById, post, put, destroy } from '../api/base';

const styles = theme => ({
  confirmationModalContent: {
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

// Formularz służący do dodawania, edycji oraz usuwania języków książek.
class AdminLanguageForm extends Component {
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
      language: { },
    };
  }

  // Pobiera z serwera odpowiednie frazy do wyświetlenia na podstronie oraz dane dotyczące języka książek.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('languagedetails', true);

    if (this.props.add) {
      return;
    }

    getById('/api/books/language', this.props.match.params.id).then(response => {
      switch (response.status) { 

        case 200:    
          return response.json().then(data => { 
            this.setState({ language: data, languageLoaded: true });
          });

        default:
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
          this.props.history.push('/admin/languages');
          break;
      }
    });
  }

  // Dodaje język książek.
  add() {    
    this.validate();

    setTimeout(() => {
      if (this.state.validationError) {
        this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_validation);
        return;
      }  

      post('/api/books/language/add', { namePl: this.state.language.namePl, nameEn: this.state.language.nameEn })
        .then(response => {
          switch(response.status) {

            case 204:
              this.props.global.openSnackbar(this.props.global.resources.admin_languagedetails_added);
              this.props.history.push('/admin/languages');
              break;
            
            case 400:
              this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_400);
              this.props.history.push('/admin/languages');
              break;

            default:
              this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
              this.props.history.push('/admin/languages');
              break;
          }
      });
    }, 1000);
  }

  // Edytuje język książek.
  edit() {
    this.validate();

    setTimeout(() => {
      if (this.state.validationError) {
        this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_validation);
        return;
      }  

      put('/api/books/language/edit', this.props.match.params.id, { namePl: this.state.language.namePl, nameEn: this.state.language.nameEn })
        .then(response => {
          switch(response.status) {

            case 204:
              this.props.global.openSnackbar(this.props.global.resources.admin_languagedetails_edited);
              this.props.history.push('/admin/languages');
              break;
            
            case 400:
              this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_400);
              this.props.history.push('/admin/languages');
              break;

            default:
              this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
              this.props.history.push('/admin/languages');
              break;
          }
      });
    }, 1000);
  }

  // Usuwa język książek.
  delete() {
    destroy('/api/books/language/delete', this.props.match.params.id)
      .then(response => {
        switch(response.status) {

          case 204:
            this.props.global.openSnackbar(this.props.global.resources.admin_languagedetails_deleted);
            this.props.history.push('/admin/languages');
            break;
        
          case 404:
            this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_404);
            this.props.history.push('/admin/languages');
            break;

          default:
            this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
            this.props.history.push('/admin/languages');
            break;
        }
      });
  }

  // Otwiera okno do potwierdzenia wybranej akcji.
  openConfirmator(action) {
    switch (action) {
      case 'add':
        this.setState({ confirmatorOpened: true, actionToConfirm: this.add, confirmationQuestion: this.props.global.resources.admin_languagedetails_addQuestion });
        break;

      case 'edit':
        this.setState({ confirmatorOpened: true, actionToConfirm: this.edit, confirmationQuestion: this.props.global.resources.admin_languagedetails_editQuestion });
        break;

      case 'delete':
        this.setState({ confirmatorOpened: true, actionToConfirm: this.delete, confirmationQuestion: this.props.global.resources.admin_languagedetails_deleteQuestion });
        break;
      
      default:
        break;
    }
  }

  // Zamyka okno do potwierdzenia wybranej akcji.
  closeConfirmator() {
    this.setState({ confirmatorOpened: false });
  }

  // Sprawdza formę danych języka książek.
  validate() {
    const namePl = this.state.language.namePl;
    const nameEn = this.state.language.nameEn;
    this.setState({ validationError: false, namePlError: false, nameEnError: false });    
    if (!namePl || !validator.isLength(namePl, { min: 1, max: 64 })) {
      this.setState({ validationError: true, namePlError: true });
    }
    if (!nameEn || !validator.isLength(nameEn, { min: 1, max: 64 })) {
      this.setState({ validationError: true, nameEnError: true });
    }
  }

  // Aktualizuje stan komponentu w zakresie danych o języku.
  changeField (event) {
    let language = this.state.language;
    language[event.target.name] = event.target.value;
    this.setState({ language: language });
  }

  // Renderuje zawartość formularza.
  render() {    
    return this.props.add || this.state.languageLoaded ? <div className={this.props.classes.formContainer}>  
      
      <FormControl>
        <TextField name={'namePl'} value={this.state.language.namePl} type={'text'} label={this.props.global.resources.admin_languagedetails_namePl} className={this.props.classes.input} error={this.state.namePlError} onChange={e => this.changeField(e)} /><br/>
        {this.state.namePlError ? <Typography variant={'caption'} color={'error'}>{this.props.global.resources.admin_languagedetails_namePlError}</Typography> : false}
      </FormControl><br/><br/>

      <FormControl>
        <TextField name={'nameEn'} value={this.state.language.nameEn} type={'text'} label={this.props.global.resources.admin_languagedetails_nameEn} className={this.props.classes.input} error={this.state.nameEnError} onChange={e => this.changeField(e)} /><br/>
        {this.state.nameEnError ? <Typography variant={'caption'} color={'error'}>{this.props.global.resources.admin_languagedetails_nameEnError}</Typography> : false}
      </FormControl><br/><br/>

      {this.props.add ? <React.Fragment><Button onClick={() => this.openConfirmator('add')}>{this.props.global.resources.admin_languagedetails_add}</Button><br/></React.Fragment> : false}
      {this.props.edit ? <React.Fragment><Button onClick={() => this.openConfirmator('edit')}>{this.props.global.resources.admin_languagedetails_edit}</Button><br/></React.Fragment> : false}
      {this.props.delete ? <React.Fragment><Button onClick={() => this.openConfirmator('delete')}>{this.props.global.resources.admin_languagedetails_delete}</Button><br/></React.Fragment> : false}

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

export default withStyles(styles)(AdminLanguageForm);
