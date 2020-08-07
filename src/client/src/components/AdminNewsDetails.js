import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import AdminNewsForm from './AdminNewsForm';

const styles = theme => ({
  formContainer: {
    margin: '20px'
  }
});

// Zwraca formularz dotyczący aktualności o antykwariacie.
class AdminNewsDetails extends Component {
  constructor(props) {
    super(props);
  }

  // Pobiera z serwera odpowiednie frazy do wyświetlenia na podstronie.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('newsdetails', true);
  }

  // Zwraca odpowiedni formularz, w zależności od właściwości komponentu.
  render() {
    return <React.Fragment>
      <div className={this.props.classes.formContainer}>
        {this.props.add
          ? <AdminNewsForm add id={0} global={this.props.global} {...this.props} />
          : <AdminNewsForm edit delete id={this.props.match.params.id} global={this.props.global} {...this.props} />}
      </div>
    </React.Fragment>;
  }
}

export default withStyles(styles)(AdminNewsDetails);
