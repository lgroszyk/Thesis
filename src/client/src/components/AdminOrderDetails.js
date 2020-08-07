import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import AdminOrderForm from './AdminOrderForm';

const styles = theme => ({
  formContainer: {
    margin: '20px'
  }
});

// Zwraca formularz dotyczący konkretnego zamówienia.
class AdminOrderDetails extends Component {
  constructor(props) {
    super(props);
  }

  // Pobiera z serwera odpowiednie frazy do wyświetlenia na podstronie.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('orderdetails', true);
  }

  // Zwraca zawartość formularza.
  render() {
    return <React.Fragment>
      <div className={this.props.classes.formContainer}>
        <AdminOrderForm edit delete id={this.props.match.params.id} global={this.props.global} {...this.props} />
      </div>
    </React.Fragment>;
  }
}

export default withStyles(styles)(AdminOrderDetails);
