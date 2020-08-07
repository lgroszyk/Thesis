import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import AdminFileForm from './AdminFileForm';

const styles = theme => ({
  formContainer: {
    margin: '20px'
  }
});

// Zwraca formularz dotyczący konkretnego pliku.
class AdminFileDetails extends Component {
  constructor(props) {
    super(props);
  }

  // Zwraca odpowiedni formularz pliku.
  render() {
    return <React.Fragment>
      <div className={this.props.classes.formContainer}>
        <AdminFileForm id={this.props.match.params.id} global={this.props.global} {...this.props} />
      </div>
    </React.Fragment>;
  }
}

export default withStyles(styles)(AdminFileDetails);
