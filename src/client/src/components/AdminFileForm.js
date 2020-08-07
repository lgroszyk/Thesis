import React, { Component } from 'react';
import { withStyles, TextField, Button, Modal, Typography, FormControl } from '@material-ui/core';
import validator from 'validator';
import LoadingIndicator from './LoadingIndicator';
import { getUsername } from '../auth/user';
import { getById, get, post, put, destroy } from '../api/base';
import download from 'downloadjs';

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
  input: {
    minWidth: '300px'
  }
});

// Podstrona z formularzem do edycji danych o pliku.
class AdminFileForm extends Component {
  constructor(props) {
    super(props);

    this.editFileName = this.editFileName.bind(this);
    this.editUserName = this.editUserName.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
    this.changeFileName = this.changeFileName.bind(this);
    this.changeUserName = this.changeUserName.bind(this);
    this.renderConfirmator = this.renderConfirmator.bind(this);
    this.closeConfirmator = this.closeConfirmator.bind(this);
    this.chooseActionToConfirm = this.chooseActionToConfirm.bind(this);
    this.downloadFile = this.downloadFile.bind(this);

    this.state = {
      file: { },

      confirmatorOpened: false,
      actionToConfirm: null,

    };
  }

  // Pobiera z serwera odpowiednie frazy do wyświetlenia na podstronie oraz dane dotyczące pliku.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('filedetails', true);

