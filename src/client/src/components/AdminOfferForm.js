import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withStyles, TextField, Button, Modal, Typography, FormControl, FormControlLabel, InputLabel, Select, MenuItem, Checkbox } from '@material-ui/core';
import validator from 'validator';
import { getById, get, post, put, destroy } from '../api/base';
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
  visible: {
    display: 'block'
  },
  invisible: {
    display: 'none'
  },
  input: {
    minWidth: '300px',
    color: 'black'
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'row'
  },
  column: {
    marginRight: '15px'
  }
});

// Formularz służący do dodawania odpowiedzi do ofert, edycji statusów ofert oraz ich usuwania.
class AdminOfferForm extends Component {
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
    this.renderConfirmator = this.renderConfirmator.bind(this);
    this.closeConfirmator = this.closeConfirmator.bind(this);
    this.chooseActionToConfirm = this.chooseActionToConfirm.bind(this);
    this.createResponseDto = this.createResponseDto.bind(this);
    this.validateResponse = this.validateResponse.bind(this);
    this.changeResponseField = this.changeResponseField.bind(this);
    this.changeAnalysisField = this.changeAnalysisField.bind(this);
    this.predictPrice = this.predictPrice.bind(this);

    this.state = {
      offer: { },
      offerLoading: true,

      analysisModel: { isEbook: false },

      response: {  },

      offerStatuses: [],
      offerStatusesLoading: true,
      offerResponseStatuses: [],
      offerResponseStatusesLoading: true,

      offerHasResponse: false,

      confirmatorOpened: false,
      actionToConfirm: null,
      addPath: '/api/offers/response/add',
      editPath: '/api/offers/edit',
      deletePath: '/api/offers/delete',
      returnPath: '/admin/offers'
    };
  }
  
  // Dodaje odpowiedź administratora do oferty.
  add() {
    const dto = this.createResponseDto();
    this.validateResponse(dto);  


    setTimeout(() => {

      if (this.state.validationResponseError) {
        this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_validation);
        return;
      }

        post(this.state.addPath, dto)
          .then(response => {
            switch(true) {

              case response.status === 204:
                this.props.global.openSnackbar(this.props.global.resources.admin_offerdetails_added);
                this.props.history.push(this.state.returnPath);
                break;
              
              case response.status === 400:
                this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_400);
                break;

              default:
                this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
                break;
            }
        });
      }, 1000);
  }

  // Edytuje status oferty.
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
            this.props.global.openSnackbar(this.props.global.resources.admin_offerdetails_edited);
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

  // Usuwa wybraną ofertę.
  delete() {
    destroy(this.state.deletePath, this.props.id)
      .then(response => {
        switch(true) {

          case response.status === 204:
            this.props.global.openSnackbar(this.props.global.resources.admin_offerdetails_deleted);
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

  // Wywołuje żądanie wyceny oferowanej książki.
  predictPrice() {
    const model = this.state.analysisModel;

    this.setState({ validationError: false });
    const modelFields = [ model.authorPopularity, model.category, model.condition, model.language, model.writingTime, model.printingTime ];
    modelFields.forEach(x => {
      if (!x || !validator.isLength(x, { min: 1, max: 32 })) {
        this.setState({ validationError: true });
      }
    });
    if (!validator.isBoolean(model.isEbook.toString())) {
      this.setState({ validationError: true });
    }

    setTimeout(() => {
      if (this.state.validationError) {
        return;
      }
      post('/api/offers/predict_price', model).then(response => {
        switch (response.status) {
          case 200:
            return response.json().then(data => this.setState({ predictedPrice: data.transactionPrice }));

          case 400:
            this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_400);
            break;
        
          default:
            this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
            break;
        }
      })
    }, 1000);
  }

  // Decyduje, czy przycisk do podjęcia konkretnej akcji ma zostać wyświetlony.
  getAction(action) {
    return this.props[action] ? this.props.classes.visible : this.props.classes.invisible;
  }

  // Decyduje, czy komunikat o błędnej formie konkretnego wpisu użytkownika ma zostać wyświetlony.
  getClassName(field) {
    return this.state[`${field}Error`] ? this.props.classes.visible : this.props.classes.invisible;
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
        this.setState({ confirmatorOpened: true, actionToConfirm: this.add, confirmationQuestion: this.props.global.resources.admin_offerdetails_addQuestion });
        break;

      case 'edit':
        this.setState({ confirmatorOpened: true, actionToConfirm: this.edit, confirmationQuestion: this.props.global.resources.admin_offerdetails_editQuestion });
        break;

      case 'delete':
        this.setState({ confirmatorOpened: true, actionToConfirm: this.delete, confirmationQuestion: this.props.global.resources.admin_offerdetails_deleteQuestion });
        break;
      
      default:
        break;
    }
  }

  // Pobiera z serwera odpowiednie frazy do wyświetlenia na podstronie oraz dane dotyczące wybranej oferty oraz dostępnych statusów ofert, odpowiedzi do nich oraz opcji wyboru przy analizie ceny oferty.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('offerdetails', true);

    getById('/api/offers', this.props.id).then(response => {
      switch (true) { 

        case response.status === 200:    
          return response.json().then(data => {
            let date = new Date();
            date = `${date.getFullYear()}-${date.getMonth()+ 1 > 10 ? (date.getMonth() + 1).toString() : '0' + (date.getMonth() + 1).toString() }-${date.getDate() > 10 ? (date.getDate()).toString() : '0' + (date.getMonth()).toString() }`;
         
            this.setState({ offer: data, offerLoading: false, response: { offerId: data.id, responseDate: date }, offerHasResponse: Boolean(data.offerResponse) }) 
          });

        case response.status === 404:    
          this.setState({ offerLoading: false });
          this.props.history.push('/admin/offers');
          break;

        default:
          this.setState({ offerLoading: false });
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
          break;
      }
    });

    get('/api/offers/statuses').then(response => {
      switch (true) { 

        case response.status === 200:    
          return response.json().then(data => { 
            this.setState({ offerStatuses: data, offerStatusesLoading: false });
          });

        default:
          this.setState({ offerStatuses: [], offerStatusesLoading: false });
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
          break;
      }
    });

    get('/api/offers/response/statuses').then(response => {
      switch (true) { 

        case response.status === 200:    
          return response.json().then(data => { 
            this.setState({ offerResponseStatuses: data, offerResponseStatusesLoading: false });
          });

        default:
          this.setState({ offerResponseStatuses: [], offerResponseStatusesLoading: false });
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
          break;
      }
    });

    get('/api/config/analysis_options').then(response => {
      switch (response.status) {
        case 200:
          return response.json().then(data => {
            this.setState({ 
            authorPopularityOptions: data.authorPopularityOptions,
            conditionOptions: data.conditionOptions,
            categoryOptions: data.categoryOptions,
            languageOptions: data.languageOptions,
            writingTimeOptions: data.writingTimeOptions,
            printingTimeOptions: data.printingTimeOptions,
            analysisOptionsLoaded: true
          }) });
      
        default:
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
          break;
      }
    })
  }

  // Aktualizuje stan komponentu w zakresie danych oferty.
  changeField(event) {
    let offer = this.state.offer;
    offer[event.target.name] = event.target.value;
    this.setState({ offer: offer });
  }

  // Aktualizuje stan komponentu w zakresie danych odpowiedzi do oferty.
  changeResponseField(event) {
    let response = this.state.response;
    response[event.target.name] = event.target.value;
    this.setState({ response: response });
  }

  // Aktualizuje stan komponentu w zakresie danych użytych do przewidzenia poprawnej ceny oferowanej książki.
  changeAnalysisField(event) {
    let model = this.state.analysisModel;

    if (event.target.name === 'isEbook') {
      model[event.target.name] = event.target.checked;
    } else {
      model[event.target.name] = event.target.value;
    }

    this.setState({ analysisModel: model });
  }

  // Tworzy DTO dotyczący statusu oferty.
  createDto() {
    const dto = { statusId: this.state.offer.offerStatusId };
    return dto;
  }

  // Tworzy DTO dotyczący odpowiedzi do oferty.
  createResponseDto() {
    const dto = this.state.response;
    return dto;
  }

  // Sprawdza formę danych o statusie oferty.
  validate(dto) {
    this.setState({ validationError: false });
    
    if (!dto.statusId || !validator.isInt(dto.statusId.toString())) {
      this.setState({ validationError: true });
    }
  }

  // Sprawdza formę danych odpowiedzi do oferty.
  validateResponse(dto) {
    this.setState({ validationResponseError: false, offerStatusError: false, offerResponseStatusError: false, responseTextError: false, proposedPriceError: false  });
    
    if (this.state.offer.offerStatusId !== 2) {
      this.setState({ validationResponseError: true, offerStatusError: true });
    }

    if (!dto.offerResponseStatusId || !validator.isInt(dto.offerResponseStatusId.toString())) {
      this.setState({ validationResponseError: true, offerResponseStatusError: true });
    }

    if (dto.offer) {
      this.setState({ validationResponseError: true });
    }

    if (dto.offerResponse) {
      this.setState({ validationResponseError: true });
    }

    if (!dto.offerId || !validator.isInt(dto.offerId.toString())) {
      this.setState({ validationResponseError: true });
    }

    if (!dto.responseDate || !validator.isISO8601(dto.responseDate.toString())) {
      this.setState({ validationResponseError: true });
    }

    if (dto.responseText && !validator.isLength(dto.responseText, { min: 1, max: 8192 })) {
      this.setState({ validationResponseError: true, responseTextError: true });
    }

    if (dto.proposedPrice && !validator.isDecimal(dto.proposedPrice.toString(), { decimal_digits: '2' })) {
      this.setState({ validationResponseError: true, proposedPriceError: true });
    }
  }

  // Renderuje zawartość podstrony.
  render() {
    if (this.state.offerLoading || this.state.offerStatusesLoading) {
      return <LoadingIndicator/>;
    }
    
    return <React.Fragment>
      <div className={this.props.classes.wrapper}>
        <div className={this.props.classes.column}>
          <FormControl>
            <TextField disabled name={'number'} className={this.props.classes.input} type={'text'} value={this.state.offer.id} label={this.props.global.resources.admin_offerdetails_id} InputLabelProps={{ shrink: true }}/>
          </FormControl><br/><br/>

          <FormControl>
            <TextField disabled name={'date'} className={this.props.classes.input} type={'date'} value={this.state.offer.date.substring(0,10)} label={this.props.global.resources.admin_offerdetails_date} InputLabelProps={{ shrink: true }}/>
          </FormControl><br/><br/>

          <FormControl>
            <TextField disabled multiline name={'about'} className={this.props.classes.input} type={'text'} value={this.state.offer.about} label={this.props.global.resources.admin_offerdetails_about} InputLabelProps={{ shrink: true }}/>
          </FormControl><br/><br/>
          
          <FormControl>
            <TextField disabled multiline name={'condition'} className={this.props.classes.input} type={'text'} value={this.state.offer.condition} label={this.props.global.resources.admin_offerdetails_condition} InputLabelProps={{ shrink: true }}/>
          </FormControl><br/><br/>

          <FormControl>
            <TextField disabled multiline name={'category'} className={this.props.classes.input} type={'text'} value={this.state.offer.category} label={this.props.global.resources.admin_offerdetails_category} InputLabelProps={{ shrink: true }}/>
          </FormControl><br/><br/>

          <FormControl>
            <TextField disabled multiline name={'language'} className={this.props.classes.input} type={'text'} value={this.state.offer.language} label={this.props.global.resources.admin_offerdetails_language} InputLabelProps={{ shrink: true }}/>
          </FormControl><br/><br/>

          <FormControl>
            <TextField disabled multiline name={'writingTime'} className={this.props.classes.input} type={'text'} value={this.state.offer.writingTime} label={this.props.global.resources.admin_offerdetails_writingTime} InputLabelProps={{ shrink: true }}/>
          </FormControl><br/><br/>

          <FormControl>
            <TextField disabled multiline name={'printingTime'} className={this.props.classes.input} type={'text'} value={this.state.offer.printingTime} label={this.props.global.resources.admin_offerdetails_printingTime} InputLabelProps={{ shrink: true }}/>
          </FormControl><br/><br/>

          <FormControl>
            <FormControlLabel control={<Checkbox name={'isEbook'} color="primary" checked={this.state.offer.isEbook}/>} label={this.props.global.resources.admin_offerdetails_isEbook} />
          </FormControl><br/><br/>

          <FormControl>
            <TextField disabled name={'transactionPrice'} className={this.props.classes.input} type={'text'} value={this.state.offer.transactionPrice} label={this.props.global.resources.admin_offerdetails_transactionPrice} InputLabelProps={{ shrink: true }}/>
          </FormControl><br/><br/>

        </div>
        <div className={this.props.classes.column}>
        
        <FormControl>
            <TextField disabled multiline name={'username'} className={this.props.classes.input} type={'text'} value={this.state.offer.user ? this.state.offer.user.name : ''} label={this.props.global.resources.admin_offerdetails_username} InputLabelProps={{ shrink: true }}/>
          </FormControl><br/><br/>

          {this.state.offer.fileId ? 
          <React.Fragment>
            <FormControl>
              <Typography variant={'caption'}>{`${this.props.global.resources.admin_offerdetails_fileId}: `}
                <Link to={`/admin/file/details/${this.state.offer.fileId}`}>
                  <Typography variant={'caption'}>{this.state.offer.fileId}</Typography>
                </Link>
              </Typography>
            </FormControl><br/><br/>
          </React.Fragment> : false}

          <FormControl>
            <InputLabel shrink>{this.props.global.resources.admin_offerdetails_offerStatus}</InputLabel>
            <Select className={this.props.classes.input} name={'offerStatusId'} value={this.state.offer.offerStatusId} onChange={e => this.changeField(e)}>  
              {this.state.offerStatuses.map(x => <MenuItem key={`offer-status-${x.id}`} value={x.id}>{x.namePl}</MenuItem>)}
            </Select>
          </FormControl><br/><br/>

          <FormControl>
            <InputLabel shrink>{this.props.global.resources.admin_offerdetails_offerResponseStatus}</InputLabel>
            <Select disabled={this.state.offerHasResponse} className={this.props.classes.input} name={'offerResponseStatusId'} value={this.state.offerHasResponse ? this.state.offer.offerResponse.offerResponseStatusId : this.state.response.offerResponseStatusId} onChange={e => this.changeResponseField(e)}>  
              {this.state.offerResponseStatuses.map(x => <MenuItem key={`offer-response-status-${x.id}`} value={x.id}>{x.namePl}</MenuItem>)}
            </Select>
          </FormControl>
          <Typography className={this.getClassName('offerResponseStatus')} variant={'caption'} color={'error'}>{this.props.global.resources.admin_offerdetails_response_offerResponseStatusError}</Typography><br/><br/>

          {this.state.offerHasResponse ? <React.Fragment>
            <FormControl>
              <TextField disabled name={'responseDate'} className={this.props.classes.input} type={'date'} value={this.state.offer.offerResponse.responseDate.substring(0,10)} label={this.props.global.resources.admin_offerdetails_response_responseDate} InputLabelProps={{ shrink: true }}/>
            </FormControl><br/><br/>
          </React.Fragment> : false}

          <FormControl>
            <TextField disabled={this.state.offerHasResponse} multiline name={'responseText'} className={this.props.classes.input} type={'text'} value={this.state.offerHasResponse ? this.state.offer.offerResponse.responseText : this.state.response.responseText} label={this.props.global.resources.admin_offerdetails_response_responseText} onChange={e => this.changeResponseField(e)} InputLabelProps={{ shrink: true }}/>
            <Typography className={this.getClassName('responseText')} variant={'caption'} color={'error'}>{this.props.global.resources.admin_offerdetails_response_responseTextError}</Typography>
          </FormControl><br/><br/>

          <FormControl>
            <TextField disabled={this.state.offerHasResponse} name={'proposedPrice'} className={this.props.classes.input} type={'number'} value={this.state.offerHasResponse ? this.state.offer.offerResponse.proposedPrice : this.state.response.proposedPrice} label={this.props.global.resources.admin_offerdetails_response_proposedPrice} onChange={e => this.changeResponseField(e)} InputLabelProps={{ shrink: true }}/>
            <Typography className={this.getClassName('proposedPrice')} variant={'caption'} color={'error'}>{this.props.global.resources.admin_offerdetails_response_proposedPriceError}</Typography>
          </FormControl><br/><br/>

          {this.state.offerHasResponse ? false : <React.Fragment>
            <FormControl>
              <Button className={this.getAction('add')} onClick={() => this.chooseActionToConfirm('add')}>{this.props.global.resources.admin_offerdetails_add}</Button>
            </FormControl>
            <Typography className={this.getClassName('offerStatus')} variant={'caption'} color={'error'}>{this.props.global.resources.admin_offerdetails_response_offerStatusError}</Typography>
          </React.Fragment>}

          <Button className={this.getAction('edit')} onClick={() => this.chooseActionToConfirm('edit')}>{this.props.global.resources.admin_offerdetails_edit}</Button>
          <Button className={this.getAction('delete')} onClick={() => this.chooseActionToConfirm('delete')}>{this.props.global.resources.admin_offerdetails_delete}</Button>

        </div>
        {this.state.analysisOptionsLoaded ? <div className={this.props.classes.column}>
          <FormControl>
            <InputLabel shrink>{this.props.global.resources.admin_offerdetails_analysis_authorPopularity}</InputLabel>
            <Select className={this.props.classes.input}
              name={'authorPopularity'}
              value={this.state.analysisModel.authorPopularity}
              onChange={e => this.changeAnalysisField(e)}>
              {this.state.authorPopularityOptions.map(x => <MenuItem key={`offer-details-analysis-author-${x}`} value={x}>{x}</MenuItem>)}
            </Select>
          </FormControl><br/><br/>

          <FormControl>
            <InputLabel shrink>{this.props.global.resources.admin_offerdetails_analysis_condition}</InputLabel>
            <Select className={this.props.classes.input}
              name={'condition'}
              value={this.state.analysisModel.condition}
              onChange={e => this.changeAnalysisField(e)}>
              {this.state.conditionOptions.map(x => <MenuItem key={`offer-details-analysis-condition-${x}`} value={x}>{x}</MenuItem>)}
            </Select>
          </FormControl><br/><br/>

          <FormControl>
            <InputLabel shrink>{this.props.global.resources.admin_offerdetails_analysis_category}</InputLabel>
            <Select className={this.props.classes.input}
              name={'category'}
              value={this.state.analysisModel.category}
              onChange={e => this.changeAnalysisField(e)}>
              {this.state.categoryOptions.map(x => <MenuItem key={`offer-details-analysis-category-${x}`} value={x}>{x}</MenuItem>)}
            </Select>
          </FormControl><br/><br/>

          <FormControl>
            <InputLabel shrink>{this.props.global.resources.admin_offerdetails_analysis_language}</InputLabel>
            <Select className={this.props.classes.input}
              name={'language'}
              value={this.state.analysisModel.language}
              onChange={e => this.changeAnalysisField(e)}>
              {this.state.languageOptions.map(x => <MenuItem key={`offer-details-analysis-language-${x}`} value={x}>{x}</MenuItem>)}
            </Select>
          </FormControl><br/><br/>

          <FormControl>
            <FormControlLabel control={<Checkbox name={'isEbook'} color="primary" checked={this.state.analysisModel.isEbook} onChange={e => this.changeAnalysisField(e)}/>} label={this.props.global.resources.admin_offerdetails_analysis_isEbook} />
          </FormControl><br/>

          <FormControl>
            <InputLabel shrink>{this.props.global.resources.admin_offerdetails_analysis_writingTime}</InputLabel>
            <Select className={this.props.classes.input}
              name={'writingTime'}
              value={this.state.analysisModel.writingTime}
              onChange={e => this.changeAnalysisField(e)}>
              {this.state.writingTimeOptions.map(x => <MenuItem key={`offer-details-analysis-writingTime-${x}`} value={x}>{x}</MenuItem>)}
            </Select>
          </FormControl><br/><br/>

          <FormControl>
            <InputLabel shrink>{this.props.global.resources.admin_offerdetails_analysis_printingTime}</InputLabel>
            <Select className={this.props.classes.input}
              name={'printingTime'}
              value={this.state.analysisModel.printingTime}
              onChange={e => this.changeAnalysisField(e)}>
              {this.state.printingTimeOptions.map(x => <MenuItem key={`offer-details-analysis-printingTime-${x}`} value={x}>{x}</MenuItem>)}
            </Select>
          </FormControl><br/><br/>

          <FormControl>
            <Button onClick={() => this.predictPrice()}>{this.props.global.resources.admin_offerdetails_analysis_predict}</Button>
          </FormControl><br/><br/>

          <FormControl>
            <TextField disabled className={this.props.classes.input} type={'text'} label={this.props.global.resources.admin_offerdetails_analysis_predictedPrice} value={this.state.predictedPrice ? this.state.predictedPrice.toFixed(2) + ' zł' : ''} InputLabelProps={{ shrink: true }}/>
          </FormControl>
        </div> : false}
      </div>

      <Modal open={this.state.confirmatorOpened} onClose={() => this.closeConfirmator()}>         
        <div className={this.props.classes.confirmationModalContent}>         
          {this.renderConfirmator()}  
        </div>         
      </Modal>
    </React.Fragment>;
  }
}

export default withStyles(styles)(AdminOfferForm);
