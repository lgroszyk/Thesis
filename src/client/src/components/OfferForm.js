import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withStyles, TextField, Button, Modal, Typography, FormControl, FormControlLabel, InputLabel, Checkbox, IconButton, Table, TableBody, TableRow, TableCell } from '@material-ui/core';
import validator from 'validator';
import { post } from '../api/base';

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
  visible: {
    display: 'block'
  },
  invisible: {
    display: 'none'
  },
  input: {
    minWidth: '300px',
  },
  rulesCheckerWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  }
});

// Formularz do wysłania oferty sprzedaży książki do antykwariatu.
class OfferForm extends Component {
  constructor(props) {
    super(props);

    this.createDto = this.createDto.bind(this);
    this.validate = this.validate.bind(this);
    this.sendOffer = this.sendOffer.bind(this);
    this.changeField = this.changeField.bind(this);
    this.getClassName = this.getClassName.bind(this);
    this.renderConfirmator = this.renderConfirmator.bind(this);
    this.openConfirmator = this.openConfirmator.bind(this);
    this.closeConfirmator = this.closeConfirmator.bind(this);
    this.changeRulesDecision = this.changeRulesDecision.bind(this);

    this.state = {
      offer: { date: new Date(), isEbook: false },
      confirmatorOpened: false,
      rulesAccepted: false
    };
  }

