import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withStyles, TextField, Button, Modal, FormControl, Typography } from '@material-ui/core';
import { get, put, destroy } from '../api/base';
import validator from 'validator';
import { getJwt } from '../auth/user';
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
  selectedPhoto: {
    maxWidth: '400px'
  },
  thumbnail: {
    maxWidth: '300px',
    height: '200px',
    margin: '3px',
    border: '1px solid black',
    opacity: '0.5',
    cursor: 'pointer',
    '&:hover': {
      opacity: '1'
    },
  },
  thumbnailsWrapper: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  fileinput: {
    display: 'none'
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'row'
  }
});

// Podstrona panelu administracyjnego wyświetlająca listę zdjęć na serwerze, pozwalająca również na wgrywanie nowych zdjęć, edycję i usuwanie już istniejących.
class AdminPhotosList extends Component {
  constructor(props) {
    super(props);

    this.clickThumbnail = this.clickThumbnail.bind(this);
    this.changePhotoname = this.changePhotoname.bind(this);
    this.addPhoto = this.addPhoto.bind(this);
    this.editPhotoName = this.editPhotoName.bind(this);
    this.deletePhoto = this.deletePhoto.bind(this);
    this.renderConfirmator = this.renderConfirmator.bind(this);
    this.closeConfirmator = this.closeConfirmator.bind(this);
    this.chooseActionToConfirm = this.chooseActionToConfirm.bind(this);

    this.state = { };
  }

  // Pobiera z serwera zdjęcia.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('photoslist', true);

