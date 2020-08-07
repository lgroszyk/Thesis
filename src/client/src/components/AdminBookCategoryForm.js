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

// Formularz służący do dodawania, edycji i usuwania kategorii książek.
class AdminCategoryForm extends Component {
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
      category: { },
    };
  }

  // Pobiera z serwera dane o kategorii.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('categorydetails', true);

    if (this.props.add) {
      return;
    }

    getById('/api/books/category', this.props.match.params.id).then(response => {
      switch (response.status) { 

        case 200:    
          return response.json().then(data => { 
            this.setState({ category: data, categoryLoaded: true });
          });

        default:
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
          this.props.history.push('/admin/categories');
          break;
      }
    });
  }

  // Dodaje kategorię książek.
  add() {    
    this.validate();

    setTimeout(() => {
      if (this.state.validationError) {
        this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_validation);
        return;
      }  

      post('/api/books/category/add', { namePl: this.state.category.namePl, nameEn: this.state.category.nameEn })
        .then(response => {
          switch(response.status) {

            case 204:
              this.props.global.openSnackbar(this.props.global.resources.admin_categorydetails_added);
              this.props.history.push('/admin/categories');
              break;
            
            case 400:
              this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_404);
              this.props.history.push('/admin/categories');
              break;

            default:
              this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
              this.props.history.push('/admin/categories');
              break;
          }
      });
    }, 1000);
  }

  // Edytuje kategorię książek.
  edit() {
    this.validate();

    setTimeout(() => {
      if (this.state.validationError) {
        this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_validation);
        return;
      }  

      put('/api/books/category/edit', this.props.match.params.id, { namePl: this.state.category.namePl, nameEn: this.state.category.nameEn })
        .then(response => {
          switch(response.status) {

            case 204:
              this.props.global.openSnackbar(this.props.global.resources.admin_categorydetails_edited);
              this.props.history.push('/admin/categories');
              break;
            
            case 400:
              this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_300);
              this.props.history.push('/admin/categories');
              break;

            default:
              this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
              this.props.history.push('/admin/categories');
              break;
          }
      });
    }, 1000);
  }

  // Usuwa kategorię książek.
  delete() {
    destroy('/api/books/category/delete', this.props.match.params.id)
      .then(response => {
        switch(response.status) {

          case 204:
            this.props.global.openSnackbar(this.props.global.resources.admin_categorydetails_deleted);
            this.props.history.push('/admin/categories');
            break;
        
          case 404:
            this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_404);
            this.props.history.push('/admin/categories');
            break;

          default:
            this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
            this.props.history.push('/admin/categories');
            break;
        }
      });
  }

  // Otwiera okno do potwierdzenia wybranej akcji.
  openConfirmator(action) {
    switch (action) {
      case 'add':
        this.setState({ confirmatorOpened: true, actionToConfirm: this.add, confirmationQuestion: this.props.global.resources.admin_categorydetails_addQuestion });
        break;

      case 'edit':
        this.setState({ confirmatorOpened: true, actionToConfirm: this.edit, confirmationQuestion: this.props.global.resources.admin_categorydetails_editQuestion });
        break;

      case 'delete':
        this.setState({ confirmatorOpened: true, actionToConfirm: this.delete, confirmationQuestion: this.props.global.resources.admin_categorydetails_deleteQuestion });
        break;
      
      default:
        break;
    }
  }

  // Zamyka okno do potwierdzenia wybranej akcji.
  closeConfirmator() {
    this.setState({ confirmatorOpened: false });
  }

  // Sprawdza formę danych o kategorii książek.
  validate() {
    const namePl = this.state.category.namePl;
    const nameEn = this.state.category.nameEn;
    this.setState({ validationError: false, namePlError: false, nameEnError: false });    
    if (!namePl || !validator.isLength(namePl, { min: 1, max: 64 })) {
      this.setState({ validationError: true, namePlError: true });
    }
    if (!nameEn || !validator.isLength(nameEn, { min: 1, max: 64 })) {
      this.setState({ validationError: true, nameEnError: true });
    }
  }

  // Aktualizuje stan komponentu w zakresie danych o kategorii.
  changeField (event) {
    let category = this.state.category;
    category[event.target.name] = event.target.value;
    this.setState({ category: category });
  }

  // Zwraca zawartość formularza.
  render() {    
    return this.props.add || this.state.categoryLoaded ? <div className={this.props.classes.formContainer}>  
      
      <FormControl>
        <TextField name={'namePl'} value={this.state.category.namePl} type={'text'} label={this.props.global.resources.admin_categorydetails_namePl} className={this.props.classes.input} error={this.state.namePlError} onChange={e => this.changeField(e)} /><br/>
        {this.state.namePlError ? <Typography variant={'caption'} color={'error'}>{this.props.global.resources.admin_categorydetails_namePlError}</Typography> : false}
      </FormControl><br/><br/>

      <FormControl>
        <TextField name={'nameEn'} value={this.state.category.nameEn} type={'text'} label={this.props.global.resources.admin_categorydetails_nameEn} className={this.props.classes.input} error={this.state.nameEnError} onChange={e => this.changeField(e)} /><br/>
        {this.state.nameEnError ? <Typography variant={'caption'} color={'error'}>{this.props.global.resources.admin_categorydetails_nameEnError}</Typography> : false}
      </FormControl><br/><br/>

      {this.props.add ? <React.Fragment><Button onClick={() => this.openConfirmator('add')}>{this.props.global.resources.admin_categorydetails_add}</Button><br/></React.Fragment> : false}
      {this.props.edit ? <React.Fragment><Button onClick={() => this.openConfirmator('edit')}>{this.props.global.resources.admin_categorydetails_edit}</Button><br/></React.Fragment> : false}
      {this.props.delete ? <React.Fragment><Button onClick={() => this.openConfirmator('delete')}>{this.props.global.resources.admin_categorydetails_delete}</Button><br/></React.Fragment> : false}

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

export default withStyles(styles)(AdminCategoryForm);
