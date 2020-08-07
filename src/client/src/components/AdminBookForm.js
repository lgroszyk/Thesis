import React, { Component } from 'react';
import { withStyles, TextField, Button, Modal, Typography, FormControl, InputLabel, FormControlLabel, Checkbox } from '@material-ui/core';
import validator from 'validator';
import MultipleSelect from './MultipleSelect';
import { get, getById, put, post, destroy } from '../api/base';
import LoadingIndicator from './LoadingIndicator';
import AdminPhotosGallery from './AdminPhotosGallery';

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

// Formularz służący do dodawania, edycji oraz usuwania książek z oferty antykwariatu.
class AdminBookForm extends Component {
  constructor(props) {
    super(props);
  
    this.addBook = this.addBook.bind(this);
    this.editBook = this.editBook.bind(this);
    this.deleteBook = this.deleteBook.bind(this);
    this.createBookDto = this.createBookDto.bind(this);
    this.validate = this.validate.bind(this);
    this.changeField = this.changeField.bind(this);
    this.setItems = this.setItems.bind(this);
    this.getAction = this.getAction.bind(this);
    this.getClassName = this.getClassName.bind(this);
    this.renderGallery = this.renderGallery.bind(this);
    this.openMainPhotoGallery = this.openMainPhotoGallery.bind(this);
    this.openAdditionalPhotosGallery = this.openAdditionalPhotosGallery.bind(this);
    this.closeGallery = this.closeGallery.bind(this);
    this.setMainPhoto = this.setMainPhoto.bind(this);
    this.setAdditionalPhotos = this.setAdditionalPhotos.bind(this);
    this.renderConfirmator = this.renderConfirmator.bind(this);
    this.closeConfirmator = this.closeConfirmator.bind(this);
    this.chooseActionToConfirm = this.chooseActionToConfirm.bind(this);

    this.state = {
      book: { isElectronic: false },
      bookLoading: true,

      authors: [],
      authorsIds: [],
      authorsLoading: true,

      categories: [],
      categoriesIds: [],
      categoriesLoading: true,
      languages: [],
      languagesIds: [],
      languagesLoading: true,

      mainPhoto: null,
      additionalPhotos: [],
      galleryOpened: false,
      galleryForMainPhoto: false,

      confirmatorOpened: false,
      actionToConfirm: null,
    };
  }

  // Pobiera z serwera odpowiednie frazy do wyświetlenia na podstronie oraz dane dotyczące wybranej książki oraz dane o autorach, kategoriach i językach znajdujących się w bazie.
  componentDidMount() {
    if (!this.props.add) {
      getById('/api/books', this.props.id).then(response => {
        switch (true) { 
  
          case response.status === 200:    
            return response.json().then(data => { 
              this.setState({ book: data, bookLoading: false, 
                authorsIds: data.booksAuthors.map(x => x.authorId),
                languagesIds: data.booksLanguages.map(x => x.languageId),
                categoriesIds: data.booksCategories.map(x => x.categoryId), 
                mainPhoto: { id: data.booksPhotos.find(x => x.isMainPhoto).photo.id, url: data.booksPhotos.find(x => x.isMainPhoto).photo.url },
                additionalPhotos: data.booksPhotos.filter(x => !x.isMainPhoto).map(x => ({ id: x.photo.id, url: x.photo.url })) })
            });
  
          case response.status === 404:    
            this.setState({ bookLoading: false });
            this.props.history.push('/admin/books');
            break;
  
          default:
            this.setState({ bookLoading: false });
            this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
            break;
        }
      });
    }

    get('/api/books/authors').then(response => {
      switch (true) { 

        case response.status === 200:    
          return response.json().then(data => { 
            this.setState({ authors: data, authorsLoading: false });
          });

        default:
          this.setState({ authors: [], authorsLoading: false });
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
          break;
      }
    });

    get('/api/books/categories').then(response => {
      switch (true) { 

        case response.status === 200:    
          return response.json().then(data => { 
            this.setState({ categories: data, categoriesLoading: false });
          });

        default:
          this.setState({ categories: [], categoriesLoading: false });
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
          break;
      }
    });

    get('/api/books/languages').then(response => {
      switch (true) { 

        case response.status === 200:    
          return response.json().then(data => { 
            this.setState({ languages: data, languagesLoading: false });
          });

        default:
          this.setState({ languages: [], languagesLoading: false });
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
          break;
      }
    });
  }

