import React, { Component } from 'react';
import { withStyles, TextField, Button, Modal, Typography } from '@material-ui/core';
import validator from 'validator';
import LoadingIndicator from './LoadingIndicator';
import { getUsername } from '../auth/user';
import AdminPhotosGallery from './AdminPhotosGallery';
import { getById, post, put, destroy } from '../api/base';

const styles = theme => ({
	modalContent: {
    backgroundColor: theme.palette.background.paper,
    position: 'absolute',
    top: `50%`,
    left: `50%`,
    transform: `translate(-50%, -50%)`
  },
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

// Formularz służący do dodawania, edycji oraz usuwania aktualności o antykwariacie.
class AdminNewsForm extends Component {
  constructor(props) {
    super(props);

    this.createDto = this.createDto.bind(this);
    this.validate = this.validate.bind(this);
    this.add = this.add.bind(this);
    this.edit = this.edit.bind(this);
    this.delete = this.delete.bind(this);
    this.changeField = this.changeField.bind(this);
    this.getAction = this.getAction.bind(this);
    this.getClassName = this.getClassName.bind(this);
    this.renderGallery = this.renderGallery.bind(this);
    this.openMainPhotoGallery = this.openMainPhotoGallery.bind(this);
    this.closeGallery = this.closeGallery.bind(this);
    this.setMainPhoto = this.setMainPhoto.bind(this);
    this.renderConfirmator = this.renderConfirmator.bind(this);
    this.closeConfirmator = this.closeConfirmator.bind(this);
    this.chooseActionToConfirm = this.chooseActionToConfirm.bind(this);

    this.state = {
      news: { },
      newsLoading: true,

      mainPhoto: null,
      galleryOpened: false,
      galleryForMainPhoto: false,

      confirmatorOpened: false,
      actionToConfirm: null,

      addPath: '/api/news/add',
      editPath: '/api/news/edit',
      deletePath: '/api/news/delete',
      returnPath: '/admin/news'
    };
  }

  // Pobiera z serwera odpowiednie frazy do wyświetlenia na podstronie oraz dane dotyczące wybranej aktualności.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('newsdetails', true);

    if (!this.props.add) {
      getById('/api/news', this.props.id).then(response => {
        switch (true) { 
  
          case response.status === 200:    
            return response.json().then(data => { 
              const photo = data.newsPhotos.find(x => x.isMainPhoto) ? { id: data.newsPhotos.find(x => x.isMainPhoto).photo.id, url: data.newsPhotos.find(x => x.isMainPhoto).photo.url } : { }
              this.setState({ news: data, newsLoading: false,                 
                mainPhoto: photo });
            });
  
          case response.status === 404:    
            this.setState({ newsLoading: false });
            this.props.history.push('/admin/news');
            break;
  
          default:
            this.setState({ newsLoading: false });
            this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
            break;
        }
      });
    }
  }

  // Dodaje aktualność o antykwariacie.
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
          switch(true) {

            case response.status === 204:
              this.props.global.openSnackbar(this.props.global.resources.admin_newsdetails_added);
              this.props.history.push(this.state.returnPath);
              break;

            default:
              this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
              break;
          }
      });
    }, 1000);
  }

  // Edytuje aktualność o antykwariacie.
  edit() {
    const dto = this.createDto();
    this.validate(dto);    

    setTimeout(() => {

      if (this.state.validationError) {
        this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_validation);
        return;
      }

      put(this.state.editPath, this.props.id, dto)
        .then(response => {
          switch(true) {

            case response.status === 204:
              this.props.global.openSnackbar(this.props.global.resources.admin_newsdetails_edited);
              this.props.history.push(this.state.returnPath);
              break;
            
            case response.status === 400:
              this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_400);
              break;

            case response.status === 404:
              this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_404);
              break;

            default:
              this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
              break;
          }
      });
    }, 1000);
  }

  // Usuwa aktualność o antykwariacie.
  delete() {
    destroy(this.state.deletePath, this.props.id)
      .then(response => {
        switch(true) {

          case response.status === 204:
            this.props.global.openSnackbar(this.props.global.resources.admin_newsdetails_deleted);
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

  // Renderuje zawartość galerii miniaturek zdjęć.
  renderGallery() {
      return <AdminPhotosGallery close={this.closeGallery} setPhoto={this.setMainPhoto} mainPhoto={this.state.mainPhoto}
        chooseOnlyOnePhoto={true} global={this.props.global} {...this.props} />
  }

  // Otwiera galerię miniaturek zdjęć do wyboru zdjęcia aktualności.
  openMainPhotoGallery() {
    this.setState({ galleryOpened: true, galleryForMainPhoto: true });
  }

  // Zamyka galerię miniaturek zdjęć do wyboru zdjęcia aktualności.
  closeGallery() {
    this.setState({ galleryOpened: false })
  }

  // Aktualizuje stan komponentu w zakresie zdjęcia aktualności.
  setMainPhoto(photo) {
    this.setState({ mainPhoto: photo })
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
        this.setState({ confirmatorOpened: true, actionToConfirm: this.add, confirmationQuestion: this.props.global.resources.admin_newsdetails_addQuestion });
        break;
    
      case 'edit':
        this.setState({ confirmatorOpened: true, actionToConfirm: this.edit, confirmationQuestion: this.props.global.resources.admin_newsdetails_editQuestion });
        break;

      case 'delete':
        this.setState({ confirmatorOpened: true, actionToConfirm: this.delete, confirmationQuestion: this.props.global.resources.admin_newsdetails_deleteQuestion });
        break;
      
      default:
        break;
    }
  }

  // Aktualizuje stan komponentu w zakresie danych aktualności.
  changeField(event) {
    let news = this.state.news;
    news[event.target.name] = event.target.value;
    this.setState({ news: news });
  }

  // Tworzy DTO dotyczący aktualności.
  createDto() {
    let news = this.state.news;
    const newsId = this.props.id ? parseInt(this.props.id) : 0;

    const date = new Date();
    news.date = `${date.getFullYear()}-${date.getMonth()+ 1 > 10 ? (date.getMonth() + 1).toString() : '0' + (date.getMonth() + 1).toString() }-${date.getDate() > 10 ? (date.getDate()).toString() : '0' + (date.getMonth()).toString() }`;
    news.publisherName = getUsername();
    
    const photos = [];
    if (this.state.mainPhoto) {
      photos.push({ newsId: newsId, photoId: this.state.mainPhoto.id, isMainPhoto: true });
    }
    news.newsPhotos = photos;

    return news;
  }

  // Sprawdza formę danych aktualności.
  validate(dto) {
    const news = dto;

    this.setState({ validationError: false, titleError: false, contentError: false, descriptionError: false, dateError: false, publisherNameError: false, mainPhotoError: false  });

    if (!news.title || !validator.isLength(news.title, { min: 1, max: 128 })) {
      this.setState({ validationError: true, titleError: true });
    }

    if (!news.content || !validator.isLength(news.content, { min: 1, max: 8192 })) {
      this.setState({ validationError: true, contentError: true });
    }

    if (!news.description || !validator.isLength(news.description, { min: 1, max: 1024 })) {
      this.setState({ validationError: true, descriptionError: true });
    }

    if (!news.publisherName || !validator.isLength(news.publisherName, { min: 1, max: 16 })) {
      this.setState({ validationError: true, publisherNameError: true });
    }

    if (!news.date || !validator.isISO8601(news.date.toString())) {
      this.setState({ validationError: true, dateError: true });
    }
  }

  // Renderuje zawartość formularza.
  render() {
    if (!this.props.add && this.state.newsLoading) {
      return <LoadingIndicator/>;
    }
    
    return <React.Fragment>
      <TextField name={'title'} className={this.props.classes.input} type={'text'} value={this.state.news.title} label={this.props.global.resources.admin_newsdetails_title} error={this.state.titleError} onChange={e => this.changeField(e)} /><br/>
      <Typography className={this.getClassName('title')} variant={'caption'} color={'error'}>{this.props.global.resources.admin_newsdetails_titleError}</Typography><br/><br/>
      
      <TextField name={'content'} multiline className={this.props.classes.input} type={'text'} value={this.state.news.content} label={this.props.global.resources.admin_newsdetails_content} error={this.state.contentError} onChange={e => this.changeField(e)}/><br/>
      <Typography className={this.getClassName('content')} variant={'caption'} color={'error'}>{this.props.global.resources.admin_newsdetails_contentError}</Typography><br/><br/>

      <TextField name={'description'} multiline className={this.props.classes.input} type={'text'} value={this.state.news.description} label={this.props.global.resources.admin_newsdetails_description} error={this.state.descriptionError} onChange={e => this.changeField(e)}/><br/>
      <Typography className={this.getClassName('description')} variant={'caption'} color={'error'}>{this.props.global.resources.admin_newsdetails_descriptionError}</Typography><br/><br/>

      {this.props.add ? false : <React.Fragment>
        <TextField disabled name={'date'} className={this.props.classes.input} type={'date'} value={this.state.news.date ? this.state.news.date.substring(0, 10) : null} label={this.props.global.resources.admin_newsdetails_date} error={this.state.dateError} onChange={e => this.changeField(e)} InputLabelProps={{ shrink: true }}/><br/>
        <Typography className={this.getClassName('date')} variant={'caption'} color={'error'}>{this.props.global.resources.admin_newsdetails_dateError}</Typography><br/><br/>
      </React.Fragment>}      

      {this.props.add ? false : <React.Fragment>
        <TextField disabled name={'publisherName'} className={this.props.classes.input} type={'text'} value={this.state.news.publisherName} label={this.props.global.resources.admin_newsdetails_publisherName} error={this.state.publisherNameError} onChange={e => this.changeField(e)} /><br/>
        <Typography className={this.getClassName('publisherName')} variant={'caption'} color={'error'}>{this.props.global.resources.admin_newsdetails_publisherNameError}</Typography><br/><br/>
      </React.Fragment>}
      
      <Button onClick={() => this.openMainPhotoGallery()}>{this.props.global.resources.admin_newsdetails_changeMainPhoto}</Button><br/>
      <Typography className={this.getClassName('mainPhoto')} variant={'caption'} color={'error'}>{this.props.global.resources.admin_newsdetails_mainPhotoError}</Typography><br/>

      <Button className={this.getAction('add')} onClick={() => this.chooseActionToConfirm('add')}>{this.props.global.resources.admin_newsdetails_add}</Button>
      <Button className={this.getAction('edit')} onClick={() => this.chooseActionToConfirm('edit')}>{this.props.global.resources.admin_newsdetails_edit}</Button>
      <Button className={this.getAction('delete')} onClick={() => this.chooseActionToConfirm('delete')}>{this.props.global.resources.admin_newsdetails_delete}</Button>

      <Modal open={this.state.galleryOpened} onClose={() => this.closeGallery()}>         
        <div className={this.props.classes.modalContent}>         
          {this.renderGallery()}  
        </div>         
      </Modal>

      <Modal open={this.state.confirmatorOpened} onClose={() => this.closeConfirmator()}>         
        <div className={this.props.classes.confirmationModalContent}>         
          {this.renderConfirmator()}  
        </div>         
      </Modal>
    </React.Fragment>;
  }
}

export default withStyles(styles)(AdminNewsForm);