  // Wysyła ofertę.
  sendOffer() {
    const dto = this.createDto();
    this.validate(dto);    

    setTimeout(() => {

      if (this.state.validationError) {
        this.props.global.openSnackbar(this.props.global.resources.user_common_errors_validation);
        return;
      }

      post('/api/offers', dto)
        .then(response => {
          switch(true) {
            case response.status === 400:
              this.props.global.openSnackbar(this.props.global.resources.user_common_errors_400);
              this.props.history.push('/');
              break;    

            case response.status === 204:
              this.props.global.openSnackbar(this.props.global.resources.user_offer_offerSent);
              this.props.history.push('/');
              break;

            default:
              this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);
              break;
          }
      });
    }, 1000);
  }

  // Decyduje, czy komunikat o błędnej formie konkretnego wpisu użytkownika ma zostać wyświetlony.
  getClassName(field) {
    return this.state[`${field}Error`] ? this.props.classes.visible : this.props.classes.invisible;
  }
  
  // Renderuje zawartość okna do potwierdzenia wysłania oferty.
  renderConfirmator() {
    if (!this.state.confirmatorOpened) {
      return false;
    }

    return <React.Fragment>
      <Typography variant={'h6'}>
        {this.props.global.resources.user_offer_confirmationQuestion}
      </Typography><br/>
      <Button onClick={() => { this.sendOffer(); this.closeConfirmator(); }}>{this.props.global.resources.user_common_yes}</Button>
      <Button onClick={() => this.closeConfirmator()}>{this.props.global.resources.user_common_no}</Button>
    </React.Fragment>;
  }

  // Otwiera okno do potwierdzenia wysłania oferty.
  openConfirmator() {
    this.setState({ confirmatorOpened: true });
  }

  // Zamyka okno do potwierdzenia wysłania oferty.
  closeConfirmator() {
    this.setState({ confirmatorOpened: false });
  }

  // Aktualizuje stan komponentu w zakresie danych oferty.
  changeField(event) {
    let offer = this.state.offer;

    if (event.target.name === 'isEbook') {
      offer[event.target.name] = event.target.checked;
    } else {
      offer[event.target.name] = event.target.value;
    }

    this.setState({ offer: offer });
  }

  // Zaznacza lub odznacza akceptację regulaminu.
  changeRulesDecision() {
    const previousDecision = this.state.rulesAccepted;
    const newDecision = previousDecision ? false : true;
    this.setState({ rulesAccepted: newDecision });
  }

  // Tworzy DTO dotyczący oferty.
  createDto() {
    let offer = this.state.offer;
    const date = new Date();
    offer.date = `${date.getFullYear()}-${date.getMonth()+ 1 > 10 ? (date.getMonth() + 1).toString() : '0' + (date.getMonth() + 1).toString() }-${date.getDate() > 10 ? (date.getDate()).toString() : '0' + (date.getMonth()).toString() }`;
    return offer;
  }

  // Sprawdza formę danych oferty.
  validate(dto) {
    const offer = dto;

    this.setState({ validationError: false, rulesError: false, aboutError: false, conditionError: false, categoryError: false, languageError: false, printingTimeError: false, writingTimeError: false, isEbookError: false, transactionPriceError: false, dateError: false });

    if (!offer.about || !validator.isLength(offer.about, { min: 1, max: 8192 })) {
      this.setState({ validationError: true, aboutError: true });
    }

    if (!offer.condition || !validator.isLength(offer.condition, { min: 1, max: 1024 })) {
      this.setState({ validationError: true, conditionError: true });
    }

    if (!offer.category || !validator.isLength(offer.category, { min: 1, max: 1024 })) {
      this.setState({ validationError: true, categoryError: true });
    }

    if (!offer.language || !validator.isLength(offer.language, { min: 1, max: 1024 })) {
      this.setState({ validationError: true, languageError: true });
    }

    if (!offer.printingTime || !validator.isLength(offer.printingTime, { min: 1, max: 1024 })) {
      this.setState({ validationError: true, printingTimeError: true });
    }

    if (!offer.writingTime || !validator.isLength(offer.writingTime, { min: 1, max: 1024 })) {
      this.setState({ validationError: true, writingTimeError: true });
    }

    if (!validator.isBoolean(offer.isEbook.toString())) {
      this.setState({ validationError: true, isEbookError: true });
    }

    if (!offer.transactionPrice || !validator.isDecimal(offer.transactionPrice.toString(), {force_decimal: false, decimal_digits: '2,2', locale: 'en-US'})) {
      this.setState({ validationError: true, transactionPriceError: true });
    }

    if (!offer.date || !validator.isISO8601(offer.date.toString())) {
      this.setState({ validationError: true, dateError: true });
    }

    if (!this.state.rulesAccepted) {
      this.setState({ validationError: true, rulesError: true });

    }
  }

  // Renderuje zawartość formularza.
  render() {    
    return <React.Fragment>
      <TextField multiline name={'about'} className={this.props.classes.input} type={'text'} value={this.state.offer.about} label={this.props.global.resources.user_offer_about} error={this.state.aboutError} onChange={e => this.changeField(e)} />
      <Typography className={this.getClassName('about')} variant={'caption'} color={'error'}>{this.props.global.resources.user_offer_aboutError}</Typography><br/><br/>

      <TextField multiline name={'condition'} className={this.props.classes.input} type={'text'} value={this.state.offer.condition} label={this.props.global.resources.user_offer_condition} helperText={this.props.global.resources.user_offer_conditionHelper} error={this.state.conditionError} onChange={e => this.changeField(e)} />
      <Typography className={this.getClassName('condition')} variant={'caption'} color={'error'}>{this.props.global.resources.user_offer_conditionError}</Typography><br/><br/>

      <TextField multiline name={'category'} className={this.props.classes.input} type={'text'} value={this.state.offer.category} label={this.props.global.resources.user_offer_category} helperText={this.props.global.resources.user_offer_categoryHelper} error={this.state.categoryError} onChange={e => this.changeField(e)} />
      <Typography className={this.getClassName('category')} variant={'caption'} color={'error'}>{this.props.global.resources.user_offer_categoryError}</Typography><br/><br/>

      <TextField multiline name={'language'} className={this.props.classes.input} type={'text'} value={this.state.offer.language} label={this.props.global.resources.user_offer_language} error={this.state.languageError} onChange={e => this.changeField(e)} />
      <Typography className={this.getClassName('language')} variant={'caption'} color={'error'}>{this.props.global.resources.user_offer_languageError}</Typography><br/><br/>

      <FormControl error={this.state.isEbookError}>
        <FormControlLabel control={<Checkbox name={'isEbook'} color="primary" checked={this.state.offer.isEbook} onChange={e => this.changeField(e)}/>} label={this.props.global.resources.user_offer_isEbook} />
      </FormControl><br/>

      <TextField multiline name={'writingTime'} className={this.props.classes.input} type={'text'} value={this.state.offer.writingTime} label={this.props.global.resources.user_offer_writingTime} error={this.state.writingTimeError} onChange={e => this.changeField(e)} />
      <Typography className={this.getClassName('writingTime')} variant={'caption'} color={'error'}>{this.props.global.resources.user_offer_writingTimeError}</Typography><br/><br/>

      <TextField multiline name={'printingTime'} className={this.props.classes.input} type={'text'} value={this.state.offer.printingTime} label={this.props.global.resources.user_offer_printingTime} error={this.state.printingTimeError} onChange={e => this.changeField(e)} />
      <Typography className={this.getClassName('printingTime')} variant={'caption'} color={'error'}>{this.props.global.resources.user_offer_printingTimeError}</Typography><br/><br/>

      <TextField name={'transactionPrice'} className={this.props.classes.input} type={'number'} value={this.state.offer.transactionPrice} label={this.props.global.resources.user_offer_transactionPrice} error={this.state.transactionPriceError} onChange={e => this.changeField(e)} />
      <Typography className={this.getClassName('transactionPrice')} variant={'caption'} color={'error'}>{this.props.global.resources.user_offer_transactionPriceError}</Typography><br/><br/>

      <FormControl className={this.props.classes.rulesCheckerWrapper}>
        <Checkbox color="primary" checked={this.state.rulesAccepted} onChange={() => this.changeRulesDecision()}/>
          <Typography>
            {this.props.global.resources.user_offer_rules_1}<Link to={'/rules'}>{this.props.global.resources.user_offer_rules_2}</Link>
        </Typography>
      </FormControl>      
      {this.state.rulesError ? <Typography color={'error'}>{this.props.global.resources.user_offer_rulesnotaccepted}</Typography> : false}<br/><br/>

      <Button onClick={() => this.openConfirmator()}>{this.props.global.resources.user_offer_send}</Button>

      <Modal open={this.state.confirmatorOpened} onClose={() => this.closeConfirmator()}>         
        <div className={this.props.classes.confirmationModalContent}>         
          {this.renderConfirmator()}  
        </div>         
      </Modal>
    </React.Fragment>;
  }
}

export default withStyles(styles)(OfferForm);