  // Dodaje książkę do oferty antykwariatu.
  addBook() {
    const book = this.createBookDto();

    this.validate(book);    

    setTimeout(() => {

      if (this.state.validationError) {
        this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_validation);
        return;
      }

      post('/api/books/add', book)
        .then(response => {
          switch(true) {

            case response.status === 204:
              this.props.global.openSnackbar(this.props.global.resources.admin_bookdetails_added);
              this.props.history.push('/admin/books');
              break;

            default:
              this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
              break;
          }
      });
    }, 2000);
  }

  // Edytuje książkę z oferty antykwariatu.
  editBook() {
    const book = this.createBookDto();

    this.validate(book);    

    setTimeout(() => {

      if (this.state.validationError) {
        this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_validation);
        return;
      }

      put('/api/books/edit', this.props.id, book)
        .then(response => {
          switch(true) {

            case response.status === 204:
              this.props.global.openSnackbar(this.props.global.resources.admin_bookdetails_edited);
              this.props.history.push('/admin/books');
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

  // Usuwa książkę z oferty antykwariatu.
  deleteBook() {
    destroy('/api/books/delete', this.props.id)
      .then(response => {
        switch(true) {

          case response.status === 204:
            this.props.global.openSnackbar(this.props.global.resources.admin_bookdetails_deleted);
            this.props.history.push('/admin/books');
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

  // Tworzy DTO dotyczący książki.
  createBookDto() {
    let book = this.state.book;
    const bookId = this.props.id ? parseInt(this.props.id) : 0;

    book.booksAuthors = this.state.authorsIds.map(id => ({ bookId: bookId, authorId: id }));
    book.booksCategories = this.state.categoriesIds.map(id => ({ bookId: bookId, categoryId: id }));
    book.booksLanguages= this.state.languagesIds.map(id => ({ bookId: bookId, languageId: id }));
    
    const photos = this.state.additionalPhotos.map(x => ({ bookId: bookId, photoId: x.id, isMainPhoto: false }));
    if (this.state.mainPhoto) {
      photos.push({ bookId: bookId, photoId: this.state.mainPhoto.id, isMainPhoto: true });
    }

    book.booksPhotos = photos;

    return book;
  }

  // Sprawdza formę danych książki.
  validate(book) {
    this.setState({ validationError: false, titleError: false, isbnError: false, priceError: false, isElectronicError: false, descriptionPlError: false, descriptionEnError: false, releaseDateError: false, purchaseByStoreDateError: false, booksAuthorsError: false, booksCategoriesError: false, booksLanguagesError: false, mainPhotoError: false  });
    if (!book.title || !validator.isLength(book.title, { min: 1, max: 256 })) {
      this.setState({ validationError: true, titleError: true });
    }
    if (book.isbn && !validator.isLength(book.isbn, { min: 1, max: 32 })) {
      this.setState({ validationError: true, isbnError: true })
    }
    if (!book.price || !validator.isDecimal(book.price.toString(), {force_decimal: false, decimal_digits: '2,2', locale: 'en-US'})) {
      this.setState({ validationError: true, priceError: true });
    }
    if(!validator.isBoolean(book.isElectronic.toString())) {
      this.setState({ validationError: true, isElectronicError: true });
    }
    if (!book.descriptionPl || !validator.isLength(book.descriptionPl, { min: 1, max: 8192 })) {
      this.setState({ validationError: true, descriptionPlError: true });
    }
    if (!book.descriptionEn || !validator.isLength(book.descriptionEn, { min: 1, max: 8192 })) {
      this.setState({ validationError: true, descriptionEnError: true });
    }
    if (!book.releaseDate || !validator.isISO8601(book.releaseDate)) {
      this.setState({ validationError: true, releaseDateError: true });
    }
    if (!book.purchaseByStoreDate || !validator.isISO8601(book.purchaseByStoreDate)) {
      this.setState({ validationError: true, purchaseByStoreDateError: true });
    }
    if (!book.booksAuthors) {
      this.setState({ validationError: true, booksAuthorsError: true });
    }
    book.booksAuthors.forEach(x => {
      if (!validator.isInt(x.bookId.toString()) || !validator.isInt(x.authorId.toString())) {
        this.setState({ validationError: true, booksAuthorsError: true });
        return;
      }
    });
    if (!book.booksPhotos) {
      this.setState({ validationError: true, booksPhotosError: true });
    }
    book.booksPhotos.forEach(x => {
      if (!validator.isInt(x.bookId.toString()) || !validator.isInt(x.photoId.toString()) || !validator.isBoolean(x.isMainPhoto.toString())) {
        this.setState({ validationError: true, booksPhotosError: true });
        return;
      }
    });
    if (!book.booksCategories) {
      this.setState({ validationError: true, booksCategoriesError: true });
    }
    book.booksCategories.forEach(x => {
      if (!validator.isInt(x.bookId.toString()) || !validator.isInt(x.categoryId.toString())) {
        this.setState({ validationError: true, booksCategoriesError: true });
        return;
      }
    });
    if (!book.booksLanguages) {
      this.setState({ validationError: true, booksLanguagesError: true });
    }
    book.booksLanguages.forEach(x => {
      if (!validator.isInt(x.bookId.toString()) || !validator.isInt(x.languageId.toString())) {
        this.setState({ validationError: true, booksLanguagesError: true });
        return;
      }
    });
    if (!this.state.mainPhoto) {
      this.setState({ validationError: true, mainPhotoError: true });
    }
  }

  // Aktualizuje stan komponentu w zakresie danych książki.
  changeField(event) {
    let book = this.state.book;
    book[event.target.name] = event.target.value;
    if (event.target.name == 'isElectronic') {
      book[event.target.name] = event.target.checked;
    }
    this.setState({ book: book });
  }

  // Aktualizuje stan komponentu w zakresie autorów, języków i kategorii książki.
  setItems(itemsNames, itemsValues) {
    this.setState({ [`${itemsNames}Ids`]: itemsValues });
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
    if (this.state.galleryForMainPhoto) {
      return <AdminPhotosGallery close={this.closeGallery} setPhoto={this.setMainPhoto} mainPhoto={this.state.mainPhoto}
        chooseOnlyOnePhoto={true} global={this.props.global} {...this.props} />
    } else {
      return <AdminPhotosGallery close={this.closeGallery} setPhotos={this.setAdditionalPhotos} additionalPhotos={this.state.additionalPhotos} 
        chooseOnlyOnePhoto={false} global={this.props.global} {...this.props} />
    }
  }

  // Otwiera galerię miniaturek zdjęć do wyboru głównego zdjęcia książki.
  openMainPhotoGallery() {
    this.setState({ galleryOpened: true, galleryForMainPhoto: true });
  }

  // Otwiera galerię miniaturek zdjęć do wyboru dodatkowych zdjęć książki.
  openAdditionalPhotosGallery() {
    this.setState({ galleryOpened: true, galleryForMainPhoto: false });
  }

  // Zamyka galerię miniaturek zdjęć.
  closeGallery() {
    this.setState({ galleryOpened: false })
  }

  // Aktualizuje stan komponentu w zakresie głównego zdjęcia książki.
  setMainPhoto(photo) {
    this.setState({ mainPhoto: photo })
  }

  // Aktualizuje stan komponentu w zakresie dodatkowych zdjęć książki.
  setAdditionalPhotos(photos) {
    this.setState({ additionalPhotos: photos });
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

  // Określa, która akcja ma zostać wykonana (na podstawie tego, który przycisk został naciśnięty).
  chooseActionToConfirm(action) {
    switch (action) {
      case 'add':
        this.setState({ confirmatorOpened: true, actionToConfirm: this.addBook, confirmationQuestion: this.props.global.resources.admin_bookdetails_addQuestion });
        break;
    
      case 'edit':
        this.setState({ confirmatorOpened: true, actionToConfirm: this.editBook, confirmationQuestion: this.props.global.resources.admin_bookdetails_editQuestion });
        break;

      case 'delete':
        this.setState({ confirmatorOpened: true, actionToConfirm: this.deleteBook, confirmationQuestion: this.props.global.resources.admin_bookdetails_deleteQuestion });
        break;
      
      default:
        break;
    }
  }

  // Renderuje zawartość formularza.
  render() {
    if (!this.props.add && this.state.bookLoading) {
      return <LoadingIndicator/>;
    }
    if (this.state.authorsLoading || this.state.categoriesLoading || this.state.languagesLoading) {
      return <LoadingIndicator/>;
    }
    
    return <React.Fragment>
      <TextField name={'title'} className={this.props.classes.input} type={'text'} value={this.state.book.title} label={this.props.global.resources.admin_bookdetails_title} error={this.state.titleError} onChange={e => this.changeField(e)} /><br/>
      <Typography className={this.getClassName('title')} variant={'caption'} color={'error'}>{this.props.global.resources.admin_bookdetails_titleError}</Typography><br/><br/>

      <TextField name={'isbn'} className={this.props.classes.input} type={'text'} value={this.state.book.isbn} label={this.props.global.resources.admin_bookdetails_ISBN} error={this.state.isbnError} onChange={e => this.changeField(e)} /><br/>
      <Typography className={this.getClassName('isbn')} variant={'caption'} color={'error'}>{this.props.global.resources.admin_bookdetails_ISBNError}</Typography><br/><br/>

      <TextField name={'price'} className={this.props.classes.input} type={'number'} value={this.state.book.price} label={this.props.global.resources.admin_bookdetails_price} error={this.state.priceError} onChange={e => this.changeField(e)}/><br/>
      <Typography className={this.getClassName('price')} variant={'caption'} color={'error'}>{this.props.global.resources.admin_bookdetails_priceError}</Typography><br/><br/>

      <FormControl error={this.state.isElectronicError}>
        <FormControlLabel control={<Checkbox name={'isElectronic'} color="primary" checked={this.state.book.isElectronic} onChange={e => this.changeField(e)}/>} label={this.props.global.resources.admin_bookdetails_isElectronic} />
        <Typography className={this.getClassName('isElectronic')} variant={'caption'} color={'error'}>{this.props.global.resources.admin_bookdetails_isElectronicError}</Typography>
      </FormControl><br/><br/>

      <TextField name={'descriptionPl'} multiline className={this.props.classes.input} type={'text'} value={this.state.book.descriptionPl} label={this.props.global.resources.admin_bookdetails_descriptionPl} error={this.state.descriptionPlError} onChange={e => this.changeField(e)}/><br/>
      <Typography className={this.getClassName('descriptionPl')} variant={'caption'} color={'error'}>{this.props.global.resources.admin_bookdetails_descriptionPlError}</Typography><br/><br/>

      <TextField name={'descriptionEn'} multiline className={this.props.classes.input} type={'text'} value={this.state.book.descriptionEn} label={this.props.global.resources.admin_bookdetails_descriptionEn} error={this.state.descriptionEnError} onChange={e => this.changeField(e)}/><br/>
      <Typography className={this.getClassName('descriptionEn')} variant={'caption'} color={'error'}>{this.props.global.resources.admin_bookdetails_descriptionEnError}</Typography><br/><br/>

      <TextField name={'releaseDate'} className={this.props.classes.input} type={'date'} value={this.state.book.releaseDate ? this.state.book.releaseDate.substring(0, 10) : null} label={this.props.global.resources.admin_bookdetails_releaseDate} error={this.state.releaseDateError} onChange={e => this.changeField(e)} InputLabelProps={{ shrink: true }}/><br/>
      <Typography className={this.getClassName('releaseDate')} variant={'caption'} color={'error'}>{this.props.global.resources.admin_bookdetails_releaseDateError}</Typography><br/><br/>
      
      <TextField name={'purchaseByStoreDate'} className={this.props.classes.input} type={'date'} value={this.state.book.purchaseByStoreDate ? this.state.book.purchaseByStoreDate.substring(0, 10) : null} label={this.props.global.resources.admin_bookdetails_purchaseByStoreDate} error={this.state.purchaseByStoreDateError} onChange={e => this.changeField(e)} InputLabelProps={{ shrink: true }}/><br/>
      <Typography className={this.getClassName('purchaseByStoreDate')} variant={'caption'} color={'error'}>{this.props.global.resources.admin_bookdetails_purchaseByStoreDateError}</Typography><br/><br/>

      <FormControl error={this.state.booksAuthorsError}>
        <InputLabel>{this.props.global.resources.admin_bookdetails_booksAuthors}</InputLabel>
        <MultipleSelect global={this.props.global} {...this.props} dataType={'authors'} items={this.state.authors} ids={this.state.authorsIds} setValues={this.setItems} /><br/>
        <Typography className={this.getClassName('booksAuthors')} variant={'caption'} color={'error'}>{this.props.global.resources.admin_bookdetails_booksAuthorsError}</Typography><br/>
      </FormControl><br/><br/>

      <FormControl error={this.state.booksCategoriesError}>
        <InputLabel>{this.props.global.resources.admin_bookdetails_booksCategories}</InputLabel>
        <MultipleSelect global={this.props.global} {...this.props} dataType={'categories'} items={this.state.categories} ids={this.state.categoriesIds} setValues={this.setItems} /><br/>
        <Typography className={this.getClassName('booksCategories')} variant={'caption'} color={'error'}>{this.props.global.resources.admin_bookdetails_booksCategoriesError}</Typography><br/>
      </FormControl><br/><br/>

      <FormControl error={this.state.booksLanguagesError}>
        <InputLabel>{this.props.global.resources.admin_bookdetails_booksLanguages}</InputLabel>
        <MultipleSelect global={this.props.global} {...this.props} dataType={'languages'} items={this.state.languages} ids={this.state.languagesIds} setValues={this.setItems} /><br/>
        <Typography className={this.getClassName('booksLanguages')} variant={'caption'} color={'error'}>{this.props.global.resources.admin_bookdetails_booksLanguagesError}</Typography><br/>
      </FormControl><br/><br/>
      
      <Button onClick={() => this.openMainPhotoGallery()}>{this.props.global.resources.admin_bookdetails_changeMainPhoto}</Button><br/>
      <Typography className={this.getClassName('mainPhoto')} variant={'caption'} color={'error'}>{this.props.global.resources.admin_bookdetails_mainPhotoError}</Typography><br/>
      <Button onClick={() => this.openAdditionalPhotosGallery()}>{this.props.global.resources.admin_bookdetails_changeAdditionalPhotos}</Button><br/>
      <Typography className={this.getClassName('booksPhotos')} variant={'caption'} color={'error'}>{this.props.global.resources.admin_bookdetails_booksPhotosError}</Typography><br/><br/><br/>

      <Button className={this.getAction('add')} onClick={() => this.chooseActionToConfirm('add')}>{this.props.global.resources.admin_bookdetails_add}</Button>
      <Button className={this.getAction('edit')} onClick={() => this.chooseActionToConfirm('edit')}>{this.props.global.resources.admin_bookdetails_edit}</Button>
      <Button className={this.getAction('delete')} onClick={() => this.chooseActionToConfirm('delete')}>{this.props.global.resources.admin_bookdetails_delete}</Button>

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

export default withStyles(styles)(AdminBookForm);
