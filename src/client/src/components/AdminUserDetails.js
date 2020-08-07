import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import AdminUserForm from './AdminuserForm';

const styles = theme => ({
  formContainer: {
    margin: '20px'
  }
});

// Zwraca formularz dotyczący użytkownika strony.
class AdminUserDetails extends Component {
  constructor(props) {
    super(props);
  }

  // Pobiera z serwera odpowiednie frazy do wyświetlenia na podstronie.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('userdetails', true);
  }

  // Zwraca odpowiedni formularz, w zależności od właściwości komponentu.
  render() {
    return <React.Fragment>
      <div className={this.props.classes.formContainer}>
        {this.props.add
          ? <AdminUserForm add id={0} global={this.props.global} {...this.props} />
          : <AdminUserForm delete id={this.props.match.params.id} global={this.props.global} {...this.props} />}
      </div>
    </React.Fragment>;
  }
}

export default withStyles(styles)(AdminUserDetails);
