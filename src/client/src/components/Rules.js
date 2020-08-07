import React, { Component } from 'react';
import { withStyles, Typography } from '@material-ui/core';
import { get } from '../api/base';

const styles = theme => ({
  rulesWrapper: {
    whiteSpace: 'pre-wrap'
  }
});

// Komponent reprezentujący podstronę do wyświetlenia regulaminy strony.
class Rules extends Component {
  constructor(props) {
    super(props);

    this.state = {}
  }

  // Pobiera z serwera regulamin strony.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('rules', false);

    get('/api/config').then(response => {
      switch (response.status) {
        case 200:
          return response.json().then(data => {
            this.setState({ rulesPl: data.rulesPl, rulesEn: data.rulesEn, rulesLoaded: true });
          })
      
        default:
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);
          break;
      }
    })
  }

  // Renderuje zawartość komponentu.
  render() {
    return this.state.rulesLoaded ? <React.Fragment>
      <Typography variant={'h4'}>{this.props.global.resources.user_rules_header}</Typography><br/><br/>

      <Typography className={this.props.classes.rulesWrapper}>
        {this.props.global.currentLanguage === 'en' ? this.state.rulesEn : this.state.rulesPl}
      </Typography>
    </React.Fragment> : false;
  }
}

export default withStyles(styles)(Rules);
