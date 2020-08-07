import React, { Component } from 'react';
import { withStyles, TextField, Button, Modal, Typography, FormControl } from '@material-ui/core';
import validator from 'validator';
import { get, post } from '../api/base';

const styles = theme => ({
  confirmationModalContent: {
    padding: '30px',
    backgroundColor: theme.palette.background.paper,
    position: 'absolute',
    top: `50%`,
    left: `50%`,
    transform: `translate(-50%, -50%)`,
    minWidth: '300px',
    textAlign: 'center'
  },
  input: {
    minWidth: '250px',
  },
  biginput: {
    minWidth: '600px',
  },
  formContainer: {
    margin: '20px'
  }
});

// Podstrona z formularzem do edycji danych o sklepie oraz możliwością usunięcia z bazy danych nieaktualnych elementów.
class AdminConfigForm extends Component {
  constructor(props) {
    super(props);

    this.changeConfig = this.changeConfig.bind(this);
    this.changeField = this.changeField.bind(this);
    this.maintainDatabase = this.maintainDatabase.bind(this);
    this.validate = this.validate.bind(this);
    this.openConfirmator = this.openConfirmator.bind(this);
    this.closeConfirmator = this.closeConfirmator.bind(this);

    this.state = { config: { } };
  }

  // Pobiera z serwera odpowiednie frazy do wyświetlenia na podstronie oraz dane dotyczące antykwariatu.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('config', true);