    get('/api/photos').then(response => {
      switch(true) {

        case response.status === 200:
          return response.json().then(data => {
            this.setState({ photos: data, photosLoaded: true });
          });

        default:
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
          break;
      }
    });
  }  

  // Wgrywa zdjęcie na serwer.
  addPhoto(files) {
    if (!files) {
      return;
    }

    let formData = new FormData();
    formData.append("file", files[0]);

    fetch('/api/photos/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getJwt()}`
      },
      body: formData
    }).then(response => {
      switch (response.status) {
        case 204:
          this.props.global.openSnackbar(this.props.global.resources.admin_photoslist_added);
          
          this.props.history.push('/admin');
          break;

        case 400:
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_400);
          break;
      
        default:
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500)
          this.props.history.push('/admin');
          break;
      }
    });
  }
  
  // Edytuje nazwę zdjęcia.
  editPhotoName() {
    const id = this.state.selectedPhoto.id;
    const photoname = this.state.selectedPhoto.name;

    this.setState({ validationError: false, photonameError: false });
    if (!photoname || !validator.isLength(photoname, { min: 1, max: 128 })) {
      this.setState({ validationError: true, photonameError: true });
      this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_validation);
      return;
    }

    put('/api/photos/edit_photoname', id, { name: photoname }).then(response => {
      switch (response.status) {
        case 204:
          this.props.global.openSnackbar(this.props.global.resources.admin_photoslist_editedName);
          
          this.props.history.push('/admin')
          break;

        case 400:
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_400);
          break;

        case 404:
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_404);
          break;
        
        case 409:
          this.props.global.openSnackbar(this.props.global.resources.admin_photoslist_nameNotUnique);
          break;
      
        default:
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
          break;
      }
    });
  }

  // Usuwa zdjęcie z serwera.
  deletePhoto() {
    const id = this.state.selectedPhoto.id;

    destroy('/api/photos/delete', id).then(response => {
      switch (response.status) {
        case 204:
          this.props.global.openSnackbar(this.props.global.resources.admin_photoslist_deleted);
          
          this.props.history.push('/admin')
          break;

        case 404:
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_404);
          break;

        case 409:
          this.props.global.openSnackbar(this.props.global.resources.admin_photoslist_conflict);
          break;
      
        default:
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
          break;
      }
    });
  }

  // Pokazuje dane dotyczące naciśniętego zdjęcia.
  clickThumbnail(photo) {
    this.setState({ selectedPhoto: photo });
  }

  // Zmienia nazwę pliku ze zdjęciem na serwerze.
  changePhotoname(event) {
    let selectedPhoto = this.state.selectedPhoto;
    selectedPhoto.name = event.target.value;
    this.setState({ selectedPhoto: selectedPhoto });
  }

  // Renderuje zawartość okna do potwierdzenia wybranej akcji.
  renderConfirmator() {
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

      case 'edit':
        this.setState({ confirmatorOpened: true, actionToConfirm: this.editPhotoName, confirmationQuestion: this.props.global.resources.admin_photoslist_editQuestion });
        break;

      case 'delete':
        this.setState({ confirmatorOpened: true, actionToConfirm: this.deletePhoto, confirmationQuestion: this.props.global.resources.admin_photoslist_deleteQuestion });
        break;
      
      default:
        break;
    }
  }

  // Renderuje zawartość podstrony.
  render() {
    return this.state.photosLoaded ? <React.Fragment>
      <div  className={this.props.classes.wrapper}>
        <div className={this.props.classes.column}>
          <FormControl>
            <Button component="label">
              {this.props.global.resources.admin_photoslist_addPhoto}
              <input type="file" accept=".png,.jpg" className={this.props.classes.fileinput} onChange={e => this.addPhoto(e.target.files)} />
            </Button>
          </FormControl><br/>
          
          <div className={this.props.classes.thumbnailsWrapper}>
            {this.state.photos.map(photo => <img key={`photo-${photo.id}`} src={photo.url} className={this.props.classes.thumbnail} onClick={() => this.clickThumbnail(photo)}/>)}
          </div>
        </div>
        <div className={this.props.classes.column}>
          {this.state.selectedPhoto ? <React.Fragment>
            <img src={this.state.selectedPhoto.url} className={this.props.classes.selectedPhoto} /><br/><br/>

            <FormControl>
              <TextField name={'photoname'} className={this.props.classes.input} type={'text'} value={this.state.selectedPhoto.name} label={this.props.global.resources.admin_photoslist_photoname} error={this.state.photonameError} onChange={e => this.changePhotoname(e)} /><br/>
              {this.state.photonameError ? <Typography variant={'caption'} color={'error'}>{this.props.global.resources.admin_photoslist_photonameError}</Typography> : false}
            </FormControl><br/><br/>

            <FormControl>
              <Typography>{this.props.global.resources.admin_photoslist_booksNumbers}</Typography>
              <ul>
                {this.state.selectedPhoto.booksNumbers.map(x => 
                  <li key={`admin-photoslist-book-${x}`}>
                     <Link to={`/admin/book/details/${x}`}>
                      <Typography>{x}</Typography>
                    </Link>
                  </li>)}
              </ul>
            </FormControl><br/><br/>

            <FormControl>
              <Typography>{this.props.global.resources.admin_photoslist_newsNumbers}</Typography>
              <ul>
                {this.state.selectedPhoto.newsNumbers.map(x => 
                  <li key={`admin-photoslist-news-${x}`}>
                     <Link to={`/admin/news/details/${x}`}>
                      <Typography>{x}</Typography>
                    </Link>
                  </li>)}
              </ul>
            </FormControl><br/><br/>

            <FormControl>
              <Button onClick={() => this.chooseActionToConfirm('edit')}>{this.props.global.resources.admin_photoslist_editFilename}</Button>
            </FormControl><br/>

            <FormControl>
              <Button onClick={() => this.chooseActionToConfirm('delete')}>{this.props.global.resources.admin_photoslist_deletePhoto}</Button>
            </FormControl><br/><br/>
          </React.Fragment> : false}
        </div>
      </div>

      <Modal open={this.state.confirmatorOpened} onClose={() => this.closeConfirmator()}>         
        <div className={this.props.classes.confirmationModalContent}>         
          {this.renderConfirmator()}  
        </div>         
      </Modal>
    </React.Fragment> : <LoadingIndicator/>;
  }
}

export default withStyles(styles)(AdminPhotosList);
