import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withStyles, Typography, Modal, Button } from '@material-ui/core';
import LoadingIndicator from './LoadingIndicator';
import { getById } from '../api/base';
import { isLoggedIn, isJwtExpired } from'../auth/user';

const styles = theme => ({
  modalContent: {
    backgroundColor: theme.palette.background.paper,
    position: 'absolute',
    top: `50%`,
    left: `50%`,
    transform: `translate(-50%, -50%)`,
    display: 'flex',
    flexDirection: 'row',
  },
  img: {
    objectFit: 'contain',
    maxWidth: '75vw',
    maxHeight: '90vh',
  },
  mainPhoto: {
    cursor: 'pointer',
    maxWidth: '100%',
    maxHeight: '250px'
  },
  thumbnailsWrapper: {
    maxWidth: '500px',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  thumbnail: {
    maxWidth: '150px',
    height: '100px',
    margin: '3px',
    border: '1px solid black',
    opacity: '0.5',
    cursor: 'pointer',
    '&:hover': {
      opacity: '1'
    },
  },
  photos: {
    float: 'left',
    paddingRight: '5px',
    [theme.breakpoints.down(450)]: {
      float: 'none'
    }
  }
});

// Komponent wyświetlający szczegóły książki z oferty antykwariatu.
class BookDetails extends Component {
  constructor(props) {
    super(props);
    this.renderBook = this.renderBook.bind(this);
    this.openGallery = this.openGallery.bind(this);
    this.closeGallery = this.closeGallery.bind(this);
    this.zoomPhoto = this.zoomPhoto.bind(this);
    this.chooseNextPhoto = this.chooseNextPhoto.bind(this);
    this.choosePreviousPhoto = this.choosePreviousPhoto.bind(this);
    this.getAllPhotos = this.getAllPhotos.bind(this);
    this.addToCart = this.addToCart.bind(this);
    this.renderItems = this.renderItems.bind(this);
    this.renderAuthors = this.renderAuthors.bind(this);
    this.renderLanguages = this.renderLanguages.bind(this);
    this.renderCategories = this.renderCategories.bind(this);

    this.state = {
      galleryOpened: false,
      bookLoading: true,
      book: { },
      currentPhotoIndex: -1,
      chosenPhoto: null
    }
  }

  // Pobiera z serwera dane dotyczące wybranej książki.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('bookdetails', false);

    const id = this.props.match.params.id;

    getById('/api/books', id).then(response => {
      switch (true) { 

        case response.status === 200:             
          return response.json().then(data => {
            this.setState({ book: data, bookLoading: false });
          });

        case response.status === 404:
          this.setState({ bookLoading: false });
          this.props.history.push('/books');
          break;

        default:
          this.setState({ bookLoading: false });
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);
          break;
      }
    });
  }

  // Otwiera galerię zdjeć książki.
  openGallery() {
    this.setState({ galleryOpened: true });
  }

  // Zamyka galerię zdjeć książki.
  closeGallery() {
    this.setState({ galleryOpened: false });
  }

  // Powiększa naciśnięte zdjęcie.
  zoomPhoto(index) {
    this.setState({ galleryOpened: true, currentPhotoIndex: index, chosenPhoto: this.getAllPhotos()[index] });
  }

  // Dodaje książkę do koszyka.
  addToCart() {
    if (!localStorage.getItem('cart')) {
      localStorage.setItem('cart', JSON.stringify([]));
    }

    let cart = JSON.parse(localStorage.getItem('cart'));
    if (cart.find(x => x.id === this.state.book.id)) {
      return;
    }
    cart.push({
      id: this.state.book.id,
      title: this.state.book.title,
      price: this.state.book.price,
      isEbook: this.state.book.isElectronic
    });
    localStorage.setItem('cart', JSON.stringify(cart));
    this.props.global.openSnackbar(this.props.global.resources.user_bookdetails_addedtocart);
  }

  // Przełącza zdjęcia książki.
  chooseNextPhoto() {
    const previousIndex = this.state.currentPhotoIndex;
    const newIndex = previousIndex === this.getAllPhotos().length - 1 ? 0 : previousIndex + 1;
    const newPhoto = this.getAllPhotos()[newIndex];
    this.setState({ currentPhotoIndex: newIndex, chosenPhoto: newPhoto });
  }

  // Przełącza zdjęcia książki.
  choosePreviousPhoto() {
    const previousIndex = this.state.currentPhotoIndex;
    const newIndex = previousIndex === 0 ? this.getAllPhotos().length - 1 : previousIndex - 1;
    const newPhoto = this.getAllPhotos()[newIndex];
    this.setState({ currentPhotoIndex: newIndex, chosenPhoto: newPhoto });
  }

  // Renderuje miniaturki zdjęć książki.
  getAllPhotos() {
    let allPhotos = [];
    allPhotos.push(this.state.book.booksPhotos.find(x => x.isMainPhoto === true).photo.url);
    for (let index = 0; index < this.state.book.booksPhotos.length; index++) {
      const photo = this.state.book.booksPhotos[index].photo.url;
      allPhotos.push(photo);
    }
    return allPhotos;
  }

  // Renderuje dane w formie listy rozdzielonej przecinkami.
  renderItems(items) {
    let result = '';
    for (let index = 0; index < items.length; index++) {
      const element = items[index];
      if (index === items.length - 1) {
        result += element;
      } else {
        result += element + ', '
      }
    }
    return result;
  }

  // Renderuje dane o autorach wybranej książki.
  renderAuthors() {
    const items = this.state.book.booksAuthors.map(x => x.author.nickName ? x.author.nickName : x.author.lastName + ' ' + x.author.firstName);
    return this.renderItems(items);
  }

  // Renderuje dane o językach wybranej książki.
  renderLanguages() {
    const items = this.state.book.booksLanguages.map(x => this.props.global.currentLanguage === 'en' ? x.language.nameEn : x.language.namePl);
    return this.renderItems(items);
  }

  // Renderuje dane o kategoriach wybranej książki.
  renderCategories() {
    const items = this.state.book.booksCategories.map(x => this.props.global.currentLanguage === 'en' ? x.category.nameEn : x.category.namePl);
    return this.renderItems(items);
  }

  // Renderuje szczegóły wybranej książki.
  renderBook() {
    if (this.state.bookLoading) {
      return <LoadingIndicator />;
    }

    return <React.Fragment>
      <div>
        <Typography>
          <Link to='/books'>
            {this.props.global.resources.user_bookdetails_return}
          </Link>
        </Typography><br/>
      </div>
      
      <div>
        <div className={this.props.classes.photos}>
          <div className={this.props.classes.mainPhotoWrapper}>
            <img src={this.state.book.booksPhotos.find(x => x.isMainPhoto === true).photo.url} className={this.props.classes.mainPhoto} onClick={() => this.zoomPhoto(0)}/>
          </div>

          <div className={this.props.classes.thumbnailsWrapper}>
            {this.state.book.booksPhotos.filter(x => x.isMainPhoto === false).map((x, index) => <img src={x.photo.url} className={this.props.classes.thumbnail} onClick={() => this.zoomPhoto(index+2)}/> )}
          </div>         
        </div>

        <Typography variant={'title'}>
          {this.state.book.title}
        </Typography><br/><br/>

        <Typography variant={'subtitle1'}>
          {`${this.props.global.resources.user_bookdetails_price}: ${this.state.book.price.toFixed(2) + ' zł'}`}
        </Typography><br/>

        {isLoggedIn() && !isJwtExpired() ? <React.Fragment>
          <Button onClick={() => this.addToCart()}>
            {this.props.global.resources.user_bookdetails_toCart}
          </Button><br/><br/>
        </React.Fragment> : false}

        <Typography style={{ whiteSpace: 'pre-wrap' }}>
          {this.props.global.currentLanguage === 'en' ? this.state.book.descriptionEn : this.state.book.descriptionPl}
        </Typography><br/><br/>



      </div><br style={{ clear: 'both' }}/>

      <Typography variant={'h6'}>{this.props.global.resources.user_bookdetails_bookDataHeader}</Typography><br/>
        <Typography>
          
          {`${this.props.global.resources.user_bookdetails_authors}: ${this.renderAuthors()}`}<br/>
          {`${this.props.global.resources.user_bookdetails_categories}: ${this.renderCategories()}`}<br/>
          {`${this.props.global.resources.user_bookdetails_languages}: ${this.renderLanguages()}`}<br/>
          {`${this.props.global.resources.user_bookdetails_isElectronic}: ${this.state.book.isElectronic ? this.props.global.resources.user_common_yes : this.props.global.resources.user_common_no}`}<br/>
          {`${this.props.global.resources.user_bookdetails_releaseDate}: ${this.state.book.releaseDate.substring(0,10)}`}<br/>
          {`${this.props.global.resources.user_bookdetails_purchaseDate}: ${this.state.book.purchaseByStoreDate.substring(0,10)}`}

        </Typography>

    </React.Fragment>;
  }

  // Renderuje szczegóły książki i galerię zdjęć książki. 
  render() {

    return <React.Fragment>
      {this.renderBook()}

      <Modal open={this.state.galleryOpened} onClose={() => this.closeGallery()}>         
        <div className={this.props.classes.modalContent}>           
          <Button className={this.props.classes.imagesSwiper} onClick={() => this.choosePreviousPhoto()} disableRipple={true}>{'<'}</Button>
            <img src={this.state.chosenPhoto} className={this.props.classes.img} />
          <Button className={this.props.classes.imagesSwiper} onClick={() => this.chooseNextPhoto()} disableRipple={true}>{'>'}</Button>
        </div>         
      </Modal>

    </React.Fragment>;
  }
}

export default withStyles(styles)(BookDetails);