    get('/api/config').then(response => {
      switch (response.status) { 

        case 200:    
          return response.json().then(data => { 
            this.setState({ config: data, configLoaded: true });
          });

        default:
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
          this.props.history.push('/admin');
          break;
      }
    });
  }

  // Zmienia dane o antykwariacie.
  changeConfig() {    
    this.validate();

    setTimeout(() => {
      if (this.state.validationError) {
        this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_validation);
        return;
      }  

      const config = this.state.config;
      post('/api/config/change', { rulesPl: config.rulesPl, rulesEn: config.rulesEn, privacyPolicyPl: config.privacyPolicyPl, privacyPolicyEn: config.privacyPolicyEn, aboutRulesPl: config.aboutRulesPl, aboutRulesEn: config.aboutRulesEn,
          complaintsPl: config.complaintsPl, complaintsEn: config.complaintsEn, address: config.address, timetable: config.timetable, aboutUs: config.aboutUs  })
        .then(response => {
          switch(response.status) {

            case 204:
              this.props.global.openSnackbar(this.props.global.resources.admin_config_changedConfig);
              this.props.history.push('/admin');
              break;
            
            case 400:
              this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_400);
              this.props.history.push('/admin');
              break;

            default:
              this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
              this.props.history.push('/admin');
              break;
          }
      });
    }, 1000);
  }

  // Otwiera okno do potwierdzenia wybranej akcji.
  openConfirmator() {
    this.setState({ confirmatorOpened: true });
  }

  // Zamyka okno do potwierdzenia wybranej akcji.
  closeConfirmator() {
    this.setState({ confirmatorOpened: false });
  }

  // Sprawdza formę danych o antykwariacie.
  validate() {
    const dto = this.state.config;
    this.setState({ validationError: false, rulesPlError: false, rulesEnError: false, privacyPolicyPlError: false, privacyPolicyEnError: false, complaintsPlError: false, complaintsEnError: false, aboutRulesPlError: false, aboutRulesEnError: false, addressError: false, timetableError: false, aboutUsError: false});

    if (!dto.rulesPl || !validator.isLength(dto.rulesPl, { min: 1, max: 1000000 })) {
      this.setState({ validationError: true, rulesPlError: true })
    }
    if (!dto.rulesEn || !validator.isLength(dto.rulesEn, { min: 1, max: 1000000 })) {
      this.setState({ validationError: true, rulesEnError: true })
    }
    if (!dto.privacyPolicyPl || !validator.isLength(dto.privacyPolicyPl, { min: 1, max: 1000000 })) {
      this.setState({ validationError: true, privacyPolicyPlError: true })
    }
    if (!dto.privacyPolicyEn || !validator.isLength(dto.privacyPolicyEn, { min: 1, max: 1000000 })) {
      this.setState({ validationError: true, privacyPolicyEnError: true })
    }
    if (!dto.complaintsPl || !validator.isLength(dto.complaintsPl, { min: 1, max: 10000 })) {
      this.setState({ validationError: true, complaintsPlError: true })
    }
    if (!dto.complaintsEn || !validator.isLength(dto.complaintsEn, { min: 1, max: 10000 })) {
      this.setState({ validationError: true, complaintsEnError: true })
    }
    if (!dto.aboutRulesPl || !validator.isLength(dto.aboutRulesPl, { min: 1, max: 10000 })) {
      this.setState({ validationError: true, aboutRulesPlError: true })
    }
    if (!dto.aboutRulesEn || !validator.isLength(dto.aboutRulesEn, { min: 1, max: 10000 })) {
      this.setState({ validationError: true, aboutRulesEnError: true })
    }
    if (!dto.address || !validator.isLength(dto.address, { min: 1, max: 100000 })) {
      this.setState({ validationError: true, addressError: true })
    }
    if (!dto.timetable || !validator.isLength(dto.timetable, { min: 1, max: 100000 })) {
      this.setState({ validationError: true, timetableError: true })
    }
    if (!dto.aboutUs || !validator.isLength(dto.aboutUs, { min: 1, max: 1000000 })) {
      this.setState({ validationError: true, aboutUsError: true })
    }

  }

  // Aktualizuje stan komponentu w zakresie danych o antykwariacie.
  changeField (event) {
    let dto = this.state.config;
    dto[event.target.name] = event.target.value;
    this.setState({ user: dto });
  }

  // Usuwa z bazy danych nieaktualne wpisy.
  maintainDatabase() {
    get('/api/config/maintain').then(response => {
      switch (response.status) {
        case 204:
          this.props.global.openSnackbar(this.props.global.resources.admin_config_db);
          break;
      
        default:
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
          break;
      }
    })
  }

  // Renderuje zawartość podstrony.
  render() {    
    return this.state.configLoaded ? <div className={this.props.classes.formContainer}>  

      <FormControl>
        <TextField name={'rulesPl'} value={this.state.config.rulesPl} type={'text'} multiline className={this.props.classes.biginput} error={this.state.rulesPlError} label={this.props.global.resources.admin_config_rulesPl} onChange={e => this.changeField(e)}/><br/>
        {this.state.rulesPlError ? <Typography color={'error'} variant={'caption'}>{this.props.global.resources.admin_config_rulesPlError}</Typography> : false}
      </FormControl><br/><br/>

      <FormControl>
        <TextField name={'rulesEn'} value={this.state.config.rulesEn} type={'text'} multiline className={this.props.classes.biginput} error={this.state.rulesEnError} label={this.props.global.resources.admin_config_rulesEn} onChange={e => this.changeField(e)}/><br/>
        {this.state.rulesEnError ? <Typography color={'error'} variant={'caption'}>{this.props.global.resources.admin_config_rulesEnError}</Typography> : false}
      </FormControl><br/><br/>

      <FormControl>
        <TextField name={'privacyPolicyPl'} value={this.state.config.privacyPolicyPl} type={'text'} multiline className={this.props.classes.biginput} error={this.state.privacyPolicyPlError} label={this.props.global.resources.admin_config_privacyPolicyPl} onChange={e => this.changeField(e)}/><br/>
        {this.state.privacyPolicyPlError ? <Typography color={'error'} variant={'caption'}>{this.props.global.resources.admin_config_privacyPolicyPlError}</Typography> : false}
      </FormControl><br/><br/>

      <FormControl>
        <TextField name={'privacyPolicyEn'} value={this.state.config.privacyPolicyEn} type={'text'} multiline className={this.props.classes.biginput} error={this.state.privacyPolicyEnError} label={this.props.global.resources.admin_config_privacyPolicyEn} onChange={e => this.changeField(e)}/><br/>
        {this.state.privacyPolicyEnError ? <Typography color={'error'} variant={'caption'}>{this.props.global.resources.admin_config_privacyPolicyEnError}</Typography> : false}
      </FormControl><br/><br/>

      <FormControl>
        <TextField name={'complaintsPl'} value={this.state.config.complaintsPl} type={'text'} multiline className={this.props.classes.biginput} error={this.state.complaintsPlError} label={this.props.global.resources.admin_config_complaintsPl} onChange={e => this.changeField(e)}/><br/>
        {this.state.complaintsPlError ? <Typography color={'error'} variant={'caption'}>{this.props.global.resources.admin_config_complaintsPlError}</Typography> : false}
      </FormControl><br/><br/>

      <FormControl>
        <TextField name={'complaintsEn'} value={this.state.config.complaintsEn} type={'text'} multiline className={this.props.classes.biginput} error={this.state.complaintsEnError} label={this.props.global.resources.admin_config_complaintsEn} onChange={e => this.changeField(e)}/><br/>
        {this.state.complaintsEnError ? <Typography color={'error'} variant={'caption'}>{this.props.global.resources.admin_config_complaintsEnError}</Typography> : false}
      </FormControl><br/><br/>

      <FormControl>
        <TextField name={'aboutRulesPl'} value={this.state.config.aboutRulesPl} type={'text'} multiline className={this.props.classes.biginput} error={this.state.aboutRulesPlError} label={this.props.global.resources.admin_config_aboutRulesPl} onChange={e => this.changeField(e)}/><br/>
        {this.state.aboutRulesPlError ? <Typography color={'error'} variant={'caption'}>{this.props.global.resources.admin_config_aboutRulesPlError}</Typography> : false}
      </FormControl><br/><br/>

      <FormControl>
        <TextField name={'aboutRulesEn'} value={this.state.config.aboutRulesEn} type={'text'} multiline className={this.props.classes.biginput} error={this.state.aboutRulesEnError} label={this.props.global.resources.admin_config_aboutRulesEn} onChange={e => this.changeField(e)}/><br/>
        {this.state.aboutRulesEnError ? <Typography color={'error'} variant={'caption'}>{this.props.global.resources.admin_config_aboutRulesEnError}</Typography> : false}
      </FormControl><br/><br/>

      <FormControl>
        <TextField name={'address'} value={this.state.config.address} type={'text'} multiline className={this.props.classes.input} error={this.state.addressError} label={this.props.global.resources.admin_config_address} onChange={e => this.changeField(e)}/><br/>
        {this.state.addressError ? <Typography color={'error'} variant={'caption'}>{this.props.global.resources.admin_config_addressError}</Typography> : false}
      </FormControl><br/><br/>

      <FormControl>
        <TextField name={'timetable'} value={this.state.config.timetable} type={'text'} multiline className={this.props.classes.input} error={this.state.timetableError} label={this.props.global.resources.admin_config_timetable} onChange={e => this.changeField(e)}/><br/>
        {this.state.timetableError ? <Typography color={'error'} variant={'caption'}>{this.props.global.resources.admin_config_timetableError}</Typography> : false}
      </FormControl><br/><br/>

      <FormControl>
        <TextField name={'aboutUs'} value={this.state.config.aboutUs} type={'text'} multiline className={this.props.classes.input} error={this.state.aboutUsError} label={this.props.global.resources.admin_config_aboutUs} onChange={e => this.changeField(e)}/><br/>
        {this.state.aboutUsError ? <Typography color={'error'} variant={'caption'}>{this.props.global.resources.admin_config_aboutUsError}</Typography> : false}
      </FormControl><br/><br/>

      <FormControl>
        <Button onClick={() => this.openConfirmator()}>{this.props.global.resources.admin_config_configButton}</Button>
      </FormControl><br/><br/>

      <FormControl>
        <Button onClick={() => this.maintainDatabase()}>{this.props.global.resources.admin_config_maintain}</Button>
      </FormControl>

      <Modal open={this.state.confirmatorOpened} onClose={() => this.closeConfirmator()}>         
        <div className={this.props.classes.confirmationModalContent}>         
          <Typography variant={'h6'}>{this.props.global.resources.admin_config_question}</Typography><br/>
          <Button onClick={() => { this.changeConfig(); this.closeConfirmator(); }}>{this.props.global.resources.admin_common_yes}</Button>
          <Button onClick={() => this.closeConfirmator()}>{this.props.global.resources.admin_common_no}</Button>  
        </div>         
      </Modal>
      
    </div> : false;
  }
}

export default withStyles(styles)(AdminConfigForm);
