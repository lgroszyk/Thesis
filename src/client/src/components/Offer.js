import React, { Component } from 'react';
import { Typography } from '@material-ui/core';
import OfferForm from './OfferForm';
import { isLoggedIn } from '../auth/user';

// Komponent renderujący formularz do wysłania oferty sprzedaży książki do antykwariatu
class Offer extends Component {
  constructor(props) {
    super(props);
  }

  // Pobiera z serwera odpowiednie frazy do wyświetlenia na podstronie.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('offer', false);
  }

  // Renderuje formularz do wysłania oferty sprzedaży książki.
  render() {
    if (!isLoggedIn()) {
      return <Typography>
        {this.props.global.resources.user_offer_notLoggedIn}
      </Typography>
    }

    return <React.Fragment>
      <OfferForm global={this.props.global} {...this.props} />
    </React.Fragment>;
  }
}

export default Offer;
