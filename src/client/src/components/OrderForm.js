import React, { Component } from 'react';
import { withStyles, FormControlLabel, Checkbox, RadioGroup, Radio, Typography } from '@material-ui/core';
import { get } from '../api/base';

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

// Formularz do wysyłania zamówienia do antykwariatu.
class OrderForm extends Component {
  constructor(props) {
    super(props);

    this.order = this.order.bind(this);
    this.createDto = this.createDto.bind(this);
    this.validate = this.validate.bind(this);
    this.changeField = this.changeField.bind(this);
    this.getClassName = this.getClassName.bind(this);
    this.renderConfirmator = this.renderConfirmator.bind(this);
    this.closeConfirmator = this.closeConfirmator.bind(this);

    this.state = {
      books: [],

      confirmatorOpened: false,
      actionToConfirm: null
    }
  }

  // Pobiera z local storage zawartość koszyka.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('order', false);

    if (!localStorage.getItem('cart')) {
      localStorage.setItem('cart', JSON.stringify([]));
    }

    this.setState ({ books: JSON.parse(localStorage.getItem('cart')) });
  }

  // Wysyła zamówienie do antykwariatu.
  order() {
    const dto = this.createDto();

    this.validate(dto);    

    setTimeout(() => {

      if (this.state.validationError) {
        this.props.global.openSnackbar(this.props.global.resources.user_common_errors_validation);
        return;
      }

    }, 2000);
  }

  // Tworzy DTO dotyczący zamówienia.
  createDto() {
    let news = this.state.news;
    const newsId = this.props.id ? parseInt(this.props.id) : 0;

    const date = new Date();
    news.date = `${date.getFullYear()}-${date.getMonth()+ 1 > 10 ? (date.getMonth() + 1).toString() : '0' + (date.getMonth() + 1).toString() }-${date.getDate() > 10 ? (date.getDate()).toString() : '0' + (date.getMonth()).toString() }`;
    news.publisherName = getUsername();
    
    const photos = this.state.additionalPhotos.map(x => ({ newsId: newsId, photoId: x.id, isMainPhoto: false }));
    if (this.state.mainPhoto) {
      photos.push({ newsId: newsId, photoId: this.state.mainPhoto.id, isMainPhoto: true });
    }

    news.newsPhotos = photos;

    return news;
  }

  // Sprawdza formę danych zamówienia.
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

  // Aktualizuje stan komponentu w zakresie danych zamówienia.
  changeField(event) {
    let news = this.state.news;
    news[event.target.name] = event.target.value;
    this.setState({ news: news });
  }

  // Decyduje, czy komunikat o błędnej formie konkretnego wpisu użytkownika ma zostać wyświetlony.
  getClassName(field) {
    return this.state[`${field}Error`] ? this.props.classes.visible : this.props.classes.invisible;
  }

  // Renderuje zawartość okna do potwierdzenia wysłania zamówienia.
  renderConfirmator() {
    if (!this.state.confirmatorOpened) {
      return false;
    }

    return <React.Fragment>
      <Typography variant={'h6'}>
        {this.state.confirmationQuestion}
      </Typography><br/>
      <Button onClick={() => {
        this.closeConfirmator(); }}>
        {this.props.global.resources.admin_common_yes}</Button>
      <Button onClick={() => this.closeConfirmator()}>{this.props.global.resources.admin_common_no}</Button>
    </React.Fragment>;
  }

  // Zamyka okno do potwierdzenia wysłania zamówienia.
  closeConfirmator() {
    this.setState({ confirmatorOpened: false });
  }

  // Renderuje zawartość formularza.
  render() {
    return <React.Fragment>
      <TextField name={'title'} className={this.props.classes.input} type={'text'} value={this.state.news.title} label={this.props.global.resources.admin_newsdetails_title} error={this.state.titleError} onChange={e => this.changeField(e)} /><br/>
      <Typography className={this.getClassName('title')} variant={'caption'} color={'error'}>{this.props.global.resources.admin_newsdetails_titleError}</Typography><br/><br/>

      <FormControlLabel control={<Checkbox color="primary" />} label="Regulamin" /><br/>

      <RadioGroup value={'card'}>
        <FormControlLabel control={<Radio value={'card'}/>} label="Karta" />
        <FormControlLabel control={<Radio value={'cash'}/>} label="Gotówka" />
      </RadioGroup><br/>
    </React.Fragment>;
  }
}

export default withStyles(styles)(OrderForm);
