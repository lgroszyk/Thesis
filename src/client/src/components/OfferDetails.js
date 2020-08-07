import React, { Component } from 'react';
import { withStyles, FormControl, FormControlLabel, TextField, Checkbox, Button, Typography, Modal } from '@material-ui/core';
import { getById } from '../api/base';
import { getJwt } from '../auth/user';

const styles = theme => ({
  fileinput: {
    display: 'none'
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'row'
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
  input: {
    width: '300px'
  }
});

// Komponent reprezentujący podstronę ukazującą szczegóły złożonej oferty sprzedaży książki
class OfferDetails extends Component {
  constructor(props) {
    super(props);

    this.addEbook = this.addEbook.bind(this);
    this.sendEbook = this.sendEbook.bind(this);
    this.openConfirmator = this.openConfirmator.bind(this);
    this.closeConfirmator = this.closeConfirmator.bind(this);

    this.state = { };
  }

  // Pobiera z serwera szczegóły konkretnej oferty.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('offerdetails', false);

    getById('/api/offers/my', this.props.match.params.id).then(response => {
      switch (response.status) {
        
        case 200:
          return response.json().then(data => this.setState({ offer: data, offerLoaded: true, offerHasResponse: Boolean(data.response) }));
  
        case 404:
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_404);
          this.props.history.push('/account');
          break;

        default:
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);
          this.props.history.push('/account');
          break;
      }
    });
  }

  // Umożliwia wybrór ebooka po zaakceptowaniu odpowiedzi administratora na ofertę.
  addEbook(files) {
    if (!files) {
      this.setState({ formData: null, fileName: null });
      return;
    }

    let formData = new FormData();
    formData.append("file", files[0]);
    formData.append('offerId', this.state.offer.id);

    this.setState({ formData: formData, fileName: formData.get('file').name });
  }
  
  // Wgrywa wybrany ebook na serwer.
  sendEbook() {
    const data = this.state.formData;
    fetch('/api/offers/send_ebook', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getJwt()}`
      },
      body: data
    }).then(response => {
      switch (response.status) {
        case 204:
          this.props.global.openSnackbar(this.props.global.resources.user_offerdetails_ebookSent)
          break;

        case 400:
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_400);
          break;

        case 404:
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_404)
        break;
      
        default:
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500)
          break;
      }
      this.props.history.push('/account');
    });
  }

  // Otwiera okno do potwierdzenia wybranej akcji.
  openConfirmator() {
    this.setState({ confirmatorOpened: true });
  }

  // Zamyka okno do potwierdzenia wybranej akcji.
  closeConfirmator() {
    this.setState({ confirmatorOpened: false });
  }

  // Renderuje zawartość podstrony.
  render() {
    return this.state.offerLoaded ? <React.Fragment>

      <div className={this.props.classes.wrapper}>
        <div>
          <FormControl>
            <TextField disabled className={this.props.classes.input} type={'text'} value={this.state.offer.id} label={this.props.global.resources.user_offerdetails_id} /><br/>
          </FormControl><br/><br/>

          <FormControl>
            <TextField disabled className={this.props.classes.input} type={'text'} value={this.props.global.currentLanguage === 'en' ? this.state.offer.statusEn : this.state.offer.status} label={this.props.global.resources.user_offerdetails_status} /><br/>
          </FormControl><br/><br/>

          <FormControl>
            <TextField disabled className={this.props.classes.input} type={'text'} value={this.state.offer.date.substring(0,10)} label={this.props.global.resources.user_offerdetails_date} /><br/>
          </FormControl><br/><br/>

          <FormControl>
            <TextField disabled multiline className={this.props.classes.input} type={'text'} value={this.state.offer.about} label={this.props.global.resources.user_offerdetails_about} /><br/>
          </FormControl><br/><br/>

          <FormControl>
            <TextField disabled multiline className={this.props.classes.input} type={'text'} value={this.state.offer.condition} label={this.props.global.resources.user_offerdetails_condition} /><br/>
          </FormControl><br/><br/>

          <FormControl>
            <TextField disabled multiline className={this.props.classes.input} type={'text'} value={this.state.offer.category} label={this.props.global.resources.user_offerdetails_category} /><br/>
          </FormControl><br/><br/>

          <FormControl>
            <TextField disabled multiline className={this.props.classes.input} type={'text'} value={this.state.offer.language} label={this.props.global.resources.user_offerdetails_language} /><br/>
          </FormControl><br/><br/>

          <FormControl>
            <FormControlLabel control={<Checkbox disabled checked={this.state.offer.isEbook} color="primary" />} label={this.props.global.resources.user_offerdetails_isEbook} /><br/>
          </FormControl><br/><br/>

          <FormControl>
            <TextField disabled multiline className={this.props.classes.input} type={'text'} value={this.state.offer.writingTime} label={this.props.global.resources.user_offerdetails_writingTime} /><br/>
          </FormControl><br/><br/>

          <FormControl>
            <TextField disabled multiline className={this.props.classes.input} type={'text'} value={this.state.offer.printingTime} label={this.props.global.resources.user_offerdetails_printingTime} /><br/>
          </FormControl><br/><br/>

          <FormControl>
            <TextField disabled className={this.props.classes.input} type={'text'} value={this.state.offer.transactionPrice} label={this.props.global.resources.user_offerdetails_transactionPrice} /><br/>
          </FormControl><br/><br/>

        {this.state.offerHasResponse ? <React.Fragment>
            <FormControl>
              <TextField disabled className={this.props.classes.input} type={'text'} value={this.props.global.currentLanguage === 'en' ? this.state.offer.response.statusEn : this.state.offer.response.status} label={this.props.global.resources.user_offerdetails_response_status} /><br/>
            </FormControl><br/><br/>

            <FormControl>
              <TextField disabled className={this.props.classes.input} type={'text'} value={this.state.offer.response.date.substring(0,10)} label={this.props.global.resources.user_offerdetails_response_date} /><br/>
            </FormControl><br/><br/>

            {this.state.offer.response.text ? <React.Fragment>
              <FormControl>
                <TextField disabled multiline className={this.props.classes.input} type={'text'} value={this.state.offer.response.text} label={this.props.global.resources.user_offerdetails_response_text} /><br/>
              </FormControl><br/><br/>
            </React.Fragment> : false}

            {this.state.offer.response.transactionPrice ? <React.Fragment>
              <FormControl>
                <TextField disabled className={this.props.classes.input} type={'text'} value={this.state.offer.response.transactionPrice} label={this.props.global.resources.user_offerdetails_response_transactionPrice} /><br/>
              </FormControl><br/><br/>
            </React.Fragment> : false}

            {this.state.offer.statusId === 3 ? false : <React.Fragment>
              
              {this.state.offer.isEbook && (this.state.offer.response.statusId === 2 || this.state.offer.response.statusId === 3) ? <React.Fragment>
                <FormControl>
                  <Button component="label">
                    {this.props.global.resources.user_offerdetails_addEbook}
                    <input type="file" accept=".pdf,.epub,.mobi" className={this.props.classes.fileinput} onChange={e => this.addEbook(e.target.files)} />
                  </Button>
                  {this.state.fileName ? <Typography>{this.state.fileName}</Typography> : false}
                </FormControl><br/><br/>
              </React.Fragment> : false}

              {this.state.fileName ? <React.Fragment>
                <FormControl>
                  <Typography variant={'h6'}>
                    {this.props.global.resources.user_offerdetails_sendinfo}
                  </Typography>
                </FormControl><br/><br/>

                <Button onClick={() => this.openConfirmator()}>
                  {this.props.global.resources.user_offerdetails_sendEbook}
                </Button>
              </React.Fragment> : false}

            </React.Fragment>}

          </React.Fragment> : false}
        </div>
      </div>

      <Modal open={this.state.confirmatorOpened} onClose={() => this.closeConfirmator()}>         
        <div className={this.props.classes.confirmationModalContent}>         
          <Typography variant={'h6'}>{this.props.global.resources.user_offerdetails_confirmationQuestion}</Typography><br/>
          <Button onClick={() => { this.sendEbook(); this.closeConfirmator(); }}>{this.props.global.resources.user_common_yes}</Button>
          <Button onClick={() => this.closeConfirmator()}>{this.props.global.resources.user_common_no}</Button>  
        </div>         
      </Modal>   
    </React.Fragment> : false;
  }
}

export default withStyles(styles)(OfferDetails);
