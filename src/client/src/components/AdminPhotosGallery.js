import React, { Component } from 'react';
import { withStyles, Button } from '@material-ui/core';
import { get } from '../api/base';
import LoadingIndicator from './LoadingIndicator';

const styles = theme => ({
  thumbnailClicked: {
    maxWidth: '150px',
    height: '100px',
    margin: '3px',
    border: '3px solid red',
    opacity: '1',
    cursor: 'pointer'
  },
  thumbnailNotClicked: {
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
  thumbnailsWrapper: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
});

// Komponent pokazujący zdjęcia wgrane na serwer w formie miniaturek.
class AdminPhotoGallery extends Component {
  constructor(props) {
    super(props);

    this.renderPhotos = this.renderPhotos.bind(this);
    this.getClassName = this.getClassName.bind(this);
    this.clickThumbnail = this.clickThumbnail.bind(this);
    this.saveChanges = this.saveChanges.bind(this);

    this.state = {
      photos: [],
      photosLoading: true,
      mainPhoto: this.props.chooseOnlyOnePhoto ? this.props.mainPhoto : null,
      additionalPhotos: this.props.chooseOnlyOnePhoto ? null : this.props.additionalPhotos
    };
  }

  // Pobiera z serwera zdjęcia.
  componentDidMount() {
    get('/api/photos').then(response => {
      switch(true) {

        case response.status === 200:
          return response.json().then(data => {
            this.setState({ photos: data, photosLoading: false });
          });

        default:
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
          break;
      }
    });
  }

  // Metoda pomocnicza do usunięcia z tablicy wybranej wartości.
  removeFromArray(array, value) {
    let newArray = [];
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
      if (element.id !== value.id) {
        newArray.push(element);
      }
    }
    return newArray;
  }

  // Wskazuje, czy zdjęcie powinno być oznaczone, czy nie.
  getClassName(photo) {
    if (this.state.photosLoading) {
      return false;
    }

    if (this.props.chooseOnlyOnePhoto) {
      if (this.state.mainPhoto && this.state.mainPhoto.id === photo.id) {
        return this.props.classes.thumbnailClicked;
      } else {
        return this.props.classes.thumbnailNotClicked;
      }
    } else {
      const photos = this.state.additionalPhotos;
      if (photos.find(x => x.id === photo.id)) {
        return this.props.classes.thumbnailClicked;
      } else {
        return this.props.classes.thumbnailNotClicked;
      }
    }
  }

  // Zaznacza lub odznacza kliknięte zdjęcie.
  clickThumbnail(photo) {
    if (this.props.chooseOnlyOnePhoto) {
      if (this.state.mainPhoto && this.state.mainPhoto.id === photo.id) {
        this.setState({ mainPhoto: null });
      } else {
        this.setState({ mainPhoto: photo });
      }
    } else {
      if (this.state.additionalPhotos.find(x => x.id === photo.id)) {
        const photos = this.removeFromArray(this.state.additionalPhotos, photo);
        this.setState({ additionalPhotos: photos });
      } else {
        let photos = this.state.additionalPhotos;
        photos.push(photo);
        this.setState({ additionalPhotos: photos });
      }
    }
  }

  // Wyświetla zdjęcia w postaci miniaturek.
  renderPhotos() {
    if (this.state.photosLoading) {
      return <LoadingIndicator />;
    }
    return this.state.photos.map(photo => <img key={`photo-${photo.id}`} src={photo.url} 
      className={this.getClassName(photo)} onClick={() => this.clickThumbnail(photo)}/>);
  }

  // Zapisuje zmiany w wiadomości lub książce, dla którego jest aktualnie dobierane zdjęcie.
  saveChanges() {
    if (this.props.chooseOnlyOnePhoto) {
      this.props.setPhoto(this.state.mainPhoto);
    } else {
      this.props.setPhotos(this.state.additionalPhotos);
    }
    this.props.close();
  }

  // Renderuje zawartość galerii.
  render() {
    return <React.Fragment>

      <div className={this.props.classes.thumbnailsWrapper}>
        {this.renderPhotos()}
      </div>
      <Button onClick={() => this.saveChanges()}>{this.props.global.resources.admin_common_save}</Button>

    </React.Fragment>;
  }
}

export default withStyles(styles)(AdminPhotoGallery);
