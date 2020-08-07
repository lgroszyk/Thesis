import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import { get } from '../api/base';


// Komponent reprezntujący podstronę z informacjami o reklamacjach, zwrotach, polityce prywatności oraz krótkim opisem i odnośnikiem do regulaminu strony.
class Info extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  // Pobiera z serwera dane dotyczące zasad działania antykwariatu.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('info', false);

    get('/api/config').then(response => {
      switch (response.status) { 

        case 200:    
          return response.json().then(data => { 
            this.setState({ config: data, configLoaded: true });
          });

        default:
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);
          this.props.history.push('/admin');
          break;
      }
    });
  }

  // Renderuje zawartość podstrony.
  render() {
    return this.state.configLoaded ? <React.Fragment>
      <Typography variant={'h4'}>{this.props.global.resources.user_info_header}</Typography><br/><br/>

      <Typography variant={'h5'}>{this.props.global.resources.user_info_complaints}</Typography><br/>
      <Typography>{this.props.global.currentLanguage === 'en' ? this.state.config.complaintsEn : this.state.config.complaintsPl}</Typography>
      <br/><br/>
      
      <Typography  variant={'h5'}>{this.props.global.resources.user_info_privacyPolicy}</Typography><br/>
      <Typography style={{ whiteSpace: 'pre-wrap' }}>{this.props.global.currentLanguage === 'en' ? this.state.config.privacyPolicyEn : this.state.config.privacyPolicyPl}</Typography>
      <br/><br/>
      
      <Typography variant={'h5'}>{this.props.global.resources.user_info_rules}</Typography><br/>      
      <Typography>
        <Typography>{this.props.global.currentLanguage === 'en' ? this.state.config.aboutRulesEn : this.state.config.aboutRulesPl}</Typography>
          <Link to={'/rules'}>
          {this.props.global.resources.user_info_rulesLink}
          </Link>
      </Typography>

    </React.Fragment> : false;
  }
}

export default Info;