    if (!this.props.add) {
      getById('/api/books/file', this.props.id).then(response => {
        switch (true) { 
  
          case response.status === 200:    
            return response.json().then(data => { 
              this.setState({ file: data, fileLoaded: true, currentFilename: data.nameWithExtension });
            });
  
          case response.status === 404:    
            this.setState({ fileLoaded: false });
            this.props.history.push('/admin/files');
            break;
  
          default:
            this.setState({ fileLoaded: false });
            this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
            break;
        }
      });
    }
  }

  // Zmienia nazwę pliku.
  editFileName() {
    const id = this.state.file.id;
    const filename = this.state.file.name;

    this.setState({ validationError: false, nameError: false });
    if (!filename || !validator.isLength(filename, { min: 1, max: 128 })) {
      this.setState({ validationError: true, nameError: true });
      this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_validation);
      return;
    }

    put('/api/books/file/edit_filename', id, { name: filename }).then(response => {
      switch (response.status) {
        case 204:
          this.props.global.openSnackbar(this.props.global.resources.admin_filedetails_editedFileName);
          this.props.history.push('/admin/files')
          break;

        case 400:
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_400);
          break;

        case 404:
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_404);
          break;
        
        case 409:
          this.props.global.openSnackbar(this.props.global.resources.admin_filedetails_fileNameNotUnique);
          break;
      
        default:
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
          break;
      }
    });
  }

  // Zmienia właściciela pliku.
  editUserName() {
    const id = this.state.file.id;
    const username = this.state.file.username;

    this.setState({ validationError: false, usernameError: false });
    if (username && !validator.isLength(username, { min: 1, max: 16 })) {
      this.setState({ validationError: true, usernameError: true });
      this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_validation);
      return;
    }

    put('/api/books/file/edit_username', id, { name: username }).then(response => {
      switch (response.status) {
        case 204:
          this.props.global.openSnackbar(this.props.global.resources.admin_filedetails_editedUserName);
          this.props.history.push('/admin/files')
          break;

        case 400:
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_400);
          break;

        case 404:
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_404);
          break;
      
        default:
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
          break;
      }
    });
  }

  // Usuwa plik z serwera.
  deleteFile() {
    const id = this.state.file.id;

    destroy('/api/books/file/delete', id).then(response => {
      switch (response.status) {
        case 204:
          this.props.global.openSnackbar(this.props.global.resources.admin_filedetails_deleted);
          this.props.history.push('/admin/files')
          break;

        case 404:
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_404);
          break;
      
        default:
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
          break;
      }
    });
  }

  // Renderuje zawartość okna do potwierdzenia wybranej akcji
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

  // Zamyka okno do potwierdzenia wybranej akcji
  closeConfirmator() {
    this.setState({ confirmatorOpened: false });
  }

  // Określa, która akcja ma zostać wykonana (na podstawie tego, który przycisk został naciśnięty).
  chooseActionToConfirm(action) {
    switch (action) {
    
      case 'edit':
        this.setState({ confirmatorOpened: true, actionToConfirm: this.editFileName, confirmationQuestion: this.props.global.resources.admin_filedetails_editQuestion });
        break;

      case 'edit_user':
        this.setState({ confirmatorOpened: true, actionToConfirm: this.editUserName, confirmationQuestion: this.props.global.resources.admin_filedetails_edituserQuestion });
        break;

      case 'delete':
        this.setState({ confirmatorOpened: true, actionToConfirm: this.deleteFile, confirmationQuestion: this.props.global.resources.admin_filedetails_deleteQuestion });
        break;
      
      default:
        break;
    }
  }

  // Zmienia stan komponentu w zakresie nazwy wybranego pliku.
  changeFileName(event) {
    let file = this.state.file;
    file.name = event.target.value;
    this.setState({ file: file });
  }

  // Zmienia stan komponentu w zakresie nazwy właściciela wybranego pliku.
  changeUserName(event) {
    let file = this.state.file;
    file.username = event.target.value;
    this.setState({ file: file });
  }

  // Pobiera wybrany plik.
  downloadFile() {
    getById('/api/books/files/download', this.props.match.params.id).then(response => {
      switch (response.status) {
        
        case 200:
          return response.blob().then(blob => download(blob, this.state.currentFilename));

        case 404:
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_404);
          break;

        default:
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
          break;
      }
    });
  }

  // Renderuje zawartość formularza.
  render() {    
    return this.state.fileLoaded ? <React.Fragment>
      <FormControl>
        <TextField disabled name={'id'} className={this.props.classes.input} type={'text'} value={this.state.file.id} label={this.props.global.resources.admin_filedetails_id} /><br/>
      </FormControl><br/><br/>

      <TextField name={'name'} className={this.props.classes.input} type={'text'} value={this.state.file.name} label={this.props.global.resources.admin_filedetails_name} error={this.state.nameError} onChange={e => this.changeFileName(e)} /><br/>
      {this.state.nameError ? 
        <React.Fragment>
          <Typography variant={'caption'} color={'error'}>{this.props.global.resources.admin_filedetails_nameError}</Typography>
        </React.Fragment> : false}<br/><br/>

      <FormControl>
        <TextField disabled name={'sizeInMb'} className={this.props.classes.input} type={'text'} value={this.state.file.sizeInMb} label={this.props.global.resources.admin_filedetails_sizeInMb} /><br/>
      </FormControl><br/><br/>

      <FormControl>
        <TextField disabled name={'uploadDate'} className={this.props.classes.input} type={'date'} value={this.state.file.uploadDate.substring(0,10)} label={this.props.global.resources.admin_filedetails_uploadDate} /><br/>
      </FormControl><br/><br/>

      <TextField name={'username'} className={this.props.classes.input} type={'text'} value={this.state.file.username} label={this.props.global.resources.admin_filedetails_username} helperText={this.props.global.resources.admin_filedetails_username_helper} error={this.state.usernameError} onChange={e => this.changeUserName(e)} /><br/>
      {this.state.usernameError ? 
        <React.Fragment>
          <Typography variant={'caption'} color={'error'}>{this.props.global.resources.admin_filedetails_usernameError}</Typography>
        </React.Fragment> : false}<br/><br/>

      <FormControl>
        <Button onClick={() => this.downloadFile()}>{this.props.global.resources.admin_filedetails_downloadFile}</Button>
      </FormControl><br/><br/>
      
      <FormControl>
        <Button onClick={() => this.chooseActionToConfirm('edit')}>{this.props.global.resources.admin_filedetails_edit}</Button>
      </FormControl><br/><br/>

      <FormControl>
        <Button onClick={() => this.chooseActionToConfirm('edit_user')}>{this.props.global.resources.admin_filedetails_edituser}</Button>
      </FormControl><br/><br/>

      <FormControl>
        <Button onClick={() => this.chooseActionToConfirm('delete')}>{this.props.global.resources.admin_filedetails_delete}</Button>
      </FormControl><br/><br/>

      <Modal open={this.state.confirmatorOpened} onClose={() => this.closeConfirmator()}>         
        <div className={this.props.classes.confirmationModalContent}>         
          {this.renderConfirmator()}  
        </div>         
      </Modal>
    </React.Fragment> : false;
  }
}

export default withStyles(styles)(AdminFileForm);
