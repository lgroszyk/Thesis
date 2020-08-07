import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import AdminOfferForm from './AdminOfferForm';

const styles = theme => ({
  formContainer: {
    margin: '20px'
  }
});

// Zwraca formularz dotyczący konkretnej oferty dla właściciela antykwariatu.
class AdminOfferDetails extends Component {
  constructor(props) {
    super(props);
  }

  // Pobiera z serwera odpowiednie frazy do wyświetlenia na podstronie.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('offerdetails', true);
  }

  // Zwraca formularz.
  render() {
    return <React.Fragment>
      <div className={this.props.classes.formContainer}>
        <AdminOfferForm add edit delete id={this.props.match.params.id} global={this.props.global} {...this.props} />
      </div>
    </React.Fragment>;
  }
}

export default withStyles(styles)(AdminOfferDetails);
